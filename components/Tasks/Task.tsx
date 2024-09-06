// @/components/Tasks/Task.tsx

import { BambuTask } from "@/types/bambuApi/bambuTask"
import { Card, CardBody, CardFooter, CardHeader, Image, useDisclosure } from "@nextui-org/react"
import TaskDetails from "./TaskDetails";

interface TaskProps {
    task: BambuTask;
}

const Task: React.FC<TaskProps> = ({ task }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleOpenModal = () => onOpen();

    return (
        <>
            <div onClick={handleOpenModal}>
                <Card className="border-1 border-primary-600 bg-primary-800">
                    <CardHeader>{task.title}</CardHeader>
                    <CardBody>
                        <Image className="" src={task.cover} />
                    </CardBody>
                    <CardFooter>

                    </CardFooter>
                </Card>
            </div>
            {isOpen ?
                <TaskDetails task={task} isOpen={isOpen} onClose={onClose} />
                :
                <></>
            }
        </>
    )
}

export default Task;