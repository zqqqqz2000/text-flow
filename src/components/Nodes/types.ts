import { WrapNodeProps } from "react-flow-renderer";

export type NodeData = {
    withHandle?: boolean;
    id: string;
};

export type PartialNodeProps<T extends NodeData = NodeData> = Partial<WrapNodeProps<T>>;
