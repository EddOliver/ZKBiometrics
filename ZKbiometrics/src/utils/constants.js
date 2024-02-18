// Networks

// Assets
import {Image} from 'react-native';
import eth from '../assets/scroll.png';
import usdc from '../assets/logos/usdc.png';
import usdt from '../assets/logos/usdt.png';
import wbtc from '../assets/logos/wbtc.png';
import weth from '../assets/logos/weth.png';

export const NFTaddress = '0x8Da0bb16b869EE966bcF00aef7db9bEaA67eE511';
export const lightsaverNFT =
  'ipfs://bafyreigfxmrk6o6bv43uc74cag4kp42evux3wg4vj6os6qa4ve4k2evqoq/metadata.json';
export const saverCardNFT =
  'ipfs://bafyreidzarlzdpjdcmk55lgtkxpzqy4uvlyhdp3gmbuqheisgscktgjjgu/metadata.json';

export const APP_IDENTITY = {
  name: 'ZKbiometrics',
  uri: 'https://zkbiometrics.com',
  icon: 'favicon.ico', // Full path resolves to https://yourdapp.com/favicon.ico
};

export const VerifierAddress = '0x3d03C956B8B17778Fcb9ad6475c61587fb5599Cb';

const w = 50;
const h = 50;

export const icons = {
  usdc: <Image source={usdc} style={{width: w, height: h}} />,
  usdt: <Image source={usdt} style={{width: w, height: h}} />,
  eth: <Image source={eth} style={{width: w, height: h}} />,
  wbtc: <Image source={wbtc} style={{width: w, height: h}} />,
  weth: <Image source={weth} style={{width: w, height: h}} />,
};

export const EVM = {
  network: 'Scroll',
  token: 'ETH',
  rpc: 'https://scroll-sepolia.blockpi.network/v1/rpc/public',
  chainId: 534351,
  blockExplorer: 'https://sepolia.scrollscan.com/',
  iconSymbol: 'eth',
  decimals: 18,
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      icon: icons.eth,
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0x02a3e7E0480B668bD46b42852C58363F93e3bA5C',
      decimals: 6,
      icon: icons.usdc,
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      address: '0xFfd2eCE82f7959ae184D10fe17865d27B4f0FB94',
      decimals: 6,
      icon: icons.usdt,
    },
    {
      name: 'Wrapped BTC',
      symbol: 'WBTC',
      address: '0x5EA79f3190ff37418d42F9B2618688494dBD9693',
      decimals: 8,
      icon: icons.wbtc,
    },
    {
      name: 'Wrapped ETH',
      symbol: 'WETH',
      address: '0xfa6a407c4C49Ea1D46569c1A4Bcf71C3437bE54c',
      decimals: 18,
      icon: icons.weth,
    },
  ],
};

export const EVMmain = {
  network: 'Scroll',
  token: 'ETH',
  rpc: 'https://1rpc.io/scroll',
  chainId: 534352,
  blockExplorer: 'https://scrollscan.com/',
  iconSymbol: 'eth',
  decimals: 18,
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      icon: icons.eth,
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
      decimals: 6,
      icon: icons.usdc,
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
      decimals: 6,
      icon: icons.usdt,
    },
    {
      name: 'Wrapped BTC',
      symbol: 'WBTC',
      address: '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1',
      decimals: 8,
      icon: icons.wbtc,
    },
    {
      name: 'Wrapped ETH',
      symbol: 'WETH',
      address: '0x5300000000000000000000000000000000000004',
      decimals: 18,
      icon: icons.weth,
    },
  ],
};
