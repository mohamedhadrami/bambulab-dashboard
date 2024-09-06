// @/components/Navbar/CustomNavbarMenu.tsx

import { BambuDevice, BambuProfile } from "@/types/bambuApi/bambuApi";
import { Accordion, AccordionItem, Chip, Divider, Image, Link } from "@nextui-org/react";
import { NavigationItem } from "./Navbar";
import useAuth from "@/hooks/useAuth";
import { getProductImageURL } from "@/services/utils";
import React, { cloneElement, useEffect } from "react";
import { Check } from "lucide-react";

interface CustomNavbarMenuProps {
    printers: BambuDevice[];
    navigation: NavigationItem[];
    profile: BambuProfile;
    pathname: string;
}

const CustomNavbarMenu: React.FC<CustomNavbarMenuProps> = ({ printers, navigation, profile, pathname }) => {
    const { handleLogout } = useAuth();

    return (
        <>
            <div key="profile" className="w-full">
                <p className="font-semibold">
                    Signed in as &nbsp;
                    <span className="font-light">{profile.name}</span>
                </p>
            </div>
            <Divider className="my-2" />

            <div className="justify-start w-full">
                {navigation.map((item: NavigationItem) => (
                    <>
                        {item.key == "printers" ? (
                            <Accordion key={item.key}>
                                <AccordionItem title={item.label} startContent={cloneElement(item.icon, { className: pathname === item.href ? 'text-secondary' : 'text-foreground' })} subtitle={item.description}>
                                    <div className="pl-1 flex flex-col">
                                        {printers.map((printer: BambuDevice) => (
                                            <Link href={`/printers/${printer.dev_id}`} isBlock key={printer.dev_id}>
                                                <div className="flex flex-row gap-2 items-center w-full">
                                                    <Image src={getProductImageURL(printer.dev_product_name)} radius="none" className="h-5" />
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
                            </Accordion >
                        ) : (
                            <div className="flex flex-row gap-3 ml-2 items-center mb-2 w-full" key={item.key}>
                                {cloneElement(item.icon, { className: pathname === item.href ? 'text-secondary' : 'text-foreground' })}
                                <div className="flex flex-col w-full">
                                    <Link
                                        href={item.href}
                                        isDisabled={item.isDisabled}
                                        className={`w-full ${pathname === item.href ? 'text-secondary' : 'text-foreground'}`}
                                    >
                                        {item.label}
                                        {item.isDisabled && (
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
                                    </Link>
                                    <div className="font-normal text-default-500 text-sm">
                                        {item.description}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ))}
            </div >
            <Divider className="my-2" />

            <div>
                <Link color="danger" onClick={handleLogout}>Log Out</Link>
            </div>
        </>
    )
}

export default CustomNavbarMenu;
