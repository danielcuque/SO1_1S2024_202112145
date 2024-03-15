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
            const strResponse = await response.json();
            console.log(strResponse)
            return strResponse as T;
        }

    } catch (error) {
        console.log(error);
    } finally {
        return {} as T;
    }
}