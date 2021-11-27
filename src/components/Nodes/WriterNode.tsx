import { Box, Center } from "@chakra-ui/react";
import { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { PartialNodeProps } from "./types";

export const WriterNode: React.FC<PartialNodeProps> = memo(({ data, selected }) => {
    return <Box border={selected ? '3px solid #777' : '1px solid #777'} p={5} h={1} w={200}>
        {data?.withHandle && <Handle
            id="writer-input"
            type="target"
            position={Position.Left}
            isConnectable={true}
        />}
        <Center h="100%">
            Writer
        </Center>
    </Box>;
});