// @/components/Printer/HMSErrors.tsx

import { getHmsSeverity, getHmsModule, hmsCode, wikiUrl } from "@/services/utils";
import { DEVICE_ERROR, HMS_ERROR } from "@/types/bambuApi/HmsError";
import { Card, CardBody, CardHeader, Chip, Link, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { useEffect, useState } from "react";

interface ErrorDetail {
    severity: string;
    module: string;
    wikiUrl: string;
    errorText: string;
    code: string;
}


const errorSeverityColor = (severity: string) => {
    switch (severity) {
        case "fatal":
            return "bg-danger";
        case "serious":
            return "bg-warning"
        default:
            return ""
    }
}

const HMSErrors: React.FC<{ hms: any[] }> = ({ hms }) => {
    const [formattedErrors, setFormattedErrors] = useState<ErrorDetail[]>([]);
    const [chipColor, setChipColor] = useState<string>("secondary")

    useEffect(() => {
        if (hms) {
            const errors: ErrorDetail[] = hms.map((error: { code: number; attr: number }) => {
                const severity = getHmsSeverity(error.code);
                const module = getHmsModule(error.attr);
                const code = hmsCode(error.attr, error.code);
                const wiki = wikiUrl(error.attr, error.code);
                let errorText = DEVICE_ERROR[code as keyof typeof DEVICE_ERROR];
                if (errorText === undefined) {
                    errorText = HMS_ERROR[code as keyof typeof HMS_ERROR];
                }
                return { severity, module, wikiUrl: wiki, errorText, code };
            });
            setFormattedErrors(errors);

            if (hms.length > 0) {
                setChipColor("warning")
            }

        }
    }, [hms]);

    return (
        <Popover placement="bottom">
            <PopoverTrigger>
                <Chip variant="flat" color={chipColor}>Errors - {hms.length}</Chip>
            </PopoverTrigger>
            <PopoverContent className="max-w-96 p-4">
                {formattedErrors.length > 0 ? (
                    formattedErrors.map((error, index) => (
                        <div>
                            <div className="flex flex-row items-center">
                                <Link href={error.wikiUrl} showAnchorIcon className="font-extralight text-xl">{error.code}</Link>
                                <div className={`rounded-full h-2 w-2 ml-auto m-1 mb-2 ${errorSeverityColor(error.severity)}`}></div>
                            </div>
                            <p>{error.errorText}</p>
                            <p className="italic"><strong>Module:</strong> {error.module}</p>
                        </div>
                    ))
                ) : (
                    <p>Good on you for taking care of the thing</p>
                )}
            </PopoverContent>
        </Popover>
    );
}

export default HMSErrors;
