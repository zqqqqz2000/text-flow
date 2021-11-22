import React, { memo, useEffect, useState, DragEvent, useRef, useCallback } from 'react';
import { Center, Square, Stack } from '@chakra-ui/layout';
import { Box, StackDivider } from '@chakra-ui/react';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/ext-language_tools";
import ReactFlow, { addEdge, Controls, Elements as FlowElements, FlowElement, Handle, MiniMap, OnLoadParams, Position, removeElements } from 'react-flow-renderer';
import { FlowProcessor, ProcessorChainNode } from '../utils/flowProcessor';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-tomorrow";
import { defaultSplit } from '../utils/codeDemo';
import { InputNode } from './Nodes/InputNode';
import { MapNode } from './Nodes/MapNode';
import { FilterNode } from './Nodes/FilterNode';
import { ReduceNode } from './Nodes/ReduceNode';
import { JoinNode } from './Nodes/JoinNode';
import { ProcessNode } from './Nodes/ProcessNode';

export type TextFlowTextProps = {
    flowProcessor: FlowProcessor;
};

const nodeTypes = {
    MapNode,
    FilterNode,
    InputNode,
    JoinNode,
    ProcessNode,
    ReduceNode,
};

const SideBar: React.FC = () => {
    const onDragStart = (event: DragEvent, nodeType: string) => {
        const dataTransfer = event?.dataTransfer;
        if (dataTransfer) {
            event.dataTransfer.setData('application/reactflow', nodeType);
            event.dataTransfer.effectAllowed = 'move';
        }
    };
    return <Stack w="300px" height="100%" spacing={4} p={2}>
        <Box onDragStart={(event) => onDragStart(event, 'MapNode')} draggable>
            <MapNode data={{}} />
        </Box>
        <Box onDragStart={(event) => onDragStart(event, 'FilterNode')} draggable>
            <FilterNode />
        </Box>
        <Box onDragStart={(event) => onDragStart(event, 'ReduceNode')} draggable>
            <ReduceNode data={{}} />
        </Box>
        <Box onDragStart={(event) => onDragStart(event, 'JoinNode')} draggable>
            <JoinNode data={{}} />
        </Box>
        <Box onDragStart={(event) => onDragStart(event, 'ProcessNode')} draggable>
            <ProcessNode data={{}} />
        </Box>
    </Stack>
};

let id = 0;
const getId = () => `processor-${id++}`;

export const TextFlow: React.FC<TextFlowTextProps> = ({ flowProcessor }) => {
    const [elements, setElements] = useState<FlowElements>([]);
    const [nodeElementInfo, setNodeElementInfo] = useState<Map<ProcessorChainNode, FlowElement>>(new Map());
    const [currentElement, setCurrentElement] = useState<FlowElement | undefined>(undefined);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams | undefined>(undefined);
    useEffect(() => {
        const newElements: FlowElements = [];
        let rootElement = nodeElementInfo.get(flowProcessor.processChain);
        if (!rootElement) {
            rootElement = {
                id: 'root',
                type: 'InputNode',
                data: { code: defaultSplit, withHandle: true },
                position: { x: 0, y: 0 },
                sourcePosition: Position.Right,
            };
            nodeElementInfo.set(flowProcessor.processChain, rootElement);
        }
        newElements.push(rootElement);
        setElements(newElements);
    }, [flowProcessor, nodeElementInfo]);
    const onLoad = (_reactFlowInstance: OnLoadParams) =>
        setReactFlowInstance(_reactFlowInstance);

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };
    const onDrop = (event: DragEvent) => {
        event.preventDefault();
        if (reactFlowWrapper.current && reactFlowInstance) {
            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');
            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top ?? 0,
            });
            const newNode = {
                id: getId(),
                type,
                position,
                data: { withHandle: true },
            };

            setElements((es) => es.concat(newNode));
        }
    };

    const onElementsRemove = useCallback(
        (elementsToRemove) =>
            setElements((els) => removeElements(elementsToRemove, els)),
        []
    );
    const onConnect = useCallback(
        (params) => {
            setElements((els) => {
                return addEdge({ ...params, animated: true, style: { stroke: 'black' } }, els);
            });
        }, []
    );
    return <Stack
        h="100%"
        w="100%"
        divider={<StackDivider borderColor="gray.200" />}
        spacing={4}
        direction='row'
    >
        <AceEditor
            height="100%"
            width="900px"
            placeholder="javascript process code"
            mode="javascript"
            theme="tomorrow"
            name="blah2"
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            value={currentElement?.data?.code ?? ''}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
            }} />
        <SideBar />
        <ReactFlow
            elementsSelectable={true}
            onLoad={onLoad}
            onDragOver={onDragOver}
            ref={reactFlowWrapper}
            onDrop={onDrop}
            onElementsRemove={onElementsRemove}
            onConnect={onConnect}
            onElementClick={(_, element) => { setCurrentElement(element) }}
            defaultZoom={0.7}
            nodeTypes={nodeTypes}
            style={{ height: '100%', width: '100%' }}
            elements={elements}
        >
            <MiniMap
                nodeStrokeColor={(n) => {
                    if (n.type === 'InputNode') return '#0041d0';
                    return "black";
                }}
                nodeColor={(n) => {
                    if (n.type === 'InputNode') return '#0041d0';
                    return '#fff';
                }}
            />
            <Controls />
        </ReactFlow>
    </Stack>;
};