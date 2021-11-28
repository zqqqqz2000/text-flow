import { WrapNodeProps } from "react-flow-renderer";
import { ProcessorChainNode } from "../../utils/flowProcessor";

export type NodeData = {
    withHandle?: boolean;
    id: string;
    processorChianNode: ProcessorChainNode;
};

export type PartialNodeProps<T extends NodeData = NodeData> = Partial<WrapNodeProps<T>>;
