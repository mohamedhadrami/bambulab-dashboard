// @/components/Printer/Controls/PrinterControls.tsx

"use client";
import { CURRENT_STAGE_OPTIONS, FanType, getPrintSpeedEnum, MqttProps, PrintSpeed } from "@/types/bambuMqtt/consts";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { Bed, Box, Syringe } from "lucide-react";
import { useState, useEffect } from "react";
import PrinterFan from "./PrinterFan";
import AxisControl from "./AxisControl";
import PrintOptions from "../Settings/PrintOptions";
import SpeedSetting from "./SpeedSetting";
import LightControl from "./LightControl";
import TemperatureControl from "./TemperatureControl";
import { HomeFlagValues } from "@/types/bambuApi/consts";
import CustomGcode from "../Settings/CustomGcode";

interface PrinterControlsProps extends MqttProps {
    printStatus: any;
    homeFlag: HomeFlagValues[];
}

const PrinterControls: React.FC<PrinterControlsProps> = ({ id, publish, printStatus, homeFlag }) => {
    const [lightReport, setLightReport] = useState<any[]>([]);

    const [nozzleTemp, setNozzleTemp] = useState<number>(0);
    const [nozzleTargetTemp, setNozzleTargetTemp] = useState<number>(0);
    const [bedTemp, setBedTemp] = useState<number>(0);
    const [bedTargetTemp, setBedTargetTemp] = useState<number>(0);
    const [chamberTemp, setChamberTemp] = useState<number>(0);
    const [chamberTargetTemp, setChamberTargetTemp] = useState<number>(0);

    const [auxiliaryFan, setAuxiliaryFan] = useState<number>(0);
    const [chamberFan, setChamberFan] = useState<number>(0);
    const [partFan, setPartFan] = useState<number>(0);

    const [printSpeed, setPrintSpeed] = useState<PrintSpeed>(PrintSpeed.Standard);
    const [printerStage, setPrinterStage] = useState();
    const [printerSubStage, setPrinterSubStage] = useState();

    const [xcam, setXcam] = useState();
    const [xcamStatus, setXcamStatus] = useState<string>("");

    useEffect(() => {
        if (printStatus) {
            setNozzleTemp(printStatus.nozzle_temper ?? nozzleTemp);
            setNozzleTargetTemp(printStatus.nozzle_target_temper ?? nozzleTargetTemp);
            setBedTemp(printStatus.bed_temper ?? bedTemp);
            setBedTargetTemp(printStatus.bed_target_temper ?? bedTargetTemp);
            setChamberTemp(printStatus.chamber_temper ?? chamberTemp);
            setChamberTargetTemp(printStatus.chamber_target_temper ?? chamberTargetTemp);

            setPartFan(parseInt(printStatus.cooling_fan_speed ?? partFan.toString(), 10));
            setAuxiliaryFan(parseInt(printStatus.big_fan1_speed ?? auxiliaryFan.toString(), 10));
            setChamberFan(parseInt(printStatus.big_fan2_speed ?? chamberFan.toString(), 10));

            setPrintSpeed(getPrintSpeedEnum(printStatus.spd_lvl ?? printSpeed));
            setPrinterStage(printStatus.mc_print_stage ?? printerStage);
            setPrinterSubStage(printStatus.mc_print_sub_stage ?? printerSubStage);

            setXcam(printStatus.xcam ?? xcam);
            setXcamStatus(printStatus.xcam_status ?? xcamStatus);

            setLightReport(printStatus.lights_report ?? lightReport);
        }
    }, [printStatus]);


    const [isHomed, setIsHomed] = useState<boolean>(true)

    useEffect(() => {
        if (homeFlag) {
            if (!homeFlag.includes(HomeFlagValues.X_AXIS) || !homeFlag.includes(HomeFlagValues.Y_AXIS) || !homeFlag.includes(HomeFlagValues.Z_AXIS)) {
                setIsHomed(false)
            } else {
                setIsHomed(true)
            }
        }
    }, [homeFlag])

    return (
        <Card className="
            bg-gradient-to-br 
            from-primary-100 to-primary-300
            dark:from-primary-800 dark:to-primary-900 
            flex-grow h-full">
            <CardHeader className="flex flex-row justify-between text-lg font-light">
                <p>Controls</p>
            </CardHeader>
            <CardBody className="flex flex-row justify-between">
                <div className="flex flex-col xl:flex-row">
                    <div>
                        <div className="flex flex-row gap-5">
                            <TemperatureControl id={id} label="Nozzle" temp={nozzleTemp} targetTemp={nozzleTargetTemp} icon={Syringe} publish={publish} />
                            <TemperatureControl id={id} label="Bed" temp={bedTemp} targetTemp={bedTargetTemp} icon={Bed} publish={publish} />
                            <TemperatureControl id={id} label="Chamber" temp={chamberTemp} targetTemp={chamberTargetTemp} icon={Box} publish={publish} />
                            <SpeedSetting id={id} publish={publish} printSpeed={printSpeed} />
                        </div>
                        <div className="flex flex-col gap-4">
                            <PrinterFan id={id} type={FanType.Part} value={partFan} publish={publish} />
                            <PrinterFan id={id} type={FanType.Auxiliary} value={auxiliaryFan} publish={publish} />
                            <PrinterFan id={id} type={FanType.Chamber} value={chamberFan} publish={publish} />

                            <CustomGcode id={id} publish={publish} />
                        </div>
                    </div>
                    <LightControl id={id} publish={publish} lightReport={lightReport} />
                </div>
                <AxisControl id={id} publish={publish} isHomed={isHomed} />
            </CardBody>
        </Card>
    );
};

export default PrinterControls;


