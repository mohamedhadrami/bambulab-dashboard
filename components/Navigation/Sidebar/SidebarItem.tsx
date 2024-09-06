// @/components/Navigation/Sidebar/SidebarItem.tsx

import { getProductImageURL } from "@/services/utils";
import { BambuDevice } from "@/types/bambuApi/bambuApi";
import { Accordion, AccordionItem, Chip, Divider, Link, Tooltip } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cloneElement } from "react";

interface SidebarItemProps {
    pathname: string;
    printers: BambuDevice[];
    name: string;
    url: string;
    icon: JSX.Element;
    isOpen: boolean;
    isDisabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ pathname, printers, name, url, icon, isOpen, isDisabled }) => {
    const itemVariants = {
        open: { opacity: 1, x: 0 },
        closed: { opacity: 0, x: -20 },
    };

    return (
        <>
            {isOpen ? (
                name === "Printers" ? (
                    <Accordion key={name}>
                        <AccordionItem title={name} startContent={cloneElement(icon, { className: pathname === url ? 'text-secondary' : 'text-foreground' })}>
                            <div className="pl-1 flex flex-col">
                                {printers.map((printer: BambuDevice) => (
                                    <Link href={`/printers/${printer.dev_id}`} isBlock key={printer.dev_id}>
                                        <div className="flex flex-row gap-2 items-center w-full">
                                            <img src={getProductImageURL(printer.dev_product_name)} alt={printer.dev_product_name} className="h-5" />
                                            <Divider className="h-4" orientation="vertical" />
                                            <p className="text-foreground">
                                                {printer.name} &nbsp;
                                                <span className="text-default-500 text-light">
                                                    {printer.dev_product_name}
                                                </span>
                                            </p>
                                            {pathname === `/printers/${printer.dev_id}` && (
                                                <Check className="text-secondary ml-auto" />
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </AccordionItem>
                    </Accordion>
                ) : (
                    <Link
                        href={url}
                        isDisabled={isDisabled}
                        color="foreground"
                        className="font-light text-xl flex items-center align-middle cursor-pointer text-primary-800 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-300"
                    >
                        <div>
                            {cloneElement(icon, { className: pathname === url ? 'text-secondary' : 'text-foreground' })}
                        </div>
                        <AnimatePresence>
                            <motion.div
                                key={name}
                                initial="closed"
                                animate="open"
                                exit="closed"
                                variants={itemVariants}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                <div className="ml-2 flex flex-row items-baseline gap-2">
                                    {name}
                                    {isDisabled && (
                                        <Chip
                                            variant="shadow"
                                            size="sm"
                                            className="text-xs ml-auto"
                                            classNames={{
                                                base: "bg-gradient-to-br from-primary-500 to-secondary-500 border-small border-white/50 shadow-secondary-500/30",
                                                content: "drop-shadow shadow-black text-white",
                                            }}
                                        >
                                            Coming Soon
                                        </Chip>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </Link>
                )
            ) : (
                <Tooltip content={name} placement="right" closeDelay={0} showArrow>
                    <Link
                        href={url}
                        isDisabled={isDisabled}
                        color="foreground"
                        className="font-light text-xl flex items-center align-middle cursor-pointer text-primary-800 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-300"
                    >
                        <div className="mx-auto">
                            {cloneElement(icon, { className: pathname === url ? 'text-secondary' : 'text-foreground' })}
                        </div>
                    </Link>
                </Tooltip>
            )}
        </>
    );
}

export default SidebarItem;
