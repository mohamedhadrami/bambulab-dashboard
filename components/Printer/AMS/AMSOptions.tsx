// @/components/Printer/AMSOptions.tsx

import { extractFlags } from "@/services/utils";
import { HomeFlagValues } from "@/types/bambuApi/consts";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { Popover, PopoverTrigger, PopoverContent, Checkbox, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { Cog } from "lucide-react";
import { useState, useEffect } from "react";

interface AMSOptionsProps extends MqttProps {
    info: any;
    amsId: number;
    homeFlag: HomeFlagValues[];
}

const AMSOptions: React.FC<AMSOptionsProps> = ({ id, publish, info, amsId, homeFlag }) => {
    const [insertFilament, setInsertFilament] = useState<boolean>();
    const [updateStart, setUpdateStart] = useState<boolean>();
    const [remainingEstimate, setRemainingEstimate] = useState<boolean>();
    const [filamentBackup, setFilamentBackup] = useState<boolean>(false);

    useEffect(() => {
        if (info) {
            setInsertFilament(info.insert_flag ?? insertFilament)
            setUpdateStart(info.power_on_flag ?? updateStart)
            setRemainingEstimate(homeFlag.includes(HomeFlagValues.AMS_CALIBRATE_REMAINING))
            setFilamentBackup(homeFlag.includes(HomeFlagValues.AMS_AUTO_SWITCH))
        }
    }, [info, homeFlag])


    const handleInsertFilament = () => {
        const command = {
            "print": {
                "sequence_id": "0",
                "command": "ams_user_setting",
                "ams_id": amsId,
                "startup_read_option": updateStart,
                "calibrate_remain_flag": remainingEstimate,
                "tray_read_option": !insertFilament
            }
        }
        setInsertFilament(!insertFilament)
        publish(id, command)
    }
    const handleUpdateStart = () => {
        const command = {
            "print": {
                "sequence_id": "0",
                "command": "ams_user_setting",
                "ams_id": amsId,
                "startup_read_option": !updateStart,
                "calibrate_remain_flag": remainingEstimate,
                "tray_read_option": insertFilament
            }
        }
        setUpdateStart(!updateStart)
        publish(id, command)
    }
    const handleRemainingEstimate = () => {
        const command = {
            "print": {
                "sequence_id": "0",
                "command": "ams_user_setting",
                "ams_id": amsId,
                "startup_read_option": updateStart,
                "calibrate_remain_flag": !remainingEstimate,
                "tray_read_option": insertFilament
            }
        }
        setRemainingEstimate(!remainingEstimate)
        publish(id, command)
    }

    const handleFilamentBackup = () => {
        const command = {
            "print": {
                "sequence_id": "0",
                "command": "print_option",
                "auto_switch_filament": !filamentBackup
            }
        }
        setFilamentBackup(!filamentBackup)
        publish(id, command)
    }

    return (
        <Popover
            placement="right"
            showArrow={true}
            motionProps={{
                variants: {
                    enter: {
                        opacity: 1,
                        scale: 1,
                        transition: {
                            opacity: { duration: 0.8 },
                            scale: { duration: 0.8, ease: "easeOut" }
                        }
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.8,
                        transition: {
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2, ease: "easeOut" }
                        }
                    }
                }
            }}
        >

            <PopoverTrigger>
                <Cog className="rotate-0 hover:rotate-180 transition-transform duration-700 ease-in-out" />
            </PopoverTrigger>
            <PopoverContent className="flex p-3 items-start bg-gradient-to-br from-primary-400 dark:from-primary-800 dark:to-primary-900">
                <Checkbox isSelected={insertFilament} onValueChange={handleInsertFilament} color="secondary">
                    Update on Inserting Filament
                </Checkbox>
                <Checkbox isSelected={updateStart} onValueChange={handleUpdateStart} color="secondary">
                    Update on Startup
                </Checkbox>
                <Checkbox isSelected={remainingEstimate} onValueChange={handleRemainingEstimate} color="secondary">
                    Remaining Filament Estimation
                </Checkbox>
                <Checkbox isSelected={filamentBackup} onValueChange={handleFilamentBackup} color="secondary">
                    AMS Filament Backup
                </Checkbox>
            </PopoverContent>
        </Popover>
    )
}

export default AMSOptions;