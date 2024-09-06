// @/components/Printer/Settings/PrintOptions.tsx

import { HomeFlagValues } from "@/types/bambuApi/consts";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { Checkbox, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { useState, useEffect } from "react";

interface PrintOptionsProps extends MqttProps {
    xcam: any;
    xcamStatus: string;
    homeFlag: HomeFlagValues[];
}

const PrintOptions: React.FC<PrintOptionsProps> = ({ id, publish, xcam, xcamStatus, homeFlag }) => {
    const [aiMonitoring, setAiMonitoring] = useState<boolean>();
    const [aiSensitivity, setAiSensitivity] = useState<string>();
    const [buildPlateDetection, setBuildPlateDetection] = useState<boolean>();
    const [firstLayerInspection, setFirstLayerInspection] = useState<boolean>();
    const [autoRecoverStepLoss, setAutoRecoverStepLoss] = useState<boolean>(false);

    useEffect(() => {
        if (xcam) {
            setAiMonitoring(xcam.printing_monitor ?? aiMonitoring)
            setAiSensitivity(xcam.halt_print_sensitivity ?? aiSensitivity)
            setBuildPlateDetection(xcam.buildplate_marker_detector ?? buildPlateDetection)
            setFirstLayerInspection(xcam.first_layer_inspector ?? firstLayerInspection)
            setAutoRecoverStepLoss(homeFlag.includes(HomeFlagValues.XCAM_AUTO_RECOVERY_STEP_LOSS))
        }
    }, [xcam, xcamStatus])

    const handleAiMonitoring = () => {
        const command = {
            "xcam": {
                "sequence_id": "0",
                "command": "xcam_control_set",
                "module_name": "printing_monitor",
                "control": !aiMonitoring
            }
        }
        publish(id, command)
    }
    const handleAiSensitivity = (setting: string) => {
        const command = {
            "xcam": {
                "sequence_id": "0",
                "command": "xcam_control_set",
                "module_name": "printing_monitor",
                "control": aiMonitoring,
                "halt_print_sensitivity": setting
            }
        }
        publish(id, command)
    }


    const handleBuildPlatedetection = () => {
        const command = {
            "xcam": {
                "sequence_id": "0",
                "command": "xcam_control_set",
                "module_name": "buildplate_marker_detector",
                "control": !buildPlateDetection,
                "enable": !buildPlateDetection
            }
        }
        publish(id, command)
    }
    const handleFirstLayerInspection = () => {
        const command = {
            "xcam": {
                "sequence_id": "0",
                "command": "xcam_control_set",
                "module_name": "first_layer_inspector",
                "control": !firstLayerInspection
            }
        }
        publish(id, command)
    }

    const handleAutoRecoveryStepLoss = () => {
        const command = {
            "print": {
                "sequence_id": "0",
                "command": "print_option",
                "option": Number(!autoRecoverStepLoss),
                "auto_recover": !autoRecoverStepLoss
            }
        }
        publish(id, command)
    }


    const handlePrintHalt = () => {
        /*
        allow_skip_parts: false
        buildplate_marker_detector: false
        first_layer_inspector: false
        halt_print_sensitivity: medium
        print_halt: true
        printing_monitor: false
        spaghetti_detector: false
        */
        const command = {
            "xcam": {
                "sequence_id": "0",
                "command": "xcam_control_set",
                "module_name": "first_layer_inspector",
                "control": false,
                "print_halt": false
            }
        }
        //publish(id, command)
    }

    return (
        <div className="flex flex-col">
            <p className="text-lg font-light">Print Options</p>
            <div className="my-2 flex flex-col gap-1 text-default">
                <Checkbox isSelected={aiMonitoring} onValueChange={handleAiMonitoring} color="secondary">
                    Enable AI monitoring of printing
                </Checkbox>
                {aiMonitoring && (
                    <div className="font-thin text-sm">
                        Sensitivity of pausing is
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    size="sm"
                                    variant="bordered"
                                >
                                    {aiSensitivity}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Action event example"
                                onAction={(key) => handleAiSensitivity(key.toString())}
                            >
                                <DropdownItem key="low">Low</DropdownItem>
                                <DropdownItem key="medium">Medium</DropdownItem>
                                <DropdownItem key="high">High</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )}
                <Checkbox isSelected={buildPlateDetection} onValueChange={handleBuildPlatedetection} color="secondary">
                    Enable detection of build plate position
                </Checkbox>
                {buildPlateDetection && (
                    <div className="font-thin text-sm text-foreground-400">
                        If the build plate is not well placed, the current print job will be paused
                    </div>
                )}
                <Checkbox isSelected={firstLayerInspection} onValueChange={handleFirstLayerInspection} color="secondary">
                    First layer inspection
                </Checkbox>
                <Checkbox isSelected={autoRecoverStepLoss} onValueChange={handleAutoRecoveryStepLoss} color="secondary">
                    Auto-Recover from Step Loss
                </Checkbox>
            </div>
        </div>
    )
}

export default PrintOptions;