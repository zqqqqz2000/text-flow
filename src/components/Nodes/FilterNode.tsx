import { Box, Center } from "@chakra-ui/react";
import { memo } from "react";
import { Handle, Position, WrapNodeProps } from "react-flow-renderer";
import { NodeData } from "./types";

export const FilterNode: React.FC<Partial<WrapNodeProps<NodeData>>> = memo(({ data, selected }) => {
    return <Box border={selected ? '3px solid #777' : '1px solid #777'} p={5} h={1} w={200}>
        {data?.withHandle && <Handle
            id="filter-input"
            type="target"
            position={Position.Left}
            isConnectable={true}
        />}
        <Center h="100%">
            Filter
        </Center>
        {data?.withHandle && <Handle
            id="filter-output"
            type="source"
            position={Position.Right}
            isConnectable={true}
        />}
    </Box>;
});