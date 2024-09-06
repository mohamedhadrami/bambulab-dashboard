// @/components/Printer/Options/HomeFlagValues.tsx

import { printGcodeLine } from "@/services/bambuMqtt";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { useDisclosure, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea } from "@nextui-org/react";
import { useState } from "react";

interface CustomGcodeProps extends MqttProps { }

const CustomGcode: React.FC<CustomGcodeProps> = ({ id, publish }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [gcodeText, setGcodeText] = useState<string>("")

    const handleGcode = () => {
        const command = printGcodeLine(gcodeText);
        publish(id, command)
    }

    return (
        <div className="flex flex-col">
            <p className="text-lg font-light">Gcode</p>
            <div className="my-2 flex flex-col gap-1">
                <Button onClick={onOpen} color="secondary">Open Gcode Editor</Button>
                <Modal
                    backdrop="blur"
                    isOpen={isOpen}
                    onClose={onClose}
                    className="pointer-events-auto z-50"
                >
                    <ModalContent>
                        <>
                            <ModalHeader className="flex flex-col gap-1">Gcode Editor</ModalHeader>
                            <ModalBody>
                                <Textarea
                                    key="gcode-taxtarea"
                                    variant="underlined"
                                    labelPlacement="outside"
                                    value={gcodeText}
                                    onValueChange={setGcodeText}
                                    placeholder="Enter your description"
                                    className="col-span-12 md:col-span-6 mb-6 md:mb-0"
                                />
                            </ModalBody>
                            <ModalFooter className="flex flex-row justify-between">
                                <Button color="danger" variant="ghost" onClick={onClose}>
                                    Exit
                                </Button>
                                <Button variant="solid" color="secondary" onClick={(e) => handleGcode()}>
                                    Send
                                </Button>
                            </ModalFooter>
                        </>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}

export default CustomGcode;
