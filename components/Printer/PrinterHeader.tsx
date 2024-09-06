// @/components/Printer/DeviceHeader.tsx

import { getProductImageURL } from "@/services/utils";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { Tooltip, Button, Image, Chip } from "@nextui-org/react";
import { RefreshCcw, Signal, SignalHigh, SignalLow, SignalMedium, WifiOff } from "lucide-react";
import SyncDelay from "./SyncDelay";
import { BambuDevice } from "@/types/bambuApi/bambuApi";
import { printPushStatus } from "@/services/bambuMqtt";
import { HomeFlagValues } from "@/types/bambuApi/consts";
import { useEffect, useState } from "react";
import HMSErrors from "./HMSErrors";
import Calibration from "./Settings/Calibration";
import PrinterSheet from "./PrinterSheet";

interface PrinterHeaderProps extends MqttProps {
    printer: BambuDevice;
    printStatus: any;
    versionInfo: any;
    utcTime: any;
    wifiSignal: any;
    homeFlag: HomeFlagValues[];
    hms: any[]
}

const PrinterHeader: React.FC<PrinterHeaderProps> = ({ id, publish, printer, printStatus, versionInfo, utcTime, wifiSignal, homeFlag, hms }) => {
    const [isDoorOpen, setIsDoorOpen] = useState<boolean>(false);
    const fetchingStatus = false;

    useEffect(() => {
        if (homeFlag) {
            setIsDoorOpen(homeFlag.includes(HomeFlagValues.DOOR_OPEN))
        }
    }, [homeFlag])

    const handlePushStatus = () => {
        publish(id, printPushStatus());
    }

    return (
        <div className="flex flex-row justify-between">
            <Tooltip
                placement="right-start"
                className="bg-gradient-to-br from-primary-400 dark:from-primary-700 dark:to-primary-900"
                content={
                    <div className="flex flex-col items-center">
                        <Image src={getProductImageURL(printer.dev_product_name)} alt={printer.dev_product_name} className="w-20 h-20 object-contain" />
                        <p>
                            <span className="font-bold">Device Model: </span>
                            <span>{printer.dev_product_name}</span>
                        </p>
                        <p>
                            <span className="font-bold">Serial Number: </span>
                            <span>{printer.dev_id}</span>
                        </p>
                        <p>
                            <span className="font-bold">Firmware: </span>
                            {versionInfo && <span>{versionInfo.info.module[0].sw_ver}</span>}
                        </p>
                    </div>
                }
            >
                <p className="text-3xl font-extralight text-foreground">{printer.name}</p>
            </Tooltip>
            <div className="flex flex-row items-center gap-5">
                <Chip isCloseable color={isDoorOpen ? 'danger' : 'secondary'}>{isDoorOpen ? 'Door Open' : 'Door closed'}</Chip>
                <HMSErrors hms={hms} />
                <SyncDelay time={utcTime} />
                <Tooltip
                    content={wifiSignal ? wifiSignal : "No wifi somehow but your ass is connected"}
                    placement="bottom"
                    className="bg-gradient-to-br from-primary-400 dark:from-primary-800 dark:to-primary-900"
                >
                    {getWifiIcon(wifiSignal)}
                </Tooltip>
                <Button isIconOnly variant="light" onClick={handlePushStatus}>
                    <RefreshCcw className={fetchingStatus ? 'animate-spin' : ''} />
                </Button>
                <PrinterSheet id={id} publish={publish} versionInfo={versionInfo} printStatus={printStatus} homeFlag={homeFlag} />
            </div>
        </div>
    );
}

export default PrinterHeader;

const getWifiIcon = (rssi: string | null | undefined) => {
    if (rssi === null || rssi === undefined) {
        return <WifiOff />;
    }

    const rssiValue = parseInt(rssi.replace('dBm', '').trim());

    if (rssiValue > -50) {
        return <Signal />;
    } else if (rssiValue > -60) {
        return <SignalHigh />;
    } else if (rssiValue > -70) {
        return <SignalMedium />;
    } else {
        return <SignalLow />;
    }
};
