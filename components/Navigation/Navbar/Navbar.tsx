'use client';

import React, { useEffect, useState } from "react";
import { Chip, Link, Navbar, NavbarBrand, NavbarContent, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Tooltip } from "@nextui-org/react";
import { useWebSocket } from '@/hooks/useWebSocket';
import styled from 'styled-components';
import packageInfo from "@/package.json";
import AccountAvatar from "./AccountAvatar";
import Notifications from "./Notifications";
import { BambuDevice, BambuProfile } from "@/types/bambuApi/bambuApi";
import CustomNavbarMenu from "./NavbarMenu";
import { Printer, ClipboardList, Kanban, BrainCircuit, Settings, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

const StatusIndicator = styled.div<{ statusColor: string }>`
  width: 12px;
  height: 12px;
  border-radius: 100%;
  background: ${({ statusColor }) => statusColor};
`;

export type NavigationItem = {
  key: string;
  label: string;
  description: string;
  icon: JSX.Element;
  href: string;
  isDisabled: boolean;
};

const navigation: NavigationItem[] = [
  {
    key: "printers",
    label: "Printers",
    description: "View and manage your connected printers",
    icon: <Printer />,
    href: "/printers",
    isDisabled: false
  },
  {
    key: "tasks",
    label: "Tasks",
    description: "View your current tasks and their status",
    icon: <ClipboardList />,
    href: "/tasks",
    isDisabled: false
  },
  {
    key: "projects",
    label: "Projects",
    description: "Manage your ongoing projects",
    icon: <Kanban />,
    href: "/projects",
    isDisabled: true
  },
  {
    key: "mqtt",
    label: "MQTT Server",
    description: "Access the MQTT server settings and configurations",
    icon: <BrainCircuit />,
    href: "/mqtt",
    isDisabled: false
  },
  {
    key: "settings",
    label: "Settings",
    description: "Adjust your application settings",
    icon: <Settings />,
    href: "/settings",
    isDisabled: false
  },
  {
    key: "account",
    label: "Account",
    description: "View your account information",
    icon: <UserRound />,
    href: "/account",
    isDisabled: true
  },
];

const CustomNavbar: React.FC = () => {
  const { isConnected, isMqttConnected, subscribedTopics } = useWebSocket();
  const [statusColor, setStatusColor] = useState<string>("");
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [printers, setPrinters] = useState<BambuDevice[]>([])

  const pathname = usePathname();
  const [profile, setProfile] = useState<BambuProfile>();

  useEffect(() => {
    if (isConnected && isMqttConnected) {
      setStatusColor("#17c964");
      setTooltipContent('WS and MQTT connected');
    } else if (isConnected) {
      setStatusColor("linear-gradient(to right, #17c964, #ff0505)");
      setTooltipContent('MQTT not connected');
    } else {
      setStatusColor("#ff0505");
      setTooltipContent('WS not connected');
    }
  }, [isConnected, isMqttConnected])

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/cookies?param=token');
      if (res.status === 200) {
        setIsLoggedIn(true);
      }
      else setIsLoggedIn(false);
    };
    checkAuth();

    const fetchPrinters = async () => {
      const res = await fetch('/api/bambulab/printers');
      if (res.status === 200) {
        const data = await res.json();
        setPrinters(data.data.devices);
      }
    }
    fetchPrinters();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/bambulab/profile');
      if (res.status === 200) {
        const resData = await res.json();
        setProfile(resData.data);
      }
    };
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn, pathname]);

  return (
    <Navbar className="
      bg-gradient-to-r 
      from-primary-300 to-primary-200 
      dark:from-primary-800 dark:to-primary-900 
      z-40"
      maxWidth="full"
      isBordered>
      <NavbarBrand>
        <Link className="text-foreground font-normal cursor-pointer" href="/">Bambu Lab Dashboard</Link>
      </NavbarBrand>
      <NavbarContent className="gap-4" justify="end">
        <Tooltip content={
          <div>
            {tooltipContent}
            {isMqttConnected && subscribedTopics.map((topic: string) => (
              <p>{topic}</p>
            ))}
          </div>
        }>
          <div>
            <StatusIndicator className="animate-ping absolute" statusColor={statusColor} />
            <StatusIndicator className="relative" statusColor={statusColor} />
          </div>
        </Tooltip>
        <div className="hidden sm:flex gap-4 items-center">
          <Chip className="font-thin text-foreground bg-primary-400 dark:bg-primary-500">{packageInfo.version}</Chip>
          <Notifications isLoggedIn={isLoggedIn} />
          {printers &&
            <AccountAvatar isLoggedIn={isLoggedIn} printers={printers} navigation={navigation} profile={profile!} pathname={pathname} />
          }
        </div>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      </NavbarContent>
      <NavbarMenu>
        <CustomNavbarMenu printers={printers} navigation={navigation} profile={profile!} pathname={pathname} />
      </NavbarMenu>
    </Navbar>
  );
}

export default CustomNavbar;
