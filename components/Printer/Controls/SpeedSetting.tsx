// @/components/Printer/Controls/SpeedSetting.tsx

import { printPrintSpeed } from "@/services/bambuMqtt";
import { MqttProps, PrintSpeed, PrintSpeedName, PrintSpeedPercent } from "@/types/bambuMqtt/consts";
import { Popover, PopoverTrigger, Tooltip, PopoverContent, RadioGroup, Divider, Radio } from "@nextui-org/react";
import { Gauge } from "lucide-react";
import { useMemo } from "react";

interface SpeedSettingProps extends MqttProps {
    printSpeed: PrintSpeed;
}

const SpeedSetting: React.FC<SpeedSettingProps> = ({ id, publish, printSpeed }) => {

    const printSpeedLabel = useMemo(() => PrintSpeedName[printSpeed], [printSpeed]);
    const printSpeedPercent = useMemo(() => PrintSpeedPercent[printSpeed], [printSpeed]);

    const handlePrintSpeed = (speed: string) => {
        const command = printPrintSpeed(speed);
        publish(id, command)
    }

    return (
        <Popover placement="bottom" showArrow offset={10}>
            <PopoverTrigger>
                <div className="flex flex-col items-center gap-2">
                    <Tooltip content={printSpeedLabel}>
                        <Gauge className="" />
                    </Tooltip>
                    <div className="flex flex-row gap-1">
                        <p className="font-light">{printSpeedPercent} %</p>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[240px]">
                {(titleProps) => (
                    <div className="px-1 py-2 w-full">
                        <p className="text-small font-bold text-foreground" {...titleProps}>
                            Set Print Speed
                        </p>
                        <div className="mt-2 flex flex-row items-center gap-2 w-full">
                            <RadioGroup
                                label="Will only take effect during printing"
                                value={printSpeed.toString()}
                                onValueChange={(speed) => handlePrintSpeed(speed)}
                            >
                                {Object.values(PrintSpeed)
                                    .filter(value => typeof value === 'number')
                                    .map((speed: PrintSpeed) => (
                                        <Radio key={speed} value={speed.toString()} color="secondary">
                                            <div className="flex flex-row gap-2 items-center">
                                                <span>
                                                    {PrintSpeedName[speed]}
                                                </span>
                                                <Divider orientation="vertical" className="h-4" />
                                                <span className="text-default-400">
                                                    {PrintSpeedPercent[speed]}%
                                                </span>
                                            </div>
                                        </Radio>
                                    ))}
                            </RadioGroup>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

export default SpeedSetting;