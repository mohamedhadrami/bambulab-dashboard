"use client"

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Release {
    version: string;
    content: string;
}

const Page: React.FC = () => {
    const [releases, setReleases] = useState<Release[]>([]);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('/api/releases');
            const data = await response.json();
            setReleases(data);
        }

        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Releases</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {releases.map((release) => (
                    <div key={release.version} className="border p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">Version {release.version}</h2>
                        <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
                            {release.content}
                        </ReactMarkdown>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
