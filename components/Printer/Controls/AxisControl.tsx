// @/components/Printer/AxisControl.tsx

import { printGcodeLine } from "@/services/bambuMqtt";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsDown, ChevronsLeft, ChevronsRight, ChevronsUp, ChevronUp, Home } from "lucide-react";

interface AxisControlProps extends MqttProps {
    isHomed: boolean
}

const AxisControl: React.FC<AxisControlProps> = ({ id, publish, isHomed }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleAxisMove = (axis: string, direction: string, value: number) => {

        if (!isHomed) {
            onOpen();
            return ""
        }

        const gcode = `M211 S\n
M211 X1 Y1 Z1 \n
M1002 push_ref_mode \n
G91 \n
G1 ${axis}${direction == '-' ? '-' : ''}${value}.0 F9000 \n
M1002 pop_ref_mode \n
M211 R \n
`
        const command = printGcodeLine(gcode);
        publish(id, command)
    }

    const handleHome = () => {
        const gcode = `G28 \n`;
        const command = printGcodeLine(gcode);
        publish(id, command)
    }

    return (
        <div className="flex flex-row">
            <div className="flex flex-col items-center gap-1">
                <div>
                    <Button isIconOnly onClick={() => handleAxisMove('Y', '-', 10)}>
                        <ChevronsUp />
                    </Button>
                </div>
                <div>
                    <Button isIconOnly onClick={() => handleAxisMove('Y', '-', 1)}>
                        <ChevronUp />
                    </Button>
                </div>
                <div className="flex flex-row gap-1">
                    <Button isIconOnly onClick={() => handleAxisMove('X', '-', 10)}>
                        <ChevronsLeft />
                    </Button>
                    <Button isIconOnly onClick={() => handleAxisMove('X', '-', 1)}>
                        <ChevronLeft />
                    </Button>
                    <Button isIconOnly onClick={handleHome}>
                        <Home />
                    </Button>
                    <Button isIconOnly onClick={() => handleAxisMove('X', '+', 1)}>
                        <ChevronRight />
                    </Button>
                    <Button isIconOnly onClick={() => handleAxisMove('X', '+', 10)}>
                        <ChevronsRight />
                    </Button>
                </div>
                <div>
                    <Button isIconOnly onClick={() => handleAxisMove('Y', '+', 1)}>
                        <ChevronDown />
                    </Button>
                </div>
                <div>
                    <Button isIconOnly onClick={() => handleAxisMove('Y', '+', 10)}>
                        <ChevronsDown />
                    </Button>
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <Button isIconOnly onClick={() => handleAxisMove('Z', '-', 10)}>
                    <ChevronsUp />
                </Button>
                <Button isIconOnly onClick={() => handleAxisMove('Z', '-', 1)}>
                    <ChevronUp />
                </Button>
                <Button isIconOnly onClick={() => handleAxisMove('Z', '+', 1)}>
                    <ChevronDown />
                </Button>
                <Button isIconOnly onClick={() => handleAxisMove('Z', '+', 10)}>
                    <ChevronsDown />
                </Button>
            </div>
            <div className="flex flex-col gap-1 h-full">
                <Button isIconOnly>
                    <ArrowUp />
                </Button>
                <Button isIconOnly>
                    <ArrowDown />
                </Button>
            </div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => {
                        const handleHomeAndClose = () => {
                            handleHome();
                            onClose();
                        };

                        return (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    Homing required
                                </ModalHeader>
                                <ModalBody>
                                    <p>
                                        Please home all the axes to locate the toolhead's position.
                                        It prevents it from moving beyond the printable boundary
                                        and causing equipment wear.
                                    </p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="secondary" onPress={handleHomeAndClose} startContent={<Home />}>
                                        Home
                                    </Button>
                                </ModalFooter>
                            </>
                        );
                    }}
                </ModalContent>
            </Modal>
        </div>
    )
};

export default AxisControl;