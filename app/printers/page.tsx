// @/app/printers/page.tsx

"use client"

import React, { useEffect, useState, useMemo } from "react";
import { Button, getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Download } from "lucide-react";

const columns = [
    { key: "name", label: "Name" },
    { key: "dev_product_name", label: "Printer Type" },
    { key: "dev_id", label: "Serial Number" },
    { key: "nozzle_diameter", label: "Nozzle" },
    { key: "online", label: "Online" },
    { key: "dev_access_code", label: "Access Code" },
];

const Page: React.FC = () => {
    const [printers, setPrinters] = useState<any[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<any[]>([]);

    const classNames = useMemo(
        () => ({
            wrapper: ["rounded-xl bg-transparent border-1 border-primary-500"],
            th: ["bg-transparent", "text-foreground", "text-sm", "border-b", "border-divider"],
            tr: ["rounded-full"],
            td: ["text-default-600"],
            table: ["rounded-xl"]
        }),
        [],
    );

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('/api/bambulab/printers');
            const data = await res.json();
            setPrinters(data.data.devices)
        }
        fetchData();
    }, []);

    return (
        <>
            <div className="flex flex-row justify-end mb-4">
                <Button isDisabled className="bg-primary-500" endContent={<Download size={16} />}>
                    Export
                </Button>
            </div>
            <Table
                aria-label="Controlled table example with dynamic content"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                checkboxesProps={{
                    classNames: {
                        wrapper: "after:bg-primary-300 after:text-background text-background",
                    },
                }}
                classNames={classNames}
            >
                <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody items={printers}>
                    {(item) => (
                        <TableRow key={item.dev_id}>
                            {(columnKey) =>
                                columnKey === "online" ? (
                                    <TableCell>{item.online ? "Online" : "Offline"}</TableCell>
                                ) : (
                                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                                )
                            }

                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}

export default Page;
