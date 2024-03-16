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
