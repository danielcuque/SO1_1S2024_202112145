"use client";

import { Fragment, useEffect, useState } from 'react';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import { CpuResponse, Process, buildDotFromProcess, buildDotFromTree, getInfo } from '@/utils/utils';
import { Listbox, Transition } from '@headlessui/react';



export default function Arbol() {
    const [processes, setProcesses] = useState<Process[]>([]);
    const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
    const [tree, setTree] = useState('')

    useEffect(() => {
        setInfo();
    }, []);

    useEffect(() => {
        if (currentProcess) {
            rebuildTree();
        }
    }, [currentProcess]);

    const setInfo = async () => {
        try {
            const treeResponse = await getInfo<CpuResponse>('/api/tree');
            console.log(treeResponse, 'AAAAAAAAAA');

            setProcesses(treeResponse.processes);

            const dot = buildDotFromTree(treeResponse.processes);

            const viz = new Viz({ Module, render });
            const svg = await viz.renderString(dot, { format: 'svg' });
            setTree(svg);
        } catch (error) {
            console.error('Error al obtener información:', error);
        }
    }

    const rebuildTree = async () => {
        try {
            if (!currentProcess) return;
            const dot = buildDotFromProcess(currentProcess);
            const viz = new Viz({ Module, render });
            const svg = await viz.renderString(dot, { format: 'svg' });
            setTree(svg);
        } catch (error) {
            console.error('Error al reconstruir el árbol:', error);
        }
    }

    return (
        <div className='px-4'>
            <h1 className="text-3xl font-semibold text-center">Árbol de procesos</h1>
            <Listbox value={currentProcess} onChange={setCurrentProcess}>
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    {currentProcess ? currentProcess.name : 'Selecciona un proceso'}
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute z-10 w-1/2 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {processes.map(process => (
                            <Listbox.Option key={process.pid} value={process}>
                                {({ selected }) => (
                                    <>
                                        <span
                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                }`}
                                        >
                                            {process.name}
                                        </span>
                                    </>
                                )}
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