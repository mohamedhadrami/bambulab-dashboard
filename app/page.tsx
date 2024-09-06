// @/app/page.tsx

"use client"

import { getProductImageURL } from "@/services/utils";
import { BambuDevice } from "@/types/bambuApi/bambuApi";
import { Card, Image, CardBody, CardHeader, Link } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

const Page: React.FC = () => {
  const [printers, setPrinters] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/bambulab/printers');
      if (res.ok) {
        const data = await res.json();
        setPrinters(data.data.devices)
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-5 max-w-screen-lg mx-auto">
      {printers &&
        <>
          <div className="flex flex-row justify-between">
            <Card
              isFooterBlurred
              radius="lg"
              className="bg-gradient-to-br 
          from-primary-300 to-primary-400
          dark:from-primary-800 dark:to-primary-900 border border-primary-600 w-1/4 h-full"
            >
              <CardHeader className="">
                <p className="text-md">Total printers</p>
              </CardHeader>
              <CardBody className="flex flex-row justify-end px-8 py-4">
                <p className="text-4xl justify-end">{printers.length}</p>
              </CardBody>
            </Card>
            <Card
              isFooterBlurred
              radius="lg"
              className="bg-gradient-to-br 
                from-primary-300 to-primary-400
                dark:from-primary-800 dark:to-primary-900 
                border border-primary-600 w-1/4 h-full"
            >
              <CardBody className="">
                <p className="text-tiny">Available soon.</p>
              </CardBody>
            </Card>
            <Card
              isFooterBlurred
              radius="lg"
              className="bg-gradient-to-br 
                from-primary-300 to-primary-400
                dark:from-primary-800 dark:to-primary-900 
                border border-primary-800 w-1/4 h-full"
            >
              <CardBody className="">
                <p className="text-tiny">Available soon.</p>
              </CardBody>
            </Card>
          </div>
          <Card className="
            bg-gradient-to-br 
            from-primary-100 to-primary-300
            dark:from-primary-800 dark:to-primary-900">
            <CardHeader>
              <p className="text-lg font-bold">Active Printers</p>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {printers.map((printer, index) => (
                <ActivePrinter key={index} printer={printer} />
              ))}
            </CardBody>
          </Card>
        </>
      }
    </div>
  );
}

export default Page;


interface ActivePrinterProps {
  printer: BambuDevice;
}

const ActivePrinter: React.FC<ActivePrinterProps> = ({ printer }) => {

  return (
    <Link href={`/printers/${printer.dev_id}`}>
      <Card className="
          bg-gradient-to-br 
          from-primary-300 to-primary-400
          dark:from-primary-700 dark:to-primary-900
          w-full"
        radius="sm">
        <CardBody className="gap-2 p-4">
          <div className="flex items-center mb-4">
            <p className="font-extralight text-xl">{printer.name}</p>
            <div className="ml-auto">
              <div className={`rounded-full h-2 w-2 ml-auto m-1 mb-2 animate-ping absolute ${printer.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className={`rounded-full h-2 w-2 ml-auto m-1 mb-2 relative ${printer.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Image src={getProductImageURL(printer.dev_product_name)} alt={printer.dev_product_name} className="w-20 h-20 object-contain" />
            <div>
              <p className="font-semibold">{printer.dev_product_name}</p>
              <p className="text-foreground-400 hidden-text reveal-text">{printer.dev_id}</p>
              <p className="text-foreground-400">{printer.print_status}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};

