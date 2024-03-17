"use client";

import { useEffect, useState } from 'react';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import { getInfo } from '@/utils/utils';

type ChildProcess = {
    ChildrenProcessId: number;
    ChildrenPID: number;
    ChildrenName: string;
    ChildrenState: number;
    ChildrenRSS: number;
    ChildrenUID: number;
}

type Process = {
    ProcessId: number;
    PID: number;
    Name: string;
    State: number;
    RSS: number;
    UID: number;
    Children: ChildProcess[];
}

type CpuResponse = {
    CpuUsed: number;
    Processes: Process[];
}


export default function Arbol() {
    const [tree, setTree] = useState('')

    useEffect(() => {
        setInfo();
    }, []);

    const setInfo = async () => {
        try {
            const treeResponse = await getInfo<CpuResponse>('/api/tree');
            console.log(treeResponse, 'AAAAAAAAAA');
            const dot = `digraph G {
                ${treeResponse.Processes.map(process => {
                return process.Children.map(child => {
                    return `${process.PID} -> ${child.ChildrenPID}`;
                }).join('\n');
            }).join('\n')}
            }`;
            const viz = new Viz({ Module, render });
            const svg = await viz.renderString(dot, { format: 'svg' });
            setTree(svg);
        } catch (error) {
            console.error('Error al obtener información:', error);
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-semibold text-center">Árbol de procesos</h1>

            <div className="flex justify-center">
                <div className="w-1/2">
                    <div dangerouslySetInnerHTML={{ __html: tree }} />
                </div>
            </div>
        </div>
    );
}