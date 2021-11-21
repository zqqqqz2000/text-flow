import { FileTrunkReader } from "./fileTrunkReader";
import { stepPartialFunc } from "./func";

export class FlowProcessor {
    public lastRemain = '';
    public readonly nodes: Set<ProcessorChainNode> = new Set();
    constructor(
        public processChain: ProcessorChainNode,
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
        return circle;
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
        this.processChain.process({ input: splitted, debug });
    }

    public run(fileTrunkReader: FileTrunkReader) {
    }
};

export type ProcessorInput = { input: unknown, debug?: boolean };

export class ProcessorChainNode {
    public process: (args: { [index: string]: any }) => void;
    public reset: () => void;
    public output?: unknown;
    public input?: ProcessorInput;
    public error?: unknown;

    constructor(
        public childNodes: Set<ProcessorChainNode>,
        private processor: (args: ProcessorInput) => unknown,
        private processorArgsSign: string[],
    ) {
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
