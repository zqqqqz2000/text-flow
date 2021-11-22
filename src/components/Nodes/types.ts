import { WrapNodeProps } from "react-flow-renderer";

export type NodeData = {
    withHandle?: boolean;
};

export type PartialNodeProps<T extends NodeData = NodeData> = Partial<WrapNodeProps<T>>;
