export const getInfo = async <T= any>(url: string): Promise<T> => {
    try {
        const response = await fetch(
            url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        }

    } catch (error) {
        console.log(error);
    } finally {
        return {} as T;
    }
}