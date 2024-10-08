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

export interface GraphProps {
    nodes: Node[];
    edges: Edge[];
}

export interface Node {
    id: number;
    label: string;
    color: string;
}

export interface Edge {
    from: number;
    to: number;
    label: string;
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
    dot += `${process.pid} [label="${process.name} - ${process.pid}"];\n`;
    // Construir los nodos para los procesos hijos
    process.child.forEach(child => {
        dot += buildDotChild(process.pid, child);
    });
    return dot;
}

export const buildDotChild = (pid: number, child: ProcessChild): string => {
    let dot = '';
    // Construir el nodo para el proceso hijo
    dot += `${child.pid} [label="${child.name} - ${child.pid}"];\n`;
    // Construir la relación entre el proceso padre y el hijo
    dot += `${child.pidPadre} -> ${child.pid};\n`;
    // Construir los nodos para los procesos hijos del proceso hijo
    child.child.forEach(child => {
        dot += buildDotChild(child.pid, child);
    });
    return dot;
}

export const buildDotFromProcess = (process: Process): string => {
    let dot = 'digraph G {\n';

    // Construir el DOT a partir del proceso específico
    dot += buildDot(process);
    dot += '}';
    return dot;
}

export const buildDotFromTree = (processes: Process[]): string => {
    let dot = 'digraph G {\n';
    
    processes.forEach(process => {
        dot += buildDot(process);
    });

    dot += '}';

    return dot;
}

export const buildSimulationGraph = (grahProps: GraphProps): string => {
    let dot = 'digraph G {\n';
    grahProps.nodes.forEach(node => {
        dot += `${node.id} [label="${node.label}" color="${node.color}"];\n`;
    });
    grahProps.edges.forEach(edge => {
        dot += `${edge.from} -> ${edge.to} [label="${edge.label}"];\n`;
    });
    dot += '}';
    return dot;
}