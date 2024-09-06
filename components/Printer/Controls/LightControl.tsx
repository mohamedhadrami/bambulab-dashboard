// @/components/Printer/Controls/LightControl.tsx

import { systemLedCtrl } from "@/services/bambuMqtt";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { Tooltip, Button, Popover, PopoverTrigger, PopoverContent, Input, ButtonGroup } from "@nextui-org/react";
import { Check, ChevronDown, Lightbulb } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface LightControlProps extends MqttProps {
    lightReport: any[];
}

const LightControl: React.FC<LightControlProps> = ({ id, publish, lightReport }) => {
    const [chamberLight, setChamberLight] = useState<boolean>(false);
    const [chamberMode, setChamberMode] = useState<string>("");
    const [chamberLedOnTime, setChamberLedOnTime] = useState<number>(500)
    const [chamberLedOffTime, setChamberLedOffTime] = useState<number>(500)
    const [chamberLoopTimes, setChamberLoopTimes] = useState<number>(1)
    const [chamberIntervalTime, setChamberIntervalTime] = useState<number>(1000)

    const [chamberInputMode, setChamberInputMode] = useState<string>("");
    const [chamberInputLedOnTime, setChamberInputLedOnTime] = useState<string>("500")
    const [chamberInputLedOffTime, setChamberInputLedOffTime] = useState<string>("500")
    const [chamberInputLoopTimes, setChamberInputLoopTimes] = useState<string>("1")
    const [chamberInputIntervalTime, setChamberInputIntervalTime] = useState<string>("1000")

    const [workLight, setWorkLight] = useState<boolean>(false);

    useEffect(() => {
        if (lightReport) {
            setChamberLight(lightReport[0]?.mode === 'on' ?? chamberLight);
            setChamberMode(lightReport[0]?.led_mode ?? chamberMode);
            setChamberLedOnTime(lightReport[0]?.led_on_time ?? chamberLedOnTime);
            setChamberLedOffTime(lightReport[0]?.led_off_time ?? chamberLedOffTime);
            setChamberLoopTimes(lightReport[0]?.loop_times ?? chamberLoopTimes);
            setChamberIntervalTime(lightReport[0]?.interval_time ?? chamberIntervalTime);

            setWorkLight(lightReport[1]?.mode === 'on' ?? workLight);
        }
    }, [lightReport])

    const handleToggle = useCallback(() => {
        const newState = !chamberLight;
        const request_data = systemLedCtrl("chamber_light", newState ? "on" : "off");
        publish(id, request_data);
    }, [chamberLight, id, publish]);

    const handleWorkLight = useCallback(() => {
        const newState = !workLight;
        const request_data = systemLedCtrl("work_light", newState ? "on" : "off");
        publish(id, request_data);
    }, [workLight, id, publish]);

    const handleLedCtrl = useCallback(() => {
        const request_data = systemLedCtrl("chamber_light", chamberInputMode, chamberLedOnTime, chamberLedOffTime, chamberLoopTimes, chamberIntervalTime);
        publish(id, request_data);
    }, [chamberInputMode, chamberLedOnTime, chamberLedOffTime, chamberLoopTimes, chamberIntervalTime, id, publish]);


    return (
        <div>
            <ButtonGroup>
                <Tooltip content="Chamber Light">
                    <Button isIconOnly color={chamberLight ? 'warning' : 'danger'} onClick={handleToggle}>
                        <Lightbulb />
                    </Button>
                </Tooltip>
                <Popover>
                    <PopoverTrigger>
                        <Button isIconOnly>
                            <ChevronDown />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Input defaultValue={chamberMode} value={chamberInputMode} onValueChange={setChamberInputMode} size="sm" variant="bordered" />
                        <Input defaultValue={chamberLedOnTime.toString()} value={chamberInputLedOnTime} onValueChange={setChamberInputLedOnTime} size="sm" variant="bordered" />
                        <Input defaultValue={chamberLedOffTime.toString()} value={chamberInputLedOffTime} onValueChange={setChamberInputLedOffTime} size="sm" variant="bordered" />
                        <Input defaultValue={chamberLoopTimes.toString()} value={chamberInputLoopTimes} onValueChange={setChamberInputLoopTimes} size="sm" variant="bordered" />
                        <Input defaultValue={chamberIntervalTime.toString()} value={chamberInputIntervalTime} onValueChange={setChamberInputIntervalTime} size="sm" variant="bordered" />
                        <Button isIconOnly color="success" onClick={handleLedCtrl}><Check /></Button>
                    </PopoverContent>
                </Popover>
            </ButtonGroup>

            <ButtonGroup>
                <Tooltip content="Work Light">
                    <Button isIconOnly color={workLight ? 'warning' : 'danger'} onClick={handleWorkLight}>
                        <Lightbulb />
                    </Button>
                </Tooltip>
                <Popover>
                    <PopoverTrigger>
                        <Button isIconOnly>
                            <ChevronDown />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Input defaultValue={chamberMode} value={chamberInputMode} onValueChange={setChamberInputMode} size="sm" variant="bordered" />
                        <Input defaultValue={chamberLedOnTime.toString()} value={chamberInputLedOnTime} onValueChange={setChamberInputLedOnTime} size="sm" variant="bordered" />
                        <Input defaultValue={chamberLedOffTime.toString()} value={chamberInputLedOffTime} onValueChange={setChamberInputLedOffTime} size="sm" variant="bordered" />
                        <Input defaultValue={chamberLoopTimes.toString()} value={chamberInputLoopTimes} onValueChange={setChamberInputLoopTimes} size="sm" variant="bordered" />
                        <Input defaultValue={chamberIntervalTime.toString()} value={chamberInputIntervalTime} onValueChange={setChamberInputIntervalTime} size="sm" variant="bordered" />
                        <Button isIconOnly color="success" onClick={handleLedCtrl}><Check /></Button>
                    </PopoverContent>
                </Popover>
            </ButtonGroup>
        </div >
    );
}

export default LightControl;