// @/contexts/WebSocketContext.tsx

'use client';

import { BambuDevice } from '@/types/bambuApi/bambuApi';
import React, { createContext, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

interface WebSocketContextProps {
    printers: BambuDevice[];
    ws: WebSocket | null;
    messages: { topic: string; data: any }[];
    latestMessage: { topic: string; data: any } | null;
    isConnected: boolean;
    isMqttConnected: boolean;
    subscribedTopics: string[];
    connect: () => void;
    disconnect: () => void;
    subscribe: (topic: string) => void;
    unsubscribe: (topic: string) => void;
    publish: (id: string, command: any) => void;
    userPublish: (id: string, command: any) => void;
}

export const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [printers, setPrinters] = useState<BambuDevice[]>([])
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<{ topic: string; data: any }[]>([]);
    const [latestMessage, setLatestMessage] = useState<{ topic: string; data: any } | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMqttConnected, setIsMqttConnected] = useState(false);
    const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
    const sequenceIdRef = useRef<number>(3);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setWs(socket);

        socket.onopen = () => {
            setIsConnected(true);
            fetchCookies(socket);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.topic && data.message) {
                const messageData = JSON.parse(data.message);
                //setMessages((prevMessages) => [...prevMessages, { topic: data.topic, data: messageData }]);
                setLatestMessage({ topic: data.topic, data: messageData });

                //console.log(messageData)

                const messageSequenceId = getSequenceIdFromMessage(messageData);
                if (messageSequenceId) {
                    if (parseInt(messageSequenceId.sequence_id) === sequenceIdRef.current) {
                        if (messageSequenceId.result.toLowerCase() == "success") {
                            toast.success(`Success for ${sequenceIdRef.current}`);
                        } else {
                            toast.error(`Failed for ${sequenceIdRef.current}`);
                        }
                    }
                }
            }
            if (data.action === "subscriptions") {
                setSubscribedTopics(data.topics)
            }
            if (data.action === 'mqtt_connected') {
                setIsMqttConnected(true);
            }
            if (data.action === 'mqtt_disconnected') {
                setIsMqttConnected(false);
                setMessages([]);
                setSubscribedTopics([]);
            }
        };

        socket.onclose = () => {
            setIsConnected(false);
        };

        return () => {
            socket.close();
        };
    }, []);

    const fetchCookies = async (socket: WebSocket) => {
        const usernameRes = await fetch('/api/cookies?param=username');
        const tokenRes = await fetch('/api/cookies?param=access_token');
        const printersRes = await fetch('/api/cookies?param=printers');

        if (usernameRes.ok && tokenRes.ok) {
            const username = await usernameRes.json();
            const accessToken = await tokenRes.json();

            if (username && accessToken) {
                handleConnect(socket, username.data.value, accessToken.data.value);
            }

            if (printersRes.ok) {
                const printers = await printersRes.json();
                if (printers && printers.data.value) {
                    const devices: BambuDevice[] = JSON.parse(printers.data.value);
                    setPrinters(devices)
                    /*devices.forEach((device: any) => {
                        handleSubscribe(socket, `device/${device.dev_id}/report`);
                        handleSubscribe(socket, `device/${device.dev_id}/request`);
                    });*/
                }
            }
        }
    };

    const handleConnect = (socket: WebSocket, username: string, password: string) => {
        if (socket) {
            socket.send(JSON.stringify({ action: 'connect', username, password }));
        }
    };

    const handleSubscribe = (socket: WebSocket, topic: string) => {
        if (socket && !subscribedTopics.includes(topic)) {
            socket.send(JSON.stringify({ action: 'subscribe', topic }));
            //setSubscribedTopics((prevTopics) => [...prevTopics, topic]);
        }
    };

    const handleUnsubscribe = (socket: WebSocket, topic: string) => {
        if (socket && subscribedTopics.includes(topic)) {
            socket.send(JSON.stringify({ action: 'unsubscribe', topic }));
            //setSubscribedTopics((prevTopics) => prevTopics.filter(t => t !== topic));
        }
    };

    const handlePublish = (socket: WebSocket, id: string, command: any) => {
        if (socket) {
            socket.send(JSON.stringify({ action: 'publish', id: id, command: command }));
        }
    };

    const handleDisconnect = () => {
        if (ws) {
            ws.send(JSON.stringify({ action: 'disconnect' }));
        }
    };

    const connect = () => {
        if (ws) {
            fetchCookies(ws);
        }
    };

    const disconnect = () => {
        handleDisconnect();
    };

    const subscribe = (id: string) => {
        if (ws) {
            const reportTopic = `device/${id}/report`;
            const requestTopic = `device/${id}/request`;
            if (!subscribedTopics.includes(reportTopic)) {
                handleSubscribe(ws, reportTopic);
            }
            if (!subscribedTopics.includes(requestTopic)) {
                handleSubscribe(ws, requestTopic);
            }
        }
    };

    const unsubscribe = (topic: string) => {
        if (ws) {
            handleUnsubscribe(ws, topic);
        }
    };

    const publish = (id: string, command: any) => {
        if (ws) {
            handlePublish(ws, id, command);
        }
    };

    const userPublish = (id: string, command: any, tracker?: number) => {
        if (ws) {
            const currentSequenceId = sequenceIdRef.current + 1;
            sequenceIdRef.current = currentSequenceId;

            const commandKey = Object.keys(command)[0];
            const commandWithSequence = {
                ...command,
                [commandKey]: {
                    ...command[commandKey],
                    sequence_id: currentSequenceId.toString()
                }
            };

            handlePublish(ws, id, commandWithSequence);
            // toast.info(`Command sent with sequence_id: ${currentSequenceId}`);
        }
    };

    const getSequenceIdFromMessage: any = (messageData: any) => {
        const keys = Object.keys(messageData);
        if (keys.length === 1) {
            return {
                result: messageData[keys[0]].result,
                sequence_id: messageData[keys[0]].sequence_id
            };
        }
        return null;
    };

    return (
        <WebSocketContext.Provider value={{ printers, ws, messages, latestMessage, isConnected, isMqttConnected, subscribedTopics, connect, disconnect, subscribe, unsubscribe, publish, userPublish }}>
            {children}
        </WebSocketContext.Provider>
    );
};
