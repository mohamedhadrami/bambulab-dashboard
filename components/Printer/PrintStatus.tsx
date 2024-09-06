// @/components/Printer/VersionControl.tsx

import { convertMinutesToTimeString, extractFlags } from "@/services/utils";
import { HomeFlagValues } from "@/types/bambuApi/consts";
import { CURRENT_STAGE_IDS, MqttProps } from "@/types/bambuMqtt/consts";
import { Button, Card, CardBody, CardHeader, Progress } from "@nextui-org/react"
import { Pause, Square, StepForward } from "lucide-react";
import { useEffect, useState } from "react";

interface PrintStatusProps extends MqttProps {
    printInfo: any;
}

const PrintStatus: React.FC<PrintStatusProps> = ({ id, publish, printInfo }) => {
    const [taskName, setTaskName] = useState();
    const [currentLayer, setCurrentLayer] = useState();
    const [totalLayers, setTotalLayers] = useState();
    const [percentComplete, setPercentComplete] = useState();
    const [timeRemaining, setTimeRemaining] = useState();
    const [currentStage, setCurrentStage] = useState();
    const [stages, setStages] = useState<any[]>([]);
    const [gcodeState, setGcodeState] = useState();

    useEffect(() => {
        if (printInfo) {
            setTaskName(printInfo.subtask_name ?? taskName);
            setCurrentLayer(printInfo.layer_num ?? currentLayer);
            setTotalLayers(printInfo.total_layer_num ?? totalLayers);
            setPercentComplete(printInfo.mc_percent ?? percentComplete);
            setTimeRemaining(printInfo.mc_remaining_time ?? timeRemaining);
            setCurrentStage(printInfo.stg_cur ?? currentStage);
            setStages(printInfo.stg ?? stages);
            setGcodeState(printInfo.gcode_state ?? gcodeState);
        }
    }, [printInfo]);

    const handlePrintControl = (command: string) => {
        const request_data = {
            "print": {
                "sequence_id": "0",
                "command": command,
                "param": ""
            }
        }

        publish(id, request_data)
    }

    return (
        <Card className="
            bg-gradient-to-br 
            from-primary-100 to-primary-300.
            dark:from-primary-800 dark:to-primary-900 w-full">
            <CardHeader className="flex flex-row justify-between text-lg font-light">
                <p>Status</p>
                <p>{CURRENT_STAGE_IDS[currentStage!]}</p>
            </CardHeader>
            <CardBody>
                <div>
                    {stages && stages.map((stage: any) => (
                        <p>{CURRENT_STAGE_IDS[stage]}</p>
                    ))}
                </div>
                <p>{taskName}</p>
                <div className="flex flex-row justify-between">
                    <p>
                        Layer&nbsp;
                        <span className="font-bold">{currentLayer}</span>
                        /
                        <span>{totalLayers}</span>
                    </p>
                    <p>{convertMinutesToTimeString(timeRemaining!)}</p>
                </div>
                <Progress
                    label={gcodeState}
                    aria-label="Print progress"
                    size="sm"
                    value={percentComplete}
                    color="secondary"
                    showValueLabel={true}
                    className="max-w-full"
                />
                <div className="flex flex-row">
                    {gcodeState == "PAUSE" ? (
                        <Button className="flex flex-row items-center" endContent={<StepForward className="text-secondary" />} onClick={() => handlePrintControl("resume")}>Resume</Button>
                    ) : (
                        <Button className="flex flex-row items-center" endContent={<Pause className="text-primary" />} onClick={() => handlePrintControl("pause")}>Pause</Button>
                    )}
                    <Button className="flex flex-row items-center" endContent={<Square className="text-danger" />} onClick={() => handlePrintControl("stop")}>Stop</Button>
                </div>
            </CardBody>
        </Card>
    )
}

export default PrintStatus;