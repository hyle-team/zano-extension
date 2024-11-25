class Zano {
    async request(method, params, timeoutParam) {
        
        function getRandonString(length) {
            let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let charLength = chars.length;
            let result = '';

            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * charLength));
            }

            return result;
        }


        const listenerID = getRandonString(16);
        const timeoutMs = typeof timeoutParam === "number" ? timeoutParam : null;

        return new Promise((resolve, reject) => {

            const timeout = timeoutMs !== null ? (
                setTimeout(() => {
                    reject('Request timeout exceeded');
                    document.removeEventListener(`zano_response_${listenerID}`, handleResponse);
                }, timeoutMs)
            ) : undefined;

            function handleResponse(e) {                
                document.removeEventListener(`zano_response_${listenerID}`, handleResponse);
                if (timeout) {
                    clearTimeout(timeout);  
                }
                resolve(e.detail);
            }

            document.addEventListener(`zano_response_${listenerID}`, handleResponse);

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