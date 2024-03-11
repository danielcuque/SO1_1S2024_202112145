"use client";

import { MemoryChart } from "@/components/Graph/Graph";
import { useState } from "react";

interface InfoRam {
    totalRam: number;
    memoriaEnUso: number;
    porcentaje: number;
    libre: number;
}

export default function Monitoreo() {

    const [infoCpu, setInfoCpu] = useState<number[]>([100, 200])
    const [infoRam, setInfoRam] = useState<number[]>([100, 300])

    return (
        <div className="mt-10 mx-8">
            <h1 className="text-3xl font-semibold text-center">Monitoreo en tiempo real</h1>

            <div className="w-full flex justify-around mt-4">
                <div>
                    <h2 className="text-xl text-center mt-4">Memoria RAM</h2>
                    {
                        infoRam && (
                            <MemoryChart data={[
                                100,
                                200
                            ]}

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
                            <MemoryChart data={[
                                100,
                                200
                            ]}
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