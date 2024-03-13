"use client";

import { useEffect, useState } from "react";
import { MemoryChart } from "@/components/Graph/Graph";

interface InfoRam {
    totalRam: number;
    memoriaEnUso: number;
    porcentaje: number;
    libre: number;
}

const mockInfoRam: InfoRam = { "totalRam": 4102373376, "memoriaEnUso": 3463741440, "porcentaje": 84, "libre": 638631936 }
const conversionToGb = 1024 * 1024 * 1024;

export default function Monitoreo() {

    const [infoCpu, setInfoCpu] = useState<number[]>([100, 200])
    const [infoRam, setInfoRam] = useState<number[]>([100, 300])

    useEffect(() => {
       setInfo();

        // Establece un intervalo para llamar a getInfo cada 5 segundos
        const intervalId = setInterval(() => {
            setInfo();
        }, 5000);

        // Limpia el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, []);

    const getInfo = async <T= any>(url: string): Promise<T> => {
        try {
            const response = await fetch(
                url,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (response.ok) {
                const strResponse = await response.json();
                const jsonResponse = JSON.parse(strResponse);
                console.log(jsonResponse, typeof jsonResponse)
                return jsonResponse as T;
            }

            return mockInfoRam as T;
        } catch (error) {
            console.log(error)
            return mockInfoRam as T;
        }
    }

    const setInfo = async () => {
        const ramResponse = await getInfo<InfoRam>('/api/ram');
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