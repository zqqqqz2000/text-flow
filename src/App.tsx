import { AddIcon, ArrowRightIcon } from "@chakra-ui/icons";
import streamSaver from 'streamsaver';
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Text, Stack, Textarea } from "@chakra-ui/react";
import { FileTrunkReader } from "./utils/fileTrunkReader";
import { FileUpload } from "./components/FileUpload";
import 'flexlayout-react/style/light.css';
import { IJsonModel, Layout, Model } from "flexlayout-react";
import { DisplayRange, DisplayRangeSelector } from "./components/DisplayRangeSelector";
import { useThrottle } from "react-use";
import { TextFlow } from "./components/Flow";
import { FlowProcessor } from "./utils/flowProcessor";
import { textSplit } from "./utils/func";

const validateFiles = (value: FileList) => {
  if (value.length < 1) {
    return 'Files is required'
  }
  return true
}

const save = async (trunkReader: FileTrunkReader, saver: WritableStream) => {
  const writer = saver.getWriter();
  const uInt8Encoder = new TextEncoder();
  while (true) {
    const { value, done } = await trunkReader.next();
    await writer.write(uInt8Encoder.encode(value + 'aaa'));
    if (done) {
      break;
    }
  }
  await writer.close();
};

type FormValues = {
  file_: FileList
}

const modelJson: IJsonModel = {
  global: { tabEnableClose: false },
  borders: [
    {
      type: "border",
      location: "bottom",
      size: 300,
      children: [
        {
          type: "tab",
          name: "Processes",
          component: "Flow"
        }
      ]
    }
  ],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "row",
        children: [
          {
            type: "tabset",
            weight: 50,
            selected: 0,
            children: [
              {
                type: "tab",
                name: "Input",
                component: "Input"
              }
            ],
          },
          {
            type: "tabset",
            weight: 20,
            selected: 0,
            children: [
              {
                type: "tab",
                name: "View",
                component: "View"
              }
            ],
          }
        ]
      },
      {
        type: "tabset",
        weight: 50,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "Output",
            component: "Output"
          }
        ]
      }
    ]
  }
};

function App() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [fileTrunkReader, setCurrentFileTrunkReader] = useState<FileTrunkReader | undefined>(undefined);
  const [fileContent, setFileContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const flowProcessor = useMemo(
    () => {
      return new FlowProcessor(
        textSplit
      );
    }, []);

  const onSubmit = handleSubmit((data) => {
    const file = data.file_[0];
    const trunkReader = new FileTrunkReader(file, 10240);
    setCurrentFileTrunkReader(trunkReader);
  });

  const [model, setModel] = useState<Model>(Model.fromJson(modelJson));
  const [displayRange_, setDisplayRange] = useState<DisplayRange>({
    offset: 0,
    limit: 0,
  });
  const displayRange = useThrottle(displayRange_, 200);
  useEffect(() => {
    if (fileTrunkReader) {
      fileTrunkReader.currentSliceStart = displayRange.offset;
      fileTrunkReader.trunkSize = displayRange.limit;
      fileTrunkReader.next().then(({ value }) => {
        setFileContent(value);
      })
    }
  }, [displayRange, fileTrunkReader]);
  const componentMap: Record<string, React.ReactNode> = {
    View: <Stack p={5}>
      <DisplayRangeSelector maxLimit={1024 * 128} onChange={setDisplayRange} size={fileTrunkReader?.file?.size} />
    </Stack>,
    Input: <Stack h="100%" p={5}>
      <Textarea value={fileContent} style={{ height: '100%' }} />
      <FileUpload
        accept={'*'}
        multiple
        onUpload={() => onSubmit()}
        register={register('file_', { validate: validateFiles })}
      >
        <Button
          width='100%'
          leftIcon={<AddIcon />}>
          Upload
          <Text as='div' overflow='hidden' color="red" pl={2} textOverflow='ellipsis'>
            {fileTrunkReader?.file?.name && ` (${fileTrunkReader?.file?.name})`}
          </Text>
        </Button>
      </FileUpload>
      {errors?.file_ && errors.file_.message}
      <Button
        leftIcon={<ArrowRightIcon />}
        isLoading={saving}
        onClick={async () => {
          if (fileTrunkReader) {
            fileTrunkReader.reset();
            setSaving(true);
            const saver = streamSaver.createWriteStream('test.txt');
            await save(fileTrunkReader, saver);
            setSaving(false);
          }
        }}>Run</Button>
    </Stack>,
    Flow: <TextFlow
      flowProcessor={flowProcessor}
    />,
  };
  return <>
    <div style={{ height: '100vh' }}>
      <Layout model={model}
        factory={(node) => {
          let component = node.getComponent() ?? '';
          return componentMap[component];
        }} />
    </div>
  </>;
}

export default App;
