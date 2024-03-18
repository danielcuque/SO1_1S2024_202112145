"use client";

import { useState } from "react";
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js'

import { GraphProps, buildSimulationGraph, getInfo } from "@/utils/utils";

export default function Simulacion() {

    const [pid, setPid] = useState<number | null>(null);
    const [graph, setGraph] = useState<GraphProps>({
        nodes: [{ id: 0, label: 'Start', color: 'green' }],
        edges: []
    })
    const [graphDot, setGraphDot] = useState('')

    const handleProcessState = async (state: string) => {
        // if state is not start, we just send /state/pid
        const response = await getInfo<{
            pid: number;
        }>(`/api/state/${state}${state === 'start' ? '' : `/${pid}`}`);
        if (response) {
            setPid(response.pid);
        }

        const newNodeId = graph.nodes.length;

        const newGraphProps: GraphProps = {
            nodes: [
                ...graph.nodes,
                { id: newNodeId, label: state, color: 'green' }
            ],
            edges: [
                ...graph.edges,
                { from: graph.nodes.length - 1, to: newNodeId, label: state }
            ]
        }

        setGraph(newGraphProps);
        const viz = new Viz({ Module, render });
        const dot = buildSimulationGraph(newGraphProps);
        const svg = await viz.renderString(dot, { format: 'svg' });
        setGraphDot(svg);
    }

    return (
        <div>
            <h1 className="text-3xl font-semibold text-center">Diagrama de Estados</h1>
            {
                pid && (
                    <div className="font-semibold">
                        PID {pid}
                    </div>
                )
            }
            <div className="w-full flex justify-between">
                <span></span>
                <button className="button" onClick={() => handleProcessState('start')}>Start</button>
                <button className="button" onClick={() => handleProcessState('pause')}>Pause</button>
                <button className="button" onClick={() => handleProcessState('stop')}>Stop</button>
                <button className="button" onClick={() => handleProcessState('resume')}>Resume</button>
            </div>
            <div className="flex justify-center">
                <div className="w-1/2">
                    <div dangerouslySetInnerHTML={{ __html: graphDot }} />
                </div>
            </div>
        </div>
    );
}