import Big from "big.js";

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
}

const multiplier = new Big((1e12).toString());

export const removeZeros = (amount) => {
  const bigAmount = new Big(amount);
  const fixedAmount = bigAmount.div(multiplier).toString();
  return fixedAmount;
};

export const addZeros = (amount) => {
  const bigAmount = new Big(amount);
  const fixedAmount = bigAmount.times(multiplier);
  return fixedAmount;
};
