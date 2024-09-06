// @/componentss/Navbar/Notifications.tsx

import { BambuMessage } from "@/types/bambuApi/bambuApi"
import { Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, CardBody, Card, Divider, DropdownSection, Image } from "@nextui-org/react"
import { Bell } from "lucide-react"
import React, { useEffect, useState } from "react"


const Notifications: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
    const [notifications, setNotfications] = useState<BambuMessage[]>();

    useEffect(() => {
        const fetchNotfications = async () => {
            const res = await fetch('/api/bambulab/messages');
            if (res.status === 200) {
                const resData = await res.json();
                setNotfications(resData.data.hits);
            }
        }
        if (isLoggedIn) {
            fetchNotfications();
        }
    }, [isLoggedIn])

    return (
        <>
            {notifications &&
                <Dropdown placement="bottom-end" className="max-w-sm bg-primary-200 dark:bg-primary-800">
                    <Badge content={notifications.length > 9 ? "9+" : notifications.length} variant="solid" color="warning">
                        <DropdownTrigger>
                            <Bell />
                        </DropdownTrigger>
                    </Badge>
                    <DropdownMenu aria-label="Notifications" variant="flat" className="max-h-[50vh] overflow-y-auto">
                        {notifications.map((notification: BambuMessage) => (
                            <DropdownSection title={notification.taskMessage.deviceName} showDivider>
                                <DropdownItem key={notification.id}>
                                    <NotificationItem notification={notification} />
                                </DropdownItem>
                            </DropdownSection>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            }
        </>
    )
}

export default Notifications;

const NotificationItem: React.FC<{ notification: BambuMessage }> = ({ notification }) => {
    return (
        <div className="flex flex-row justify-between">
            <div className="max-w-3/4">
                {notification.taskMessage.detail}
            </div>
            <Image src={notification.taskMessage.cover} className="max-w-16" />
        </div>
    )
}