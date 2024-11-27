class Zano {
    async request(method: string, params: Record<string, any>, timeoutParam?: number): Promise<any> {
        
        function getRandonString(length: number): string {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            const charLength = chars.length;
            let result = '';

            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * charLength));
            }

            return result;
        }

        const listenerID = getRandonString(16);
        const timeoutMs: number | null = typeof timeoutParam === "number" ? timeoutParam : null;

        return new Promise((resolve, reject) => {

            const timeout = timeoutMs !== null ? (
                setTimeout(() => {
                    reject('Request timeout exceeded');
                    document.removeEventListener(`zano_response_${listenerID}`, handleResponse as EventListener);
                }, timeoutMs)
            ) : undefined;

            function handleResponse(e: CustomEvent) {                
                document.removeEventListener(`zano_response_${listenerID}`, handleResponse as EventListener);
                if (timeout) {
                    clearTimeout(timeout);  
                }
                resolve(e.detail);
            }

            document.addEventListener(`zano_response_${listenerID}`, handleResponse as EventListener);

            document.dispatchEvent(new CustomEvent('zano_request', { 
                detail: {
                    method: method,
                    listenerID: listenerID,
                    timeout: timeoutMs,
                    ...params
                }
            }));

        });
    }
}

window.zano = new Zano();
