"use client";

import { LineChart } from "@/components/Graph/Graph";
import { getInfo } from "@/utils/api";
import { useEffect, useState } from "react";

interface HistoricalData {
    value: number;
    date: string;
}

export default function Historico() {

    const [historicalData, setHistoricalData] = useState<{
        ram: HistoricalData[],
        cpu: HistoricalData[],
    }>({
        ram: [],
        cpu: [],
    })
    
    useEffect(() => {
        setInfo();
    }, []);

    const setInfo = async () => {
        const response = await getInfo<{
            ram: HistoricalData[],
            cpu: HistoricalData[],
        }>('/api/historical');
        setHistoricalData(response);
    }

    return (
        <div>
            <h1 className="text-3xl font-semibold text-center">Registros históricos</h1>
            <div className="w-full flex flex-col h-full gap-16 justify-around mt-4">
                <div>
                    <h2 className="text-xl text-center mt-4">Memoria RAM</h2>
                    {
                        <LineChart data={
                            historicalData.ram.map((data) => data.value)
                        } labels={
                            historicalData.ram.map((data) => data.date)
                        } 
                        dataSetLabel="Uso de RAM"
                        />
                    }
                </div>
                <div>
                    <h2 className="text-xl text-center mt-4">CPU</h2>
                    {
                        <LineChart data={
                            historicalData.cpu.map((data) => data.value)
                        } labels={
                            historicalData.cpu.map((data) => data.date)
                        } 
                        
                        dataSetLabel="Uso de CPU"
                        />
                    }
                </div>
            </div>
        </div>
    );
}