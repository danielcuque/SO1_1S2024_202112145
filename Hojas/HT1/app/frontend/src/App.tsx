import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { GetInfo } from "../wailsjs/go/main/App";

interface Info {
    totalRam: number;
    memoriaEnUso: number;
    porcentaje: number;
    libre: number;
}

interface MemoryChartProps {
    data: Info;
}

const conversion = 1024 * 1024 * 1024;

const MemoryChart: React.FC<MemoryChartProps> = ({ data }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const myChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Utilizado', 'Libre'],
                        datasets: [{
                            data: [data.memoriaEnUso, data.libre],
                            backgroundColor: ['#FF6384', '#36A2EB'],
                            hoverBackgroundColor: ['#FF6384', '#36A2EB'],
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                    },
                });
                return () => {
                    myChart.destroy(); // Limpia el gráfico al desmontar el componente
                };
            }
        }
    }, [data]);

    return (
        <div>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

const App: React.FC = () => {
    const [info, setInfo] = useState<Info>();

    useEffect(() => {
        // Llama a getInfo inmediatamente
        getInfo();

        // Establece un intervalo para llamar a getInfo cada 5 segundos
        const intervalId = setInterval(() => {
            getInfo();
        }, 5000);

        // Limpia el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, []);

    function getInfo() {
        GetInfo().then((info) => {
            setInfo(JSON.parse(info));
        });
    }

    return (
        <div id="App">
            <p>Total RAM: {
                info?.totalRam ? (info.totalRam / conversion).toFixed(2) + " GB" : "Cargando..."
            }</p>

            <p>
                Memoria en uso: {
                    info?.memoriaEnUso ? (info.memoriaEnUso / conversion).toFixed(2) + " GB" : "Cargando..."
                }
            </p>

            <p>Porcentaje: {info?.porcentaje}%</p>
            <p>
                Libre: {
                    info?.libre ? (info.libre / conversion).toFixed(2) + " GB" : "Cargando..."
                }
            </p>
            <div id="grafica">
                {info && <MemoryChart data={info} />}
            </div>
        </div>
    );
};

export default App;
