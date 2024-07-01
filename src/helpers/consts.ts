import { StacksMainnet, StacksTestnet } from "@stacks/network";
import { userSession } from "./userSession";

export const API_BALANCES_URL = (address: string, network: string) => `https://api.${network}.hiro.so/extended/v1/address/${address}/balances`;
export const API_POX_INFO_URL = (network: string) => `https://api.${network}.hiro.so/v2/pox`;
export const API_MEMPOOL_TRANSACTIONS_URL = (address: string, network: string) => `https://api.${network}.hiro.so/extended/v1/address/${address}/mempool?unanchored=true`;
export const API_STACKER_INFO_URL = (network: string) => `https://api.${network}.hiro.so/v2/contracts/call-read/ST000000000000000000002AMW42H/pox-4/get-stacker-info`;

export const POX_4_CONTRACT_ADDRESS = (network: string) => network === 'mainnet' ? 'SP000000000000000000002Q6VF78' : 'ST000000000000000000002AMW42H';
export const POX_4_CONTRACT_NAME = 'pox-4';

export const STACKS_NETWORK = (network: string) => {
  return network === 'mainnet' ? 
    new StacksMainnet() :
    network === 'testnet' ? 
      new StacksTestnet() :
    new StacksTestnet({ url: 'https://api.nakamoto.testnet.hiro.so' })
}

export const GET_USER_ADDRESS = (network: string) => {
  return (network === 'mainnet' ? userSession.loadUserData().profile.stxAddress.mainnet : userSession.loadUserData().profile.stxAddress.testnet) || "ST33TPJB97CQ0NWW6Z5SRGV2TXN1FRKYKS0QDF9HZ"
}

export const NETWORK = 'nakamoto.testnet'
