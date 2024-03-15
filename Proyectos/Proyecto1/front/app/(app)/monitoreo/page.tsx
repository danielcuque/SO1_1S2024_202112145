"use client";

import { useEffect, useState } from "react";
import { MemoryChart } from "@/components/Graph/Graph";
import { getInfo } from "@/utils/api";

interface InfoRam {
    totalRam: number;
    memoriaEnUso: number;
    porcentaje: number;
    libre: number;
}

const conversionToGb = 1024 * 1024 * 1024;

export default function Monitoreo() {

    const [infoCpu, setInfoCpu] = useState<number[]>([100, 200])
    const [infoRam, setInfoRam] = useState<number[]>([100, 300])

    useEffect(() => {
       setInfo();

        // Establece un intervalo para llamar a getInfo cada 5 segundos
        const intervalId = setInterval(() => {
            setInfo();
        }, 500);

        // Limpia el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, []);

    

    const setInfo = async () => {
        const ramResponseStr = await getInfo<string>('/api/ram');
        const ramResponse = JSON.parse(ramResponseStr) as InfoRam;
        const cpuResponse = await getInfo<string>('/api/cpu');
    
        const freeCpuStr = cpuResponse.trim().replace(',', '.');
        const freeCpu = parseFloat(freeCpuStr);
        const usedCpu = 100 - freeCpu;

        const { memoriaEnUso, libre } = ramResponse;

        const memoriaEnUsoGb = memoriaEnUso / conversionToGb;
        const libreGb = libre / conversionToGb;
        
        setInfoRam([memoriaEnUsoGb, libreGb]);
        setInfoCpu([usedCpu, freeCpu]);
    }


    return (
        <div className="mt-10 mx-8">
            <h1 className="text-3xl font-semibold text-center">Monitoreo en tiempo real</h1>

            <div className="w-full flex justify-around mt-4">
                <div>
                    <h2 className="text-xl text-center mt-4">Memoria RAM</h2>
                    {
                        infoRam && (
                            <MemoryChart data={infoRam}

                                labels={[
                                    'Utilizado',
                                    'Libre'
                                ]}
                            />
                        )
                    }
                </div>
                <div>
                    <h2 className="text-xl text-center mt-4">CPU</h2>
                    {
                        infoCpu && (
                            <MemoryChart data={infoCpu}
                                labels={[
                                    'Uso de CPU',
                                    'Libre'
                                ]}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    );
}