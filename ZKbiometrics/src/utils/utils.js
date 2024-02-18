import {POLYGON_DATA_FEED_CONTRACT} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ethers} from 'ethers';
import ReactNativeBiometrics from 'react-native-biometrics';
import EncryptedStorage from 'react-native-encrypted-storage';
import {abiDataFeeds} from '../contracts/dataFeeds';
import CID from 'cids';

export async function getAsyncStorageValue(label) {
  try {
    const session = await AsyncStorage.getItem('General');
    if (label in JSON.parse(session)) {
      return JSON.parse(session)[label];
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

export async function setAsyncStorageValue(value) {
  const session = await AsyncStorage.getItem('General');
  await AsyncStorage.setItem(
    'General',
    JSON.stringify({
      ...JSON.parse(session),
      ...value,
    }),
  );
}

export async function getEncryptedStorageValue(label) {
  try {
    const session = await EncryptedStorage.getItem('General');
    if (label in JSON.parse(session)) {
      return JSON.parse(session)[label];
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

export async function setEncryptedStorageValue(value) {
  const session = await EncryptedStorage.getItem('General');
  await EncryptedStorage.setItem(
    'General',
    JSON.stringify({
      ...JSON.parse(session),
      ...value,
    }),
  );
}

export async function eraseStorageFull() {
  // Debug Only
  try {
    await EncryptedStorage.clear();
    await AsyncStorage.clear();
  } catch (error) {
    console.log(error);
  }
}

export async function checkBiometrics() {
  const biometrics = new ReactNativeBiometrics();
  return new Promise(async resolve => {
    biometrics
      .simplePrompt({promptMessage: 'Confirm fingerprint'})
      .then(async resultObject => {
        const {success} = resultObject;
        if (success) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(async () => {
        resolve(false);
      });
  });
}

export function arraySum(array) {
  return array.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
}

export function epsilonRound(num, zeros = 4) {
  let temp = num;
  if (typeof num === 'string') {
    temp = parseFloat(num);
  }
  return (
    Math.round((temp + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

export function ipfsToHttpV1(url) {
  const CIDV0 = url.split('/')[2];
  const CIDV1 = new CID(CIDV0).toV1().toString('base32');
  return `https://${CIDV1}.ipfs.nftstorage.link/${url.split('/')[3]}`;
}

export function ipfsToHttpV0(url) {
  const CIDV0 = url.split('/')[2];
  return `https://${CIDV0}.ipfs.nftstorage.link/${url.split('/')[3]}`;
}

export async function getETHUSD() {
  const provider = new ethers.providers.JsonRpcProvider(
    'https://polygon-mainnet.g.alchemy.com/v2/bKQTjG-gPiywyFe748IzezZI9bH8We7z',
  );
  const dataFeeds = new ethers.Contract(
    POLYGON_DATA_FEED_CONTRACT,
    abiDataFeeds,
    provider,
  );
  const feedsUSD = await dataFeeds.getLatestPrices();
  const usdPrices = feedsUSD[0].map(
    (item, index) => parseFloat(item) * Math.pow(10, -feedsUSD[1][index]),
  );
  const res = [
    usdPrices[8],
    usdPrices[13],
    usdPrices[12],
    usdPrices[3],
    usdPrices[8],
  ];
  console.log(res);
  return res;
}

export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function deleteLeadingZeros(string) {
  let number = parseFloat(string);
  let formattedString = number.toFixed(2).toString();
  return formattedString;
}

function isNumber(string) {
  return !isNaN(parseFloat(string)) && isFinite(string);
}

export function formatInputText(inputText) {
  if (
    inputText === '0.00' ||
    inputText === '0' ||
    inputText === '00' ||
    inputText === '.' ||
    inputText === ''
  ) {
    return '0.00';
  } else if (isNumber(inputText) && !inputText.includes('.')) {
    return inputText + '.00';
  } else {
    let zeroAttached = '';
    if (inputText.includes('.')) {
      if (inputText.split('.')[0].length === 0) {
        zeroAttached = '0';
      }
      if (inputText.split('.')[1].length > 2) {
        return (
          zeroAttached +
          inputText.split('.')[0] +
          '.' +
          inputText.split('.')[1].substring(0, 2)
        );
      } else if (inputText.split('.')[1].length === 2) {
        return zeroAttached + inputText;
      } else if (inputText.split('.')[1].length === 1) {
        return zeroAttached + inputText + '0';
      } else {
        return zeroAttached + inputText + '00';
      }
    } else {
      return zeroAttached + inputText + '.00';
    }
  }
}

export async function getBalanceAPI(address) {
  var myHeaders = new Headers();
  myHeaders.append('accept', 'application/json');

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };
  return new Promise((resolve, reject) => {
    fetch(
      `https://phoenix.lightlink.io/api/v2/addresses/${address}?apikey=${LIGHTLINK_API_KEY}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(result => resolve(result.coin_balance))
      .catch(error => reject(error));
  });
}

export async function getNFTS(address) {
  var myHeaders = new Headers();
  myHeaders.append('accept', 'application/json');

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };
  return new Promise((resolve, reject) => {
    fetch(
      `https://sepolia-blockscout.scroll.io/api?module=account&action=tokenlist&address=${address}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(result => resolve(result.result))
      .catch(error => reject(error));
  });
}

export function base64ToHex(str) {
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : '0' + hex;
  }
  return result.toUpperCase();
}
