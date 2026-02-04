// @/app/printers/[slug]/page.tsx

// TODO: handle web socket closed events

"use client"

import PrinterControls from "@/components/Printer/Controls/PrinterControls";
import VersionControl from "@/components/Printer/Settings/VersionControl";
import LoadingSpinner from "@/components/LoadingSpinner";
import AmsInfo from "@/components/Printer/AMS/AmsInfo";
import { useWebSocket } from '@/hooks/useWebSocket';
import { infoGetVersion, printPushStatus } from "@/services/bambuMqtt";
import { BambuDevice } from "@/types/bambuApi/bambuApi";
import { Button, Card, CardBody, CardFooter, CardHeader, Link, Divider } from "@heroui/react";
import React, { useEffect, useRef, useState } from "react";
import PrintStatus from "@/components/Printer/PrintStatus";
import { extractFlags } from "@/services/utils";
import PrinterHeader from "@/components/Printer/PrinterHeader";
import { HomeFlagValues } from "@/types/bambuApi/consts";
import { useParams } from "next/navigation";

const Page: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [printers, setPrinters] = useState<BambuDevice[]>([]);
  const [printer, setPrinter] = useState<BambuDevice | null>(null);

  // Fetch printers from API
  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/bambulab/printers", {
          cache: "no-store",
        });

        if (!res.ok) {
          setPrinters([]);
          return;
        }

        const json = await res.json();
        const devices: BambuDevice[] = json?.data?.devices ?? [];

        setPrinters(devices);

        const found = devices.find((p) => p.dev_id === slug);
        setPrinter(found ?? null);
      } catch (err) {
        console.error("Failed to fetch printers:", err);
        setPrinters([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <LoadingSpinner />;

  if (!printer) {
    return <PrinterDNE id={slug ?? ""} />;
  }

  return <PrinterInfo id={slug!} printer={printer} />;
};

export default Page;

const PrinterInfo: React.FC<{ id: string, printer: BambuDevice }> = ({ id, printer }) => {
    const { subscribe, unsubscribe, publish, userPublish, latestMessage, subscribedTopics, isMqttConnected } = useWebSocket();
    const [utcTime, setUtcTime] = useState<string | null>(null);
    const [printInfo, setPrintInfo] = useState();
    const [wifiSignal, setWifiSignal] = useState();
    const [amsInfo, setAmsInfo] = useState();
    const [versionInfo, setVersionInfo] = useState();
    const [homeFlag, setHomeFlag] = useState<HomeFlagValues[]>([]);
    const [hms, setHms] = useState<any[]>([]);

    const reportTopic = `device/${id}/report`;
    const requestTopic = `device/${id}/request`;

    const hasSubscribed = useRef(false);

    useEffect(() => {
        const onMount = () => {
            publish(id, printPushStatus());
            publish(id, infoGetVersion());
        };
        onMount();
    }, [subscribedTopics]);

    useEffect(() => {
        if (isMqttConnected) {
            if (!hasSubscribed.current) {
                if (!subscribedTopics.includes(reportTopic) || !subscribedTopics.includes(requestTopic)) {
                    subscribe(id);
                }
                hasSubscribed.current = true;
            }
        }
    }, [id, reportTopic, requestTopic, subscribe, unsubscribe, subscribedTopics]);

    useEffect(() => {
        if (latestMessage && latestMessage.topic === reportTopic) {

            setUtcTime(getTimeFromMessage(latestMessage.data) ?? utcTime)

            if (latestMessage.data.t_utc) {
                setUtcTime(latestMessage.data.t_utc);
            } else if (latestMessage.data.info) {
                setVersionInfo(latestMessage.data);
            } else if (latestMessage.data.print) {
                setPrintInfo(latestMessage.data.print);
                if (latestMessage.data.print.wifi_signal) setWifiSignal(latestMessage.data.print.wifi_signal);
                if (latestMessage.data.print.ams) {
                    if (latestMessage.data.print.ams.ams) setAmsInfo(latestMessage.data.print.ams);
                }
                if (latestMessage.data.print.home_flag) {
                    setHomeFlag(extractFlags(latestMessage.data.print.home_flag))
                }
                if (latestMessage.data.print.hms) {
                    setHms(latestMessage.data.print.hms)
                }
            } else if (latestMessage.data.system) {
                //setPrintInfo(latestMessage.data.system);
            }
        }
    }, [latestMessage, reportTopic]);

    const getTimeFromMessage: any = (message: any) => {
        const keys = Object.keys(message);
        if (keys.length === 1) {
            return message[keys[0]].t_utc;
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 gap-3 mx-auto 2xl:grid-cols-2 h-full">
            <div className="col-span-1 2xl:col-span-2">
                <PrinterHeader
                    printer={printer}
                    printStatus={printInfo}
                    versionInfo={versionInfo}
                    utcTime={utcTime}
                    wifiSignal={wifiSignal}
                    id={id}
                    publish={userPublish}
                    homeFlag={homeFlag}
                    hms={hms}
                />
                <Divider className="my-2" />
            </div>
            {amsInfo && (
                <div className="col-span-1">
                    <AmsInfo
                        id={id}
                        publish={userPublish}
                        info={amsInfo}
                        homeFlag={homeFlag}
                    />
                </div>
            )}
            <div className="col-span-1">
                <PrintStatus
                    id={id}
                    publish={userPublish}
                    printInfo={printInfo}
                />
            </div>
            <div className="col-span-1 2xl:col-span-2 flex-grow">
                <PrinterControls
                    id={id}
                    publish={userPublish}
                    printStatus={printInfo}
                    homeFlag={homeFlag}
                />
            </div>
        </div>
    );

};


const PrinterDNE: React.FC<{ id: string }> = ({ id }) => (
    <div className="relative flex justify-center items-center h-full max-w-screen-lg mx-auto">
        <Card className="flex justify-center min-w-96 bg-primary-600 dark:bg-primary-800" radius="sm">
            <CardHeader className="justify-center font-thin text-2xl">
                Printer not found
            </CardHeader>
            <CardBody className="items-center">
                {id}
            </CardBody>
            <CardFooter className="justify-center">
                <Link href="/printers">
                    <Button>
                        Return to Printers
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    </div>
);


