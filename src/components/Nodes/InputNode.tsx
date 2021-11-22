import { Box, Center } from "@chakra-ui/react";
import { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { PartialNodeProps } from "./types";

export const InputNode: React.FC<PartialNodeProps> = memo(({ data }) => {
    return <Box border='1px solid #777' p={10} h={10} w={200}>
        <Center h="100%">
            Text Source<br />
            Split Function
        </Center>
        {data?.withHandle && <Handle
            type="source"
            position={Position.Right}
            id="source-output"
            isConnectable={true}
        />}
    </Box>;
});