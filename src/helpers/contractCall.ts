import { openContractCall } from '@stacks/connect';
import { AnchorMode, ClarityValue, PostConditionMode, stringUtf8CV } from '@stacks/transactions';
import { userSession } from '../helpers/userSession';
import { NETWORK, POX_4_CONTRACT_ADDRESS, POX_4_CONTRACT_NAME, STACKS_NETWORK } from './consts';

export const contractCall = (functionName: string, functionArgs: ClarityValue[]) => {
  openContractCall({
    network: STACKS_NETWORK(NETWORK),
    anchorMode: AnchorMode.Any,

    contractAddress: POX_4_CONTRACT_ADDRESS(NETWORK),
    contractName: POX_4_CONTRACT_NAME,
    functionName,
    functionArgs,

    postConditionMode: PostConditionMode.Deny,
    postConditions: [],

    onFinish: response => {
      return response;
    },
    onCancel: () => {
      return null;
    },
  });
}
