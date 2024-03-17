export type Process = {
    ProcessId: number;
    PID: number;
    Name: string;
    State: number;
    RSS: number;
    UID: number;
    Children: Process[];
}

export type CpuResponse = {
    cpuUsed: number;
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
    
    // Agregar el nodo actual al texto DOT
    dot += `  ${process.PID} [label="${process.Name}"];\n`;

    // Si el proceso tiene hijos, agregar las relaciones entre nodos
    if (process.Children && process.Children.length > 0) {
        process.Children.forEach(child => {
            dot += `  ${process.PID} -> ${child.PID};\n`;
            // Llamar recursivamente a la función para el hijo actual
            dot += buildDot(child);
        });
    }

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