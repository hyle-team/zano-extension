async function fetchData(data) {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage(data, function (response) {
                resolve(response);
            });
        } catch (error) {
            console.error(`Error while fetching data (${method}):`, error);
            reject(error);
        }
    });
};

document.addEventListener('zano_request', async (e) => {
    const data = e.detail;
    const response = await fetchData(data);

    document.dispatchEvent(new CustomEvent(`zano_response_${data.listenerID}`, {
        detail: response
    }));

});

console.log('Zano wallet loaded');