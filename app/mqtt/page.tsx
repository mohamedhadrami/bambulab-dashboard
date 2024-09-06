'use client';

import { Button, Card, CardBody, Radio, RadioGroup, Select, SelectItem, Selection } from '@nextui-org/react';
import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { BambuDevice } from '@/types/bambuApi/bambuApi';
import { CheckCircle, Copy, List, Plug, Unplug, XCircle } from 'lucide-react';
import MonacoEditor, { loader } from '@monaco-editor/react';
import { toast } from 'sonner';
import { infoGetVersion, printPushStatus, printUnloadFilament, systemLedCtrl } from '@/services/bambuMqtt';

// Define your custom theme
const defineCustomTheme = (monaco: any) => {
  monaco.editor.defineTheme('bambuTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: 'ffa500', fontStyle: 'italic' },
      { token: 'keyword', foreground: '00ff00' },
      { token: 'string', foreground: 'ff0000' },
      { token: 'variable', foreground: '00ffff' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#ff0000',
      'editorCursor.foreground': '#ffffff',
      'editor.lineHighlightBackground': '#2b2b2b',
      'editorLineNumber.foreground': '#858585',
      'editor.selectionBackground': '#264f78',
    }
  });
};

const MqttPage: React.FC = () => {
  const { printers, isMqttConnected, subscribedTopics, latestMessage, connect, disconnect, publish, subscribe, unsubscribe } = useWebSocket();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [response, setResponse] = useState();
  const [reportTopic, setReportTopic] = useState<string>("")
  const [requestTopic, setRequestTopic] = useState<string>("")

  const [hasSubscribed, setHasSubscribed] = useState<boolean>(false);

  useEffect(() => {
    if (isMqttConnected) {
      if (!hasSubscribed) {
        subscribedTopics.map((topic: string) => (
          unsubscribe(topic)
        ))
        subscribe(selectedDevice);
        setReportTopic(`device/${selectedDevice}/report`);
        setRequestTopic(`device/${selectedDevice}/request`);
        setHasSubscribed(true);
      }
    }
  }, [selectedDevice]);

  useEffect(() => {
    if (subscribedTopics.includes(reportTopic) && subscribedTopics.includes(requestTopic)) {
      setHasSubscribed(false);
    }
  }, [subscribedTopics])


  useEffect(() => {
    if (latestMessage) {
      if (latestMessage.topic == `device/${selectedDevice}/report`) {
        if (latestMessage.data) {
          setResponse(latestMessage.data)
        }
      }
    }
  }, [latestMessage, selectedDevice])


  const handleConnection = () => {
    if (isMqttConnected) disconnect();
    else connect();
  }

  const publishMessage = () => {
    if (selectedDevice && message) {
      try {
        publish(selectedDevice, JSON.parse(message))
      } catch (e) {
        console.error('Invalid JSON', e);
      }
    }
  }

  useEffect(() => {
    loader.init().then((monaco) => {
      defineCustomTheme(monaco);
    });
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 4))
    toast.info("Copied to clipboard")
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className='flex flex-row justify-between'>
        <Card className="max-w-md bg-primary-700">
          <CardBody>
            <div className="flex items-center gap-2">
              <List size={24} />
              <h2>Subscribed Topics</h2>
            </div>
            <ul className="list-disc list-inside">
              {subscribedTopics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <div className="flex flex-col items-end gap-3">
          {isMqttConnected ? (
            <CheckCircle className="text-success" size={24} />
          ) : (
            <XCircle className="text-danger" size={24} />
          )}
          <Button
            variant="ghost"
            color={isMqttConnected ? "danger" : "secondary"}
            onClick={handleConnection}
            startContent={isMqttConnected ? <Unplug /> : <Plug />}
          >
            {isMqttConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-grow">
          <Select
            label="Select a printer"
            placeholder="Select a message"
            variant="bordered"
            value={selectedDevice}
            className="max-w-xs"
            onSelectionChange={(keys) => {
              const key = Array.from(keys).join("");
              setSelectedDevice(key);
            }}
          >
            {printers.length > 0
              ? printers.map((printer: BambuDevice) => (
                <SelectItem color="secondary" key={printer.dev_id}>
                  {printer.dev_id}
                </SelectItem>
              ))
              : []}
          </Select>
        </div>
        <div className="flex-grow flex justify-center">
          <LoadSampleMessage setMessage={setMessage} currentMessage={message} />
        </div>
        <div className="flex-grow flex justify-end">
          <Button variant="ghost" color="secondary" isDisabled={selectedDevice === ""} onClick={publishMessage}>
            Publish
          </Button>
        </div>
      </div>
      {isMqttConnected && (
        <>
          <div className="flex flex-row items-center">
            <div className="w-1/2">
              <p className="text-center text-lg font-thin">Requests</p>
            </div>
            <div className="w-1/2 flex flex-row items-center justify-between">
              <p className="text-lg font-thin text-center flex-grow">Reports</p>
              <Button variant="ghost" color="secondary" isIconOnly onClick={handleCopyToClipboard}>
                <Copy />
              </Button>
            </div>
          </div>

          <div className="w-full rounded-md overflow-hidden flex flex-grow gap-3 h-full">
            <div className="flex-grow overflow-hidden">
              <MonacoEditor
                height="100%"
                language="json"
                theme="bambuTheme"
                value={message}  // Start with the sample message
                onChange={(newValue) => setMessage(newValue || '')}  // Allow editing and sync with state
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  autoIndent: "brackets",
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />

            </div>
            <div className="flex-grow overflow-hidden">
              <MonacoEditor
                height="100%"
                language="json"
                theme="vs-dark"
                value={JSON.stringify(response, null, 4)}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  autoIndent: "brackets",
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </div>


        </>
      )}
    </div>
  );
};

export default MqttPage;


interface LoadSampleMessageProps {
  setMessage: (message: string) => void;
  currentMessage: string;
}

const LoadSampleMessage: React.FC<LoadSampleMessageProps> = ({ setMessage, currentMessage }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const samples = [
    { key: "printPushStatus", data: printPushStatus() },
    { key: "infoGetVersion", data: infoGetVersion() },
    { key: "printUnloadFilament", data: printUnloadFilament() },
    { key: "systemLedCtrl", data: systemLedCtrl("chamber_light", "on") }
  ];

  useEffect(() => {
    if (selectedKey) {
      const selectedSample = samples.find(sample => sample.key === selectedKey);
      if (selectedSample) {
        setMessage(JSON.stringify(selectedSample.data, null, 4));
      }
    }
  }, [selectedKey, setMessage]);

  return (
    <Select
      label="Sample Messages"
      variant="bordered"
      placeholder="Select a message"
      selectedKeys={selectedKey ? [selectedKey] : []}
      className="max-w-xs"
      onSelectionChange={(keys) => {
        const key = Array.from(keys).join("");
        setSelectedKey(key);
      }}
    >
      {samples.map(sample => (
        <SelectItem key={sample.key} value={sample.key}>
          {sample.key}
        </SelectItem>
      ))}
    </Select>
  );
};
