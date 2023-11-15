/*global chrome*/
import Big from "big.js";
import sha256 from "sha256";

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

export const setPassword = (password) => {
  localStorage.setItem("hash", sha256(password));
}

export const comparePasswords = (password) => {
  const hash = localStorage.getItem("hash");
  return hash === sha256(password);
}

export const passwordExists = () => {
  return !!localStorage.getItem("hash");
}

export const getSessionLogIn = async () => {
  // return !!localStorage.getItem("login");
  return !!(await fetchBackground({ method: "GET_LOGIN" })).login;
}

export const setSessionLogIn = async (login) => {
  await fetchBackground({ method: "SET_LOGIN", login: !!login })
}