// @/components/Tasks/TaskDetails.tsx

import { BambuAmsDetailMapping, BambuTask, BambuTaskDetails, BambuTaskDetailsContextPlate } from "@/types/bambuApi/bambuTask"
import { Card, CardBody, Image, Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs } from "@nextui-org/react"
import { useEffect, useState } from "react";
import { LineWave } from "react-loader-spinner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";

interface TaskDetailsProps {
    task: BambuTask;
    isOpen: boolean;
    onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, isOpen, onClose }) => {
    const [taskDetails, setTaskDetails] = useState<BambuTaskDetails>();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/bambulab/task-details?profile_id=${task.profileId}&model_id=${task.modelId}`);
                const data = await res.json();
                setTaskDetails(data.data);
            } catch (error) {
                console.error('Error fetching task details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [task, isOpen]);

    return (
        <Modal
            backdrop="blur"
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            scrollBehavior="outside"
        >
            <ModalContent className="bg-primary-800">
                {() => (
                    <>
                        {loading ? (
                            <ModalBody className="items-center">
                                <LineWave />
                            </ModalBody>
                        ) : (
                            <>
                                {taskDetails && (
                                    <>
                                        <ModalHeader className="flex flex-col gap-1">{taskDetails.name}</ModalHeader>
                                        <ModalBody className="p-5">
                                            <TaskDetailsContent task={task} taskDetails={taskDetails} />
                                        </ModalBody>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default TaskDetails;



const TaskDetailsContent: React.FC<{ task: BambuTask, taskDetails: BambuTaskDetails }> = ({ task, taskDetails }) => {
    const [plate, setPlate] = useState<BambuTaskDetailsContextPlate>();

    useEffect(() => {
        const plate = taskDetails.context.plates.find(plate => plate.index == task.plateIndex);
        setPlate(plate);
    }, [task, taskDetails])

    return (
        <div className="w-full">
            <Carousel
                className="mx-10"
                opts={{
                    align: "start",
                    loop: true,
                }}
            >
                <CarouselContent>
                    <CarouselItem><Image src={task.cover} /></CarouselItem>
                    <CarouselItem><Image src={plate?.thumbnail.url} /></CarouselItem>
                    <CarouselItem><Image src={plate?.top_picture.url} /></CarouselItem>
                    <CarouselItem><Image src={plate?.pick_picture.url} /></CarouselItem>
                    <CarouselItem><Image src={plate?.no_light_picture.url} /></CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            <Tabs size="sm" radius="lg" color="secondary">
                <Tab key="print" title="Print">
                    <PrintDetails task={task} />
                </Tab>
                <Tab key="task" title="Task">
                    <SlicedFile taskDetails={taskDetails} />
                </Tab>
            </Tabs>
        </div>
    )
}

const PrintDetails: React.FC<{ task: BambuTask }> = ({ task }) => {
    return (
        <>
            <div>
                <p>{task.id}</p>
                <p>{task.designId}</p>
                <p>{task.designTitle}</p>
                <p>{task.instanceId}</p>
                <p>{task.modelId}</p>
                <p>Status: {task.status}</p>
                <p>{task.feedbackStatus}</p>
                <p>Print Start: {task.startTime}</p>
                <p>Print End: {task.endTime}</p>
                <p>Weight: {task.weight} g</p>
                <p>Length: {task.length} cm</p>
                <p>Time: {task.costTime} s</p>
                <p>{task.profileId}</p>
                <p>{task.plateIndex}</p>
                <p>{task.plateName}</p>
                <p>Printed on: {task.deviceId}</p>
                <AMSMapping details={task.amsDetailMapping} />
                <p>Mode: {task.mode}</p>
                <p>{task.isPublicProfile}</p>
                <p>{task.isPrintable}</p>
            </div>
            <div>
                <p className="font-thin text-xs italic">
                    Printed on {task.deviceName}, a Bambu {task.deviceModel}, on a {task.bedType}
                </p>
            </div>
        </>
    )
}

const SlicedFile: React.FC<{ taskDetails: BambuTaskDetails }> = ({ taskDetails }) => {
    return (
        <>
            <div>
                <p className="font-thin text-xs italic">
                    Sliced for {taskDetails.context.compatibility.nozzle_diameter} mm nozzle on a Bambu Lab {taskDetails.context.compatibility.dev_product_name}
                </p>
            </div>
        </>
    )
}

const AMSMapping: React.FC<{ details: BambuAmsDetailMapping[] }> = ({ details }) => {
    return (
        <Card className="bg-primary-900">
            <CardBody className="flex flex-row">
                {details.map((detail: BambuAmsDetailMapping) => (
                    <div>
                        <p>Tray {detail.ams}</p>
                        <div className="h-5 w-5" style={{ backgroundColor: `#${detail.sourceColor}` }}></div>
                        <div className="h-5 w-5" style={{ backgroundColor: `#${detail.targetColor}` }}></div>
                        <p>{detail.filamentId}</p>
                        <p>{detail.filamentType}</p>
                        {detail.targetFilamentType && (
                            <p>Target filament - {detail.targetFilamentType}</p>
                        )}
                        <p>{detail.weight} g</p>
                    </div>
                ))}
            </CardBody>
        </Card>
    )
}