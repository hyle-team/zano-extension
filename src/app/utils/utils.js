export async function fetchBackground(data) {
    return new Promise((resolve, reject) => {
        try {
             // eslint-disable-next-line no-undef
            chrome.runtime.sendMessage(data, function (response) {
                resolve(response);
            });
        } catch (error) {
            console.error(`Error while fetching data (${data.method}):`, error);
            reject(error);
        }
    });
};