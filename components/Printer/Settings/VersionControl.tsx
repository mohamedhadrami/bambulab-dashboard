// @/components/Printer/VersionControl.tsx

import { MqttProps } from "@/types/bambuMqtt/consts";

interface VersionControlProps extends MqttProps {
    versionInfo: any;
}

const VersionControl: React.FC<VersionControlProps> = ({ id, publish, versionInfo }) => {

    return (
        <div className="">
            <p className="text-lg font-light">Version</p>
            <div className="text-medium">
                {versionInfo.info.module.map((mod: any, index: number) => (
                    <div key={index} className="flex flex-row justify-between">
                        <p className="font-extralight">{mod.name}</p>
                        <p className="">{mod.sw_ver}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default VersionControl;