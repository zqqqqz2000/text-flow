import React, { memo, useEffect, useState, DragEvent, useRef } from 'react';
import { Center, Square, Stack } from '@chakra-ui/layout';
import { StackDivider } from '@chakra-ui/react';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/ext-language_tools";
import ReactFlow, { Controls, Elements as FlowElements, FlowElement, Handle, MiniMap, OnLoadParams, Position } from 'react-flow-renderer';
import { FlowProcessor, ProcessorChainNode } from '../utils/flowProcessor';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-tomorrow";
import { defaultSplit } from '../utils/codeDemo';

export type TextFlowTextProps = {
    flowProcessor: FlowProcessor;
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
        <Square p={2} border="1px solid black" onDragStart={(event) => onDragStart(event, 'map')} draggable>
            Map
        </Square>
        <Square p={2} border="1px solid black" onDragStart={(event) => onDragStart(event, 'filter')} draggable>
            Filter
        </Square>
        <Square p={2} border="1px solid black" onDragStart={(event) => onDragStart(event, 'reduce')} draggable>
            Reduce
        </Square>
        <Square p={2} border="1px solid black" onDragStart={(event) => onDragStart(event, 'join')} draggable>
            Join
        </Square>
        <Square p={2} border="1px solid black" onDragStart={(event) => onDragStart(event, 'process')} draggable>
            Process
        </Square>
    </Stack>
};

const TextInputNode: React.FC<{ data: {}, isConnectable: boolean }> = memo(({ data }) => {
    return <>
        <Center h="100%">
            Text Source<br />
            Split Function
        </Center>
        <Handle
            type="source"
            position={Position.Right}
            id="source-output"
            isConnectable={true}
        />
    </>;
});

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
                type: 'TextInputNode',
                style: { border: '1px solid #777', padding: 10, height: 60, width: 200 },
                data: { code: defaultSplit },
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
                data: { label: `${type} node` },
            };

            setElements((es) => es.concat(newNode));
        }
    };
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
            value={currentElement?.data?.code}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
            }} />
        <SideBar />
        <ReactFlow
            snapToGrid={true}
            onLoad={onLoad}
            onDragOver={onDragOver}
            ref={reactFlowWrapper}
            onDrop={onDrop}
            snapGrid={[10, 20]}
            onElementClick={(_, element) => { setCurrentElement(element) }}
            defaultZoom={0.7}
            nodeTypes={{
                TextInputNode,
            }}
            style={{ height: '100%', width: '100%' }}
            elements={elements}
        >
            <MiniMap
                nodeStrokeColor={(n) => {
                    if (n.type === 'input') return '#0041d0';
                    if (n.type === 'TextInputNode') return '#0041d0';
                    if (n.type === 'output') return '#ff0072';
                    return "";
                }}
                nodeColor={(n) => {
                    if (n.type === 'TextInputNode') return '#0041d0';
                    return '#fff';
                }}
            />
            <Controls />
        </ReactFlow>
    </Stack>;
};