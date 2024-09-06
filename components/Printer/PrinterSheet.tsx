// @/components/Printer/PrinterSheet.tsx

import { getPrintSpeedEnum, MqttProps, PrintSpeed } from "@/types/bambuMqtt/consts";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { PanelRightOpen } from "lucide-react";
import Calibration from "./Settings/Calibration";
import VersionControl from "./Settings/VersionControl";
import { Divider } from "@nextui-org/react";
import PrintOptions from "./Settings/PrintOptions";
import { useState, useEffect } from "react";
import HomeFlagValuesComponent from "./Settings/HomeFlagValues";
import { HomeFlagValues } from "@/types/bambuApi/consts";
import CustomGcode from "./Settings/CustomGcode";


interface PrinterSheetProps extends MqttProps {
    versionInfo: any;
    printStatus: any;
    homeFlag: HomeFlagValues[];
}

const PrinterSheet: React.FC<PrinterSheetProps> = ({ id, publish, versionInfo, printStatus, homeFlag }) => {

    const [xcam, setXcam] = useState();
    const [xcamStatus, setXcamStatus] = useState<string>("");

    useEffect(() => {
        if (printStatus) {
            setXcam(printStatus.xcam ?? xcam);
            setXcamStatus(printStatus.xcam_status ?? xcamStatus);
        }
    }, [printStatus]);


    return (
        <Sheet>
            <SheetTrigger>
                <PanelRightOpen />
            </SheetTrigger>
            <SheetContent className="overflow-y-scroll bg-gradient-to-br from-primary-400 dark:from-primary-900 dark:to-primary-950">
                <SheetHeader>
                    <SheetTitle>Options</SheetTitle>
                    <SheetDescription>
                        <Calibration id={id} publish={publish} />
                        <Divider className="my-3"/>
                        <PrintOptions id={id} publish={publish} xcam={xcam} xcamStatus={xcamStatus} homeFlag={homeFlag} />
                        <Divider className="my-3"/>
                        <VersionControl id={id} publish={publish} versionInfo={versionInfo} />
                        <Divider className="my-3"/>
                        <CustomGcode id={id} publish={publish} />
                        <Divider className="my-3"/>
                        <HomeFlagValuesComponent homeFlag={homeFlag} id={id} publish={publish} />
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

export default PrinterSheet;