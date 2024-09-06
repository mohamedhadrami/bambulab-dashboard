// @/components/Printer/Calibration.tsx

import { printCalibration } from "@/services/bambuMqtt";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useState } from "react";

interface CalibrationProps extends MqttProps { }

const Calibration: React.FC<CalibrationProps> = ({ id, publish }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [motorNoise, setMotorNoise] = useState<boolean>(true);
    const [vibration, setVibration] = useState<boolean>(true);
    const [bedLeveling, setBedLeveling] = useState<boolean>(true);
    const [xcamCali, setXcamCali] = useState<boolean>(true);

    const handleCalibration = () => {
        const command = printCalibration(motorNoise, vibration, bedLeveling, xcamCali);
        publish(id, command);
        onClose();
    }

    const selectedOptions = [
        motorNoise && "Motor Noise Cancellation",
        vibration && "Vibration Compensation",
        bedLeveling && "Auto Bed Leveling",
        xcamCali && "Micro Lidar Calibration"
    ].filter(Boolean);

    return (
        <div className="flex flex-col">
            <p className="text-lg font-light">Calibration</p>
            <div className="my-2 flex flex-col gap-1">
                <Checkbox isSelected={motorNoise} onValueChange={setMotorNoise} color="secondary">
                    Motor Noise Cancellation
                </Checkbox>
                <Checkbox isSelected={vibration} onValueChange={setVibration} color="secondary">
                    Vibration Compensation
                </Checkbox>
                <Checkbox isSelected={bedLeveling} onValueChange={setBedLeveling} color="secondary">
                    Auto Bed Leveling
                </Checkbox>
                <Checkbox isSelected={xcamCali} onValueChange={setXcamCali} color="secondary">
                    Micro Lidar Calibration
                </Checkbox>
            </div>
            <Button onClick={onOpen} color="secondary">Start Calibration</Button>
            <Modal
                backdrop="blur"
                isOpen={isOpen}
                onClose={onClose}
                className="pointer-events-auto"
            >
                <ModalContent>
                    <>
                        <ModalHeader className="flex flex-col gap-1">Are you sure?</ModalHeader>
                        <ModalBody>
                            <p>Do you want to continue calibration for:</p>
                            <ul className="list-disc list-inside">
                                {selectedOptions.map((option, index) => (
                                    <li key={index}>{option}</li>
                                ))}
                            </ul>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="solid" color="secondary" onClick={(e) => { e.stopPropagation(); handleCalibration(); }}>
                                Yes
                            </Button>
                        </ModalFooter>
                    </>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default Calibration;
