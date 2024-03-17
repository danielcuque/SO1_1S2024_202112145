"use client";

import { useEffect, useState } from "react";
import { MemoryChart } from "@/components/Graph/Graph";
import { convertToGb, getInfo } from "@/utils/utils";

interface InfoRam {
    totalRam: number;
    memoriaEnUso: number;
    porcentaje: number;
    libre: number;
}

interface InfoCpu {
    cpu: number;
}


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

    

    const setInfo = async () => {
        try {
            const ramResponse = await getInfo<InfoRam>('/api/ram');
            const cpuResponse = await getInfo<InfoCpu>('/api/cpu');
        
            const usedCpu = cpuResponse.cpu;
            const freeCpu = 100 - usedCpu;
    
            const { memoriaEnUso, libre } = ramResponse;
    
            const memoriaEnUsoGb = convertToGb(memoriaEnUso);
            const libreGb = convertToGb(libre);
    
            
            setInfoRam([memoriaEnUsoGb, libreGb]);
            setInfoCpu([usedCpu, freeCpu]);
        } catch (error) {
            console.error('Error al obtener información:', error);
        }
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