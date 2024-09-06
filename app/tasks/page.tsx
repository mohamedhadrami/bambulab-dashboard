// @/app/tasks/page.tsx

"use client"

import Task from "@/components/Tasks/Task";
import { BambuTask } from "@/types/bambuApi/bambuTask";
import React, { useEffect, useState } from "react";

const Page: React.FC = () => {

    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('/api/bambulab/tasks?limit=60');
            if (res.ok) {
                const data = await res.json();
                setTasks(data.data.hits)
            }
        }
        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-2 gap-8 max-w-screen-xl mx-auto">
            {tasks && tasks.map((task: BambuTask) => <Task task={task} />)}
        </div>
    )
}

export default Page;