// @/app/account/page.tsx

"use client"

import { BambuDevice, BambuProfile } from "@/types/bambuApi/bambuApi";
import React, { useEffect, useState } from "react";

const Page: React.FC = () => {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [printers, setPrinters] = useState<BambuDevice[]>([])

    const [profile, setProfile] = useState<BambuProfile>();

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

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch('/api/bambulab/profile');
            if (res.status === 200) {
                const resData = await res.json();
                setProfile(resData.data);
            }
        };
        fetchProfile();
    }, [isLoggedIn]);


    return (
        <div>
            {profile && (
                <div>
                    <p>{profile.name}</p>
                </div>
            )}
            {profile && (
                <p>
                    {JSON.stringify(profile, null, 4)}
                </p>
            )}
        </div>
    )
}

export default Page;