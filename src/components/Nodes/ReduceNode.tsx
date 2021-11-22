import { Box, Center } from "@chakra-ui/react";
import { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { PartialNodeProps } from "./types";

export const ReduceNode: React.FC<PartialNodeProps> = memo(({ data }) => {
    return <Box border='1px solid #777' p={5} h={1} w={200}>
        {data?.withHandle && <Handle
            type="source"
            position={Position.Left}
            id="reduce-input"
            isConnectable={true}
        />}
        <Center h="100%">
            Reduce
        </Center>
        {data?.withHandle && <Handle
            type="source"
            position={Position.Right}
            id="reduce-output"
            isConnectable={true}
        />}
    </Box>;
});