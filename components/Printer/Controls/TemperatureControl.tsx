// @/components/Printer/Controls/TemperatureControl.tsx

import { printGcodeLine } from "@/services/bambuMqtt";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { Popover, PopoverTrigger, Tooltip, PopoverContent, Button, Input } from "@nextui-org/react";
import { Check } from "lucide-react";
import { useState } from "react";

interface TemperatureControlProps extends MqttProps {
    label: string;
    temp: number;
    targetTemp: number;
    icon: React.ElementType;
}

// Allow for flashing and work light

const TemperatureControl: React.FC<TemperatureControlProps> = ({ id, label, temp, targetTemp, icon: Icon, publish }) => {
    const [inputValue, setInputValue] = useState<string>();

    const getIconColor = () => {
        if (temp < targetTemp) return "text-danger"
        else if (temp > targetTemp && targetTemp !== 0) return "text-[#87CEEB]"
        else return ""
    }

    const handleTargetTemp = () => {
        if (inputValue && parseInt(inputValue) >= 0) {
            let tempId;
            if (label == "Nozzle") tempId = 'M104';
            else if (label == "Bed") tempId = "M140"
            if (tempId) {
                if (label == "Nozzle" && parseInt(inputValue) > 300) return
                else if (label == "Bed" && parseInt(inputValue) > 120) return

                const command = printGcodeLine(`${tempId} S${inputValue} \n`);
                publish(id, command);
            }
        };
    }

    return (
        <Popover placement="bottom" showArrow offset={10}>
            <PopoverTrigger>
                <div className="flex flex-col items-center gap-2">
                    <Tooltip content={label}>
                        <Icon className={`${getIconColor()}`} />
                    </Tooltip>
                    <div className="flex flex-row gap-1">
                        <p className="font-light">{temp}</p>
                        <p className="font-bold">/</p>
                        <p className="font-extralight text-foreground-400">{targetTemp}</p>
                        <p className="font-extralight">&deg;C</p>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[240px]">
                {(titleProps) => (
                    <div className="px-1 py-2 w-full">
                        <p className="text-small font-bold text-foreground" {...titleProps}>
                            Set temperature for {label}
                        </p>
                        <div className="mt-2 flex flex-row items-center gap-2 w-full">
                            <Input defaultValue={targetTemp.toString()} label="&deg;C" value={inputValue} onValueChange={setInputValue} size="sm" variant="bordered" />
                            <Button isIconOnly color="success" onClick={handleTargetTemp}><Check /></Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

export default TemperatureControl;