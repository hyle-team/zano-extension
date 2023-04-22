class Zano {
    async request(method, params) {

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


        return new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {
                reject('Request timeout exceeded');
                document.removeEventListener(`zano_response_${listenerID}`, handleResponse);
            }, 30000);

            function handleResponse(e) {                
                document.removeEventListener(`zano_response_${listenerID}`, handleResponse);
                clearTimeout(timeout);  
                resolve(e.detail);
            }

            document.addEventListener(`zano_response_${listenerID}`, handleResponse);

            document.dispatchEvent(new CustomEvent('zano_request', { 
                detail: {
                    method: method,
                    listenerID: listenerID,
                    ...params
                }
            }));

        });
    }
}

window.zano = new Zano();