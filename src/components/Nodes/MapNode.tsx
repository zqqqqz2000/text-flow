import { Box, Center } from "@chakra-ui/react";
import { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { PartialNodeProps } from "./types";

export const MapNode: React.FC<PartialNodeProps> = memo(({ data }) => {
    return <Box border='1px solid #777' p={5} h={1} w={200}>
        {data?.withHandle && <Handle
            type="target"
            position={Position.Left}
            id="map-input"
            isConnectable={true}
        />}
        <Center h="100%">
            Map
        </Center>
        {data?.withHandle && <Handle
            type="source"
            position={Position.Right}
            id="map-output"
            isConnectable={true}
        />}
    </Box>;
});