"use client";

import { LineChart } from "@/components/Graph/Graph";

export default function Historico() {

    const nowStr = new Date().toLocaleString();

    return (
        <div>
            <h1 className="text-3xl font-semibold text-center">Registros históricos</h1>
            <div className="w-full flex flex-col h-full gap-16 justify-around mt-4">
                <div>
                    <h2 className="text-xl text-center mt-4">Memoria RAM</h2>
                    {
                        <LineChart data={[0, 100, 200, 120, 20, 10, 23]} labels={[
                            nowStr,
                            nowStr,
                            nowStr,
                            nowStr,
                            nowStr,
                            nowStr,
                        ]} 
                        
                        dataSetLabel="Uso de RAM"
                        />
                    }
                </div>
                <div>
                    <h2 className="text-xl text-center mt-4">CPU</h2>
                    {
                        <LineChart data={[0, 100, 200, 120, 20, 10, 23]} labels={[
                            nowStr,
                            nowStr,
                            nowStr,
                            nowStr,
                            nowStr,
                            nowStr,
                        ]} 
                        
                        dataSetLabel="Uso de CPU"
                        />
                    }
                </div>
            </div>
        </div>
    );
}