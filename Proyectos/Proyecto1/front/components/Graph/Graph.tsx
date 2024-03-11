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
            myChart.destroy();
        };

    }, [data]);

    return (
        <div>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};