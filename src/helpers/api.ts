import axios from "axios";
import { API_BALANCES_URL, API_MEMPOOL_TRANSACTIONS_URL, API_POX_INFO_URL, API_STACKER_INFO_URL, NETWORK } from "./consts";
import { cvToHex, cvToJSON, hexToCV, principalCV } from "@stacks/transactions";

export const fetchPoxInfo = async (): Promise<any> => {
  try {
    const response = await axios.get(API_POX_INFO_URL(NETWORK));

    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return fetchPoxInfo();
      } else {
        console.error(`Error fetching PoX info: ${error}`);
      }
    } else {
      console.error(`Error fetching PoX info: ${error}`);
    }
    return null;
  }
}

export const fetchBalances = async (address: string): Promise<any> => {
  try {
    const response = await axios.get(API_BALANCES_URL(address, NETWORK));

    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return fetchBalances(address);
      } else {
        console.error(`Error fetching balances info: ${error}`);
      }
    } else {
      console.error(`Error fetching balances info: ${error}`);
    }
    return null;
  }
}

export const fetchMempoolTransactions = async (address: string): Promise<any> => {
  try {
    const response = await axios.get(API_MEMPOOL_TRANSACTIONS_URL(address, NETWORK));

    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return fetchMempoolTransactions(address);
      } else {
        console.error(`Error fetching mempool transactions: ${error}`);
      }
    } else {
      console.error(`Error fetching mempool transactions: ${error}`);
    }
    return null;
  }
}

export const fetchStackerInfo = async (address: string): Promise<any> => {
  try {
    let data = JSON.stringify({
      "sender": address,
      "arguments": [
        cvToHex(principalCV(address))
      ]
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: API_STACKER_INFO_URL(NETWORK),
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);;

    return cvToJSON(hexToCV(response.data.result)).value;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return fetchStackerInfo(address);
      } else {
        console.error(`Error fetching stacker info: ${error}`);
      }
    } else {
      console.error(`Error fetching stacker info: ${error}`);
    }
    return null;
  }
}
