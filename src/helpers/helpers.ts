import { Pox4SignatureTopic, StackingClient, poxAddressToBtcAddress, poxAddressToTuple } from "@stacks/stacking"
import { bufferCV, createStacksPrivateKey, optionalCVOf, stringAsciiCV, tupleCV, uintCV } from "@stacks/transactions"
import { NETWORK, POX_4_CONTRACT_ADDRESS, POX_4_CONTRACT_NAME, STACKS_NETWORK } from "./consts"

export const checkIsStackingInProgress = (mempoolTransactions: any) => {
  for (const transaction of mempoolTransactions.results) {
    if (
      transaction.contract_call.contract_id === `${POX_4_CONTRACT_ADDRESS(NETWORK)}.${POX_4_CONTRACT_NAME}` &&
      transaction.contract_call.function_name === "stack-stx"
    )
      return {
        result: true,
        txid: transaction.tx_id,
      }
  }

  return {
    result: false,
    txid: null,
  }
}

export const checkIsExtendInProgress = (mempoolTransactions: any) => {
  for (const transaction of mempoolTransactions.results) {
    if (
      transaction.contract_call.contract_id === `${POX_4_CONTRACT_ADDRESS(NETWORK)}.${POX_4_CONTRACT_NAME}` &&
      transaction.contract_call.function_name === "stack-extend"
    )
      return {
        result: true,
        extendCount: parseInt(transaction.contract_call.function_args[0].repr.slice(1)),
        txid: transaction.tx_id,
      }
  }

  return {
    result: false,
    extendCount: null,
    txid: null,
  }
}

export const checkIsIncreaseInProgress = (mempoolTransactions: any) => {
  for (const transaction of mempoolTransactions.results) {
    if (
      transaction.contract_call.contract_id === `${POX_4_CONTRACT_ADDRESS(NETWORK)}.${POX_4_CONTRACT_NAME}` &&
      transaction.contract_call.function_name === "stack-increase"
    )
      return {
        result: true,
        increaseAmount: parseInt(transaction.contract_call.function_args[0].repr.slice(1)),
        txid: transaction.tx_id,
      }
  }

  return {
    result: false,
    increaseAmount: null,
    txid: null,
  }
}

export const hexStringToUint8Array = (hexString: string) => {
  if (hexString.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters');
  }

  const arrayBuffer = new Uint8Array(hexString.length / 2);

  for (let i = 0; i < hexString.length; i += 2) {
    arrayBuffer[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }

  return arrayBuffer;
};

export const parsePoxAddress = (version: string, hashbytes: string) => poxAddressToBtcAddress(
  parseInt(version, 16),
  hexStringToUint8Array(hashbytes.slice(2)),
  NETWORK === "nakamoto.testnet" ? "testnet" : NETWORK,
);

// SIGNATURE RELATED
export const methodToPox4Topic: Record<string, Pox4SignatureTopic> = {
  'stack-stx': Pox4SignatureTopic.StackStx,
  'stack-extend': Pox4SignatureTopic.StackExtend,
  'stack-increase': Pox4SignatureTopic.StackIncrease,
};

export const randomAuthId = () => {
  return Date.now();
};

const getStackingClient = (): StackingClient => {
  return new StackingClient("STGV0HNRP9XMMQ3Y1PW1Q7QQERVT37R3RPADMHFP", STACKS_NETWORK(NETWORK));
};

export const getStackingSignature = (topic: Pox4SignatureTopic, poxAddress: string, rewardCycle: number, period: number, maxAmount: number, authId: number) => {
  const stackingClient = getStackingClient();

  return {
    signature: stackingClient.signPoxSignature({
      topic,
      poxAddress,
      rewardCycle,
      period,
      signerPrivateKey: createStacksPrivateKey("b41c2a9e65247e73a690dbef18622c04cfa1df276bb65ee77ed73cc876e3e77b01"),
      maxAmount,
      authId,
    }),
    publicKey: "02778d476704afa540ac01438f62c371dc38741b00f35fb895e5cd48d070ebab41"
  };
}

export const parseStackStxArgs = (amountUstx: number, poxAddr: string, startBurnHeight: number, lockPeriod: number, signerSig: string, signerKey: string, maxAmount: number, authId: number) => {
  return [
    uintCV(amountUstx),
    poxAddressToTuple(poxAddr),
    uintCV(startBurnHeight),
    uintCV(lockPeriod),
    optionalCVOf(bufferCV(hexStringToUint8Array(signerSig))),
    bufferCV(hexStringToUint8Array(signerKey)),
    uintCV(maxAmount),
    uintCV(authId)
  ]
}

export const parseStackExtendArgs = (extendCount: number, poxAddr: string, signerSig: string, signerKey: string, maxAmount: number, authId: number) => {
  return [
    uintCV(extendCount),
    poxAddressToTuple(poxAddr),
    optionalCVOf(bufferCV(hexStringToUint8Array(signerSig))),
    bufferCV(hexStringToUint8Array(signerKey)),
    uintCV(maxAmount),
    uintCV(authId)
  ]
}

export const parseStackIncreaseArgs = (increaseBy: number, signerSig: string, signerKey: string, maxAmount: number, authId: number) => {
  return [
    uintCV(increaseBy),
    optionalCVOf(bufferCV(hexStringToUint8Array(signerSig))),
    bufferCV(hexStringToUint8Array(signerKey)),
    uintCV(maxAmount),
    uintCV(authId)
  ]
}
