// @/components/Printer/SyncDelay.tsx

import { Chip, Tooltip } from '@nextui-org/react';
import { Timer } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SyncDelayProps {
    time: any;
}

const SyncDelay: React.FC<SyncDelayProps> = ({ time }) => {
    const [delay, setDelay] = useState<number>(0);

    useEffect(() => {
        const calculateDelay = () => {
            const currentTime = Date.now();
            const providedTime = parseInt(time, 10);
            const delay = currentTime - providedTime;
            setDelay(delay / 1000);
        };

        calculateDelay();
        const interval = setInterval(calculateDelay, 1000);

        return () => clearInterval(interval);
    }, [time]);

    const formattedDelay = delay > 3600 ? 'Out of sync' : `${delay.toFixed(3).substring(0, 5)} s`;

    return (
        <Tooltip
            showArrow
            placement="bottom"
            className="bg-gradient-to-br from-primary-400 dark:from-primary-800 dark:to-primary-900"
            content={
                <div className="px-1 py-2">
                    <div className="text-small font-bold">Time since last message</div>
                    <div className="text-tiny">A heartbeat is to be expected every 10 seconds, maybe not idc</div>
                </div>
            }
            closeDelay={1000}
        >
            <Chip
                startContent={<Timer size={20} />}
                variant="flat"
                color={delay > 10 ? "danger" : "secondary"}
                className="w-24 min-w-24 text-center"
            >
                {formattedDelay}
            </Chip>

        </Tooltip>
    );
}

export default SyncDelay;
