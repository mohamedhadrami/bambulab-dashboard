// @/components/Navigation/Sidebar/Sidebar.tsx

"use client"

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { CircleArrowRight, CircleArrowLeft, House, BrainCircuit, Settings, Info, Rocket, Sun, Moon, Printer, ClipboardList, Kanban, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Tooltip } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import SidebarItem from "./SidebarItem";
import { BambuDevice } from "@/types/bambuApi/bambuApi";

const Sidebar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [printers, setPrinters] = useState<BambuDevice[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrinters = async () => {
      const res = await fetch('/api/bambulab/printers');
      if (res.status === 200) {
        const data = await res.json();
        setPrinters(data.data.devices);
      }
    }
    fetchPrinters();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleThemeChange = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  return (
    <div className="relative">
      <motion.div
        ref={sidebarRef}
        className={`flex flex-col p-4 gap-4 
                  fixed top-[64px] left-0 h-[calc(100%-64px)] z-30 
                  border-r-1 border-foreground-200
                  
                  ${isOpen ?
            'bg-gradient-to-r from-primary-300 to-primary-200 dark:from-primary-800 dark:to-primary-900'
            :
            'bg-primary-300 dark:bg-primary-800'}
                  transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}
        initial={{ width: 'w-16' }}
        animate={{ width: isOpen ? 'w-64' : 'w-16' }}
      >
        <div className={`flex ${isOpen ? 'justify-end' : 'justify-center'} items-center mb-5`}>
          <button
            className="text-primary-800 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-300"
            onClick={toggleSidebar}
          >
            {isOpen ? <CircleArrowLeft size={24} /> : <CircleArrowRight size={24} />}
          </button>
        </div>

        <SidebarItem pathname={pathname} printers={printers} name="Home" url="/" icon={<House />} isOpen={isOpen} />
        <SidebarItem pathname={pathname} printers={printers} name="Printers" url="/printers" icon={<Printer />} isOpen={isOpen} isDisabled={false} />
        <SidebarItem pathname={pathname} printers={printers} name="Tasks" url="/tasks" icon={<ClipboardList />} isOpen={isOpen} />
        <SidebarItem pathname={pathname} printers={printers} name="Projects" url="/projects" icon={<Kanban />} isOpen={isOpen} isDisabled={true} />
        <SidebarItem pathname={pathname} printers={printers} name="MQTT Server" url="/mqtt" icon={<BrainCircuit />} isOpen={isOpen} />

        <div className="flex-grow"></div>

        <Tooltip content='Theme' placement="right" closeDelay={0} showArrow>
          <Button onClick={handleThemeChange} isIconOnly variant="light" aria-label="Take a photo" className="font-light text-xl flex items-center align-middle cursor-pointer">
            <div className={`${isOpen ? '' : 'mx-auto'}`}>{theme === 'dark' ? <Sun /> : <Moon />}</div>
          </Button>
        </Tooltip>
        <SidebarItem pathname={pathname} printers={printers} name="Releases" url="/releases" icon={<Rocket />} isOpen={isOpen} isDisabled />
        <SidebarItem pathname={pathname} printers={printers} name="About" url="/about" icon={<Info />} isOpen={isOpen} isDisabled />
        <SidebarItem pathname={pathname} printers={printers} name="Account" url="/account" icon={<UserRound />} isOpen={isOpen} isDisabled/>
        <SidebarItem pathname={pathname} printers={printers} name="Settings" url="/settings" icon={<Settings />} isOpen={isOpen} />

      </motion.div>

      <div className="ml-16"></div>
    </div>
  );
}

export default Sidebar;
