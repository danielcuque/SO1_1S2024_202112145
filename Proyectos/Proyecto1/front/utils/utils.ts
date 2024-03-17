export type ChildProcess = {
    ChildrenProcessId: number;
    ChildrenPID: number;
    ChildrenName: string;
    ChildrenState: number;
    ChildrenRSS: number;
    ChildrenUID: number;
}

export type Process = {
    ProcessId: number;
    PID: number;
    Name: string;
    State: number;
    RSS: number;
    UID: number;
    Children: ChildProcess[];
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


export const getAllProcessesWithChildren = (processes: Process[]): Process[] => {
    const allProcesses: Process[] = [];
    processes.forEach(process => {
        allProcesses.push(process);
        if (process.Children.length > 0) {
            allProcesses.push(...getAllProcessesWithChildren(process.Children.map(child => {
                return {
                    ProcessId: child.ChildrenProcessId,
                    PID: child.ChildrenPID,
                    Name: child.ChildrenName,
                    State: child.ChildrenState,
                    RSS: child.ChildrenRSS,
                    UID: child.ChildrenUID,
                    Children: []
                }
            })));
        }
    });
    return allProcesses;
}
