// @/components/Printer/Options/HomeFlagValues.tsx

import { HomeFlagValues } from "@/types/bambuApi/consts";
import { MqttProps } from "@/types/bambuMqtt/consts";
import { Check, X } from "lucide-react";

interface HomeFlagValuesProps extends MqttProps {
    homeFlag: HomeFlagValues[];
}

const HomeFlagValuesComponent: React.FC<HomeFlagValuesProps> = ({ homeFlag }) => {
    return (
        <div className="flex flex-col">
            <p className="text-lg font-light">Home Flags</p>
            <div className="my-2 flex flex-col gap-1">
                {Object.entries(HomeFlagValues)
                    .filter(([key, value]) => typeof value === 'number')
                    .map(([key, value]) => (
                        <div key={key} className="flex items-center">
                            <span className="flex-grow">{key.replace(/_/g, ' ')}</span>
                            <span>{homeFlag.includes(value as HomeFlagValues) ? <Check className="text-secondary"/> : <X className="text-danger"/>}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default HomeFlagValuesComponent;
