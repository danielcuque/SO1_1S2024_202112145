export interface ProcessChild {
    pid: number;
    name: string;
    state: number;
    pidPadre: number;
    child: ProcessChild[];
}

export interface Process {
    pid: number;
    name: string;
    state: number;
    child: ProcessChild[];
}

export interface CpuResponse {
    percentage: number;
    total_usage: number;
    total_time_cpu: number;
    processes: Process[];
}

export const getInfo = async <T= any>(url: string): Promise<T> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            throw new Error('La solicitud no fue exitosa');
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error;
    }
}

export const convertToGb = (value: number) => value / 1024 / 1024 / 1024;


export const buildDot = (process: Process): string =>{
    let dot = '';
    // Construir el nodo para el proceso
    dot += `${process.pid} [label="${process.name}"];\n`;
    // Construir los nodos para los procesos hijos
    process.child.forEach(child => {
        dot += buildDotChild(process.pid, child);
    });
    return dot;
}

export const buildDotChild = (pid: number, child: ProcessChild): string => {
    let dot = '';
    // Construir el nodo para el proceso hijo
    dot += `${child.pid} [label="${child.name}"];\n`;
    // Construir la relación entre el proceso padre y el hijo
    dot += `${pid} -> ${child.pid};\n`;
    // Construir los nodos para los procesos hijos del proceso hijo
    child.child.forEach(child => {
        dot += buildDotChild(child.pid, child);
    });
    return dot;
}

export const buildDotFromTree = (processes: Process[]): string => {
    let dot = 'digraph G {\n';
    
    // Construir el texto DOT recursivamente para cada proceso raíz
    processes.forEach(process => {
        dot += buildDot(process);
    });

    dot += '}\n';

    return dot;
}