import { FileTrunkReader } from "./fileTrunkReader";
import { stepPartialFunc } from "./func";

export class FlowProcessor {
    public lastRemain = '';
    public processChain?: ProcessorChainNode;
    public readonly nodes: Set<ProcessorChainNode> = new Set();

    constructor(
        public splitFunc: (content: string) => string[],
    ) {
        this.walk(n => {
            this.nodes.add(n);
            return true;
        });
    };

    public attachChild(parentNode: ProcessorChainNode, childNode: ProcessorChainNode) {
        const circle = !this.walk((n) => {
            if (n === parentNode) {
                return false;
            }
            return true;
        }, childNode);
        if (!circle) {
            this.nodes.add(parentNode);
            parentNode.childNodes.add(childNode);
        }
        return !circle;
    }

    public detachChild(parentNode: ProcessorChainNode, childNode: ProcessorChainNode) {
        parentNode.childNodes.delete(childNode);
    }

    public addNode(node: ProcessorChainNode) {
        this.nodes.add(node);
    }

    public removeNode(node: ProcessorChainNode) {
        this.walk((n, p) => {
            if (n === node) {
                p.childNodes.delete(node);
            }
            return true;
        });
        this.nodes.delete(node);
    }

    public walk(process: (node: ProcessorChainNode, parent: ProcessorChainNode) => boolean, root?: ProcessorChainNode) {
        const rootNode = root ?? this.processChain;
        if (!rootNode) {
            return;
        }
        const walkHelper = (node: ProcessorChainNode) => {
            try {
                node.childNodes.forEach(n => {
                    if (!(process(n, node) && walkHelper(n))) {
                        throw new Error('break');
                    }
                });
            } catch (e_) {
                let e = e_ as Error;
                if (e.message !== 'break') {
                    throw e;
                } else {
                    return false;
                }
            }
            return true;
        };
        return walkHelper(rootNode);
    }

    public reset() {
        this.lastRemain = '';
    }

    public process(content: string, debug: boolean = false) {
        let splitted = this.splitFunc(content);
        splitted[0] = this.lastRemain + splitted[0];
        this.lastRemain = splitted[splitted.length - 1];
        splitted = splitted.slice(1, splitted.length - 1);
        this.processChain?.process({ input: splitted, debug });
    }

    public run(fileTrunkReader: FileTrunkReader) {
    }
};

export type ProcessorInput = { debug?: boolean, arr?: unknown[], [key: string]: unknown };

const processWarpFuncMap = {
    map: (argsOuter: { func: (current: unknown, index: number, array: unknown[]) => unknown }) => {
        return (args: ProcessorInput) => args?.arr?.map(argsOuter.func);
    },
    reduce: (argsOuter: { func: (accumulator: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown, initialValue?: unknown }) => {
        return (args: ProcessorInput) => args?.arr?.reduce(argsOuter.func, args.initialValue);
    },
    filter: (argsOuter: { func: (current: unknown, index: number, array: unknown[]) => boolean }) => {
        return (args: ProcessorInput) => args?.arr?.filter(argsOuter.func);
    },
    join: (argsOuter: { separator: string }) => {
        return (args: ProcessorInput) => args?.arr?.join(argsOuter.separator);
    },
    process: (argsOuter: { func: (input: ProcessorInput) => unknown }) => {
        return argsOuter.func;
    },
    writer: (argsOuter: { debug: boolean }) => {
        return () => { };
    },
    input: (argsOuter: {}) => {
        return '';
    },
};

export type KeyofProcessWarpFuncMap = keyof typeof processWarpFuncMap;

export class ProcessorChainNode<T extends KeyofProcessWarpFuncMap = any> {
    public process: (args: { [index: string]: any }) => void;
    public reset: () => void;
    public output?: unknown;
    public input?: ProcessorInput;
    public error?: unknown;
    private processor: (args: ProcessorInput) => unknown;

    constructor(
        public childNodes: Set<ProcessorChainNode>,
        processorGenParam: Parameters<(typeof processWarpFuncMap)[T]>[0],
        public readonly nodeType: T,
        private processorArgsSign: string[],
    ) {
        const warpFunc = processWarpFuncMap[nodeType];
        // @ts-ignore
        this.processor = warpFunc(processorGenParam);
        const { func, reset } = stepPartialFunc(this.process_, this.processorArgsSign);
        this.process = func;
        this.reset = reset;
    }

    private process_(args: ProcessorInput) {
        let output: unknown;
        let error: unknown;
        try {
            output = this.processor(args);
        } catch (e) {
            error = e;
        }
        if (args.debug) {
            this.input = args;
            this.output = output;
            this.error = error;
        }
        if (!error && output) {
            this.childNodes.forEach(node => node.process({ input: output, debug: args.debug }));
        }
    }
};
