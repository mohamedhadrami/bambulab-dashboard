// @/components/Printer/PrinterFan.tsx

import { printGcodeLine } from "@/services/bambuMqtt";
import { FanType, FanTypeToID, FanTypeMax, MqttProps } from "@/types/bambuMqtt/consts";
import { ButtonGroup, Button, Switch } from "@nextui-org/react";
import { Fan, Minus, Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

interface PrinterFanProps extends MqttProps {
    type: FanType;
    value: number;
}

const PrinterFan: React.FC<PrinterFanProps> = ({ id, type, value, publish }) => {
    const [isFanOn, setIsFanOn] = useState<boolean>(false);

    useEffect(() => {
        setIsFanOn(value > 0);
    }, [value]);

    const handleFanSwitch = () => {
        const command = printGcodeLine(`M106 P${FanTypeToID[type]} S${isFanOn ? 0 : 255} \n`);
        publish(id, command);
    };

    const mapValueToPercent = (value: number): number => {
        return Math.round((value / FanTypeMax[type]) * 255);
    };

    const handleFanIncrease = () => {
        const newValue = Math.min(value + 1.5, FanTypeMax[type]);
        const percentValue = mapValueToPercent(newValue);
        const command = printGcodeLine(`M106 P${FanTypeToID[type]} S${percentValue} \n`);
        publish(id, command);
    };

    const handleFanDecrease = () => {
        const newValue = Math.max(value - 1.5, 0);
        const percentValue = mapValueToPercent(newValue);
        const command = printGcodeLine(`M106 P${FanTypeToID[type]} S${percentValue} \n`);
        publish(id, command);
    };

    const valueToPercent = (value: number) => {
        return Math.round((value / FanTypeMax[type]) * 10) * 10;
    };

    const spinDuration = useMemo(() => {
        const percent = valueToPercent(value);
        const maxSpeed = 1;
        return `${maxSpeed / (percent / 100)}s`;
    }, [value]);

    return (
        <div className="flex flex-row items-center gap-2">
            <Fan strokeWidth={1} className={`${isFanOn ? 'spin' : ''}`} style={{ animationDuration: spinDuration }} />
            <div className="flex flex-col">
                <p className="font-extralight">{type}</p>
                <p className="font-thin">{value === 0 ? "Off" : `${valueToPercent(value)}%`}</p>
            </div>
            <ButtonGroup isIconOnly>
                <Button onClick={handleFanDecrease}><Minus size={16} /></Button>
                <Button onClick={handleFanIncrease}><Plus size={16} /></Button>
            </ButtonGroup>
            <Switch isSelected={isFanOn} color="secondary" onValueChange={handleFanSwitch} />
        </div>
    );
};

export default PrinterFan;
