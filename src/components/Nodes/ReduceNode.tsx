import { Box, Center } from "@chakra-ui/react";
import { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { NodeData } from "./types";

export const ReduceNode: React.FC<{ data: NodeData }> = memo(({ data }) => {
    return <Box border='1px solid #777' p={5} h={1} w={200}>
        <Center h="100%">
            Reduce
        </Center>
        {data.withHandle && <Handle
            type="source"
            position={Position.Right}
            id="source-output"
            isConnectable={true}
        />}
    </Box>;
});