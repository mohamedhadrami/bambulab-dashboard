// @/components/Printer/AmsInfo.tsx

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Droplets, Thermometer } from "lucide-react";
import AMSOptions from "./AMSOptions";
import { MqttProps } from "@/types/bambuMqtt/consts";
import Filament from "./Filament";
import { useEffect, useState } from "react";

interface AMSInfoProps extends MqttProps {
    info: any;
    homeFlag: any;
}

const AmsInfo: React.FC<AMSInfoProps> = ({ id, publish, info, homeFlag }) => {
    const amsData = info && info.ams ? info.ams : [];
    const maxAMSCount = 2;

    while (amsData.length < maxAMSCount) {
        amsData.push(null);
    }


    return (
        <div className="grid grid-cols-2 gap-4">
            {amsData.map((ams: any, index: number) => (
                <Card key={index} className="bg-gradient-to-br from-primary-400 dark:from-primary-800 dark:to-primary-900 max-w-96">
                    <CardHeader className="flex justify-between">
                        <div className="font-thin justify-center text-lg">AMS - {index}</div>
                        {ams && <AMSOptions id={id} publish={publish} info={info} amsId={index} homeFlag={homeFlag} />}
                    </CardHeader>
                    <CardBody className="gap-3">
                        {ams ? (
                            <>
                                <div className="flex flex-row justify-between">
                                    {ams.tray.map((tray: any, trayIndex: number) => (
                                        <Filament key={trayIndex} id={id} publish={publish} info={tray} amsId={ams.id} />
                                    ))}
                                </div>
                                <div className="flex flex-row justify-between">
                                    <div className="flex flex-row"><Thermometer /> {ams.temp} &deg;C</div>
                                    <div className="flex flex-row gap-1">{ams.humidity} <Droplets /></div>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-center items-center h-full text-gray-500">Not connected</div>
                        )}
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}

export default AmsInfo;
