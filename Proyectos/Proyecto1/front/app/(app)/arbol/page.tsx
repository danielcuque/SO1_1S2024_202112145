"use client";

import { Fragment, useEffect, useState } from 'react';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import { CpuResponse, Process, getInfo } from '@/utils/utils';
import { Listbox, Transition } from '@headlessui/react';



export default function Arbol() {
    const [processes, setProcesses] = useState<Process[]>([]);
    const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
    const [tree, setTree] = useState('')

    useEffect(() => {
        setInfo();
    }, []);

    const setInfo = async () => {
        try {
            const treeResponse = await getInfo<CpuResponse>('/api/tree');
            console.log(treeResponse, 'AAAAAAAAAA');

            setProcesses(treeResponse.processes);

            const dot = `digraph G {
                ${treeResponse.processes.map(process => {
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
            <Listbox value={currentProcess} onChange={setCurrentProcess}>
                <Listbox.Button>
                    {currentProcess ? currentProcess.Name : 'Selecciona un proceso'}
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options>
                        {processes.map(process => (
                            <Listbox.Option key={process.PID} value={process}>
                                {process.Name}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </Listbox>
            <div className="flex justify-center">
                <div className="w-1/2">
                    <div dangerouslySetInnerHTML={{ __html: tree }} />
                </div>
            </div>
        </div>
    );
}