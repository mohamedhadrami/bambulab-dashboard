// @/components/Printer/AMS/Filament.tsx

import { MqttProps } from "@/types/bambuMqtt/consts";
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface FilamentProps extends MqttProps {
    info: any;
    amsId: string;
}

const Filament: React.FC<FilamentProps> = ({ id, publish, info, amsId }) => {
    const [trayId, setTrayId] = useState<string>("");
    const [trayIdx, setTrayIdx] = useState<string>("");
    const [filamentColor, setFilamentColor] = useState<string>("");
    const [minNozzleTemp, setMinNozzleTemp] = useState<string>("");
    const [maxNozzleTemp, setMaxNozzleTemp] = useState<string>("");
    const [filamentType, setFilamentType] = useState<string>("");

    const [inputValue, setInputValue] = useState<string>("")

    useEffect(() => {
        if (info) {
            setTrayId(info.id)
            setFilamentColor(info.tray_color)
            setInputValue(info.tray_color)
            setMinNozzleTemp(info.nozzle_temp_min)
            setMaxNozzleTemp(info.nozzle_temp_max)
            setFilamentType(info.tray_type)
            setTrayIdx(info.tray_info_idx)
        }
    }, [info])

    const handleFilamentChange = () => {
        if (trayId) {
            const command = {
                "print": {
                    "ams_id": parseInt(amsId),
                    "command": "ams_filament_setting",
                    "nozzle_temp_max": parseInt(maxNozzleTemp),
                    "nozzle_temp_min": parseInt(minNozzleTemp),
                    "sequence_id": "2012",
                    "tray_color": inputValue,
                    "tray_id": parseInt(trayId),
                    "tray_info_idx": trayIdx,
                    "tray_type": filamentType
                }
            }
            publish(id, command)
        }
    }

    return (
        <Popover placement="bottom" color="primary">
            <PopoverTrigger>
                <Card className="border-primary-500 border-1 w-16 bg-transparent">
                    <CardHeader style={{ backgroundColor: `#${info.tray_color}` }} />
                    <Divider />
                    <CardBody className="font-extralight text-center bg-transparent">
                        <p>{info.tray_type}</p>
                    </CardBody>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="p-3 bg-gradient-to-br from-primary-400 dark:from-primary-800 dark:to-primary-900">
                <div className="flex flex-row items-center gap-2 w-full">
                    {filamentColor &&
                        <Input
                            defaultValue={filamentColor.toString()}
                            value={inputValue}
                            onValueChange={setInputValue}
                            size="sm"
                            variant="bordered"
                        />
                    }
                    <Button isIconOnly color="success" onClick={handleFilamentChange}><Check /></Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default Filament;