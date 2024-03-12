import { useEffect, useRef } from "react";
import Chart from 'chart.js/auto';

interface MemoryChartProps {
    data: number[];
    labels?: string[];
}

export const MemoryChart: React.FC<MemoryChartProps> = ({ data, labels }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {

        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        if (!ctx) return;


        const myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: data || [0, 0],
                    backgroundColor: ['#ADD8E6', '#4682B4'],
                    hoverBackgroundColor: ['#ADD8E6', '#4682B4'],
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });
        return () => {
            myChart.destroy();
        };

    }, [data]);

    return (
        <div>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

interface LineChartProps extends MemoryChartProps {
    dataSetLabel: string
}


export const LineChart: React.FC<LineChartProps> = ({ data, labels, dataSetLabel }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {

        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        if (!ctx) return;

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: dataSetLabel,
                    data,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
        return () => {
            myChart.destroy();
        };

    }, [data]);

    return (
        <div>
            <canvas ref={chartRef}></canvas>
        </div>
    );
}