import { RepeatIcon } from "@chakra-ui/icons";
import { Box, Text, Center, IconButton } from "@chakra-ui/react";
import { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { NodeData, PartialNodeProps } from "./types";

export const InputNode: React.FC<PartialNodeProps<NodeData & { onReset: (nodeId: string) => void }>> = memo(({ data }) => {
    return <Box border='1px solid #777' p={10} h={10} w={200}>
        <Center h="100%">
            <Text>
                Text Source
                With Split
            </Text>
            <IconButton
                colorScheme="teal"
                aria-label="reset split code"
                size="xs"
                onClick={() => data?.onReset?.(data?.id)}
                icon={<RepeatIcon />}
            />
        </Center>
        {data?.withHandle && <Handle
            type="source"
            position={Position.Right}
            id="source-output"
            isConnectable={true}
        />}
    </Box>;
});