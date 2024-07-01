import React, { useState, useEffect } from 'react';
import Button from './Button';
import StackingInfo from './StackingInfo';
import '../App.css';
import { fetchBalances, fetchMempoolTransactions, fetchPoxInfo, fetchStackerInfo } from '../helpers/api';
import { checkIsExtendInProgress, checkIsIncreaseInProgress, checkIsStackingInProgress, getStackingSignature, methodToPox4Topic, parsePoxAddress, parseStackExtendArgs, parseStackIncreaseArgs, parseStackStxArgs, randomAuthId } from '../helpers/helpers';
import { showConnect } from '@stacks/connect';
import { userSession } from '../helpers/userSession';
import { contractCall } from '../helpers/contractCall';
import { GET_USER_ADDRESS, NETWORK } from '../helpers/consts';

const App: React.FC = () => {
  const connectWallet = () => {
    const myAppName = 'My Stacks Web-App';
    const myAppIcon = window.location.origin;

    showConnect({
      userSession,
      appDetails: {
        name: myAppName,
        icon: myAppIcon,
      },
      onFinish: () => {
        window.location.reload();
      },
      onCancel: () => {
        console.log('oops');
      },
    });
  }

  const [isStackStxDisabled, setStackStxDisabled] = useState(false);
  const [isStackExtendDisabled, setStackExtendDisabled] = useState(false);
  const [isStackIncreaseDisabled, setStackIncreaseDisabled] = useState(false);

  const [isStackingEnabledMessage, setIsStackingEnabledMessage] = useState<string | null>(null);
  const [isExtendEnabledMessage, setIsExtendEnabledMessage] = useState<string | null>(null);
  const [isIncreaseEnabledMessage, setIsIncreaseEnabledMessage] = useState<string | null>(null);

  const [stackStxAmount, setStackStxAmount] = useState(0);
  const [stackStxNumCycles, setStackStxNumCycles] = useState(0);
  const [stackStxPoxAddress, setStackStxPoxAddress] = useState('');
  
  const [stackExtendNumCycles, setStackExtendNumCycles] = useState(0);
  
  const [stackIncreaseAmount, setStackIncreaseAmount] = useState(0);

  const [poxInfo, setPoxInfo] = useState<any | null>(null);
  const [balancesInfo, setBalancesInfo] = useState<any | null>(null);
  const [mempoolTransactions, setMempoolTransactions] = useState(null);
  const [stackerInfo, setStackerInfo] = useState<any | null>(null);

  const [activeExtendCount, setActiveExtendCount] = useState(0);
  const [activeIncreaseAmount, setActiveIncreaseAmount] = useState(0);

  const [amountUpperLimit, setAmountUpperLimit] = useState(0);
  const [amountLowerLimit, setAmountLowerLimit] = useState(0);
  const [cyclesLimit, setCyclesLimit] = useState(0);

  // stacked address
  const address = GET_USER_ADDRESS(NETWORK);

  // NOT STACKING address
  // const address = "ST1D28JGPSNCDV37B7QYJ2DYRFS54J40ZVKQFQSX4";

  useEffect(() => {
    const checkCanStack = () => {
      const checkStackingTransaction = checkIsStackingInProgress(mempoolTransactions);

      setIsStackingEnabledMessage(null);
      setStackStxDisabled(false);

      if (checkStackingTransaction.result === true) {
        setIsStackingEnabledMessage(`A stack-stx transaction is already in mempool. Txid: ${checkStackingTransaction.txid}`);
        setStackStxDisabled(true);
      } else if (stackerInfo !== null) {
        setIsStackingEnabledMessage(`You are already stacking.`);
        setStackStxDisabled(true);
      } else if (stackStxNumCycles === 0 || stackStxAmount === 0) {
        setStackStxDisabled(true);
      }
    }
    const checkCanExtend = () => {
      const checkExtendTransaction = checkIsExtendInProgress(mempoolTransactions);

      setActiveExtendCount(0);
      setIsExtendEnabledMessage(null);
      setStackExtendDisabled(false);

      if (checkExtendTransaction.result === true) {
        setIsExtendEnabledMessage(`A stack-extend transaction is already in mempool. Number of cycles to extend: ${checkExtendTransaction.extendCount}. Txid: ${checkExtendTransaction.txid}`);
        setActiveExtendCount(checkExtendTransaction.extendCount || 0);
        setStackExtendDisabled(true);
      } else if (stackExtendNumCycles === 0) {
        setStackExtendDisabled(true);
      }
    }
    const checkCanIncrease = () => {
      const checkIncreaseTransaction = checkIsIncreaseInProgress(mempoolTransactions);

      setActiveIncreaseAmount(0);
      setIsIncreaseEnabledMessage(null);
      setStackIncreaseDisabled(false);

      if (checkIncreaseTransaction.result === true) {
        setIsIncreaseEnabledMessage(`A stack-increase transaction is already in mempool. Amount to increase: ${((checkIncreaseTransaction.increaseAmount || 0) / 1000000).toLocaleString(undefined, {maximumFractionDigits:2})} STX. Txid: ${checkIncreaseTransaction.txid}`);
        setActiveIncreaseAmount(checkIncreaseTransaction.increaseAmount || 0);
        setStackIncreaseDisabled(true);
      } else if (stackIncreaseAmount === 0) {
        setStackIncreaseDisabled(true);
      }
    }

    if (mempoolTransactions) {
      checkCanStack();
      checkCanExtend();
      checkCanIncrease();
    }
  }, [mempoolTransactions, stackerInfo, stackStxNumCycles, stackStxAmount, stackExtendNumCycles, stackIncreaseAmount]);

  useEffect(() => {
    const fetchData = async () => {
      const poxInfo = await fetchPoxInfo();
      const balancesInfo = await fetchBalances(address);
      const mempoolTransactions = await fetchMempoolTransactions(address);
      const stackerInfo = await fetchStackerInfo(address);

      setPoxInfo(poxInfo);
      setBalancesInfo(balancesInfo);
      setMempoolTransactions(mempoolTransactions);
      setStackerInfo(stackerInfo);

      const amountUpperLimit = balancesInfo ? Math.max((parseInt(balancesInfo.stx.balance) - parseInt(balancesInfo.stx.locked) - 10000000) / 1000000, 0) : 0;
      setAmountUpperLimit(amountUpperLimit);

      const amountLowerLimit = poxInfo ? parseInt(poxInfo.next_cycle.min_threshold_ustx) / 1000000 : 0;
      setAmountLowerLimit(amountLowerLimit);

      const cyclesLimit = poxInfo ? stackerInfo ? 12 - (parseInt(stackerInfo.value["first-reward-cycle"].value) + parseInt(stackerInfo.value["lock-period"].value) - Math.max(poxInfo.current_cycle.id, parseInt(stackerInfo.value["first-reward-cycle"].value))) : 12 : 0;
      setCyclesLimit(cyclesLimit);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [address]);

  const handleStackStx = () => {
    if (balancesInfo && poxInfo) {
      console.log('Stack Stx clicked', { stackStxAmount, stackStxNumCycles, stackStxPoxAddress });

      const functionName = 'stack-stx';
      const amountUstx = Math.floor(stackStxAmount * 1000000);
      const lockPeriod = stackStxNumCycles;
      const poxAddress = stackStxPoxAddress;

      const topic = methodToPox4Topic[functionName];
      const currentCycle = poxInfo.current_cycle.id;
      const startBurnHeight = poxInfo.current_burnchain_block_height;
      const maxAmount = amountUstx;
      const authId = randomAuthId();

      const signatureAndKey = getStackingSignature(
        topic,
        poxAddress,
        currentCycle,
        lockPeriod,
        maxAmount,
        authId,
      );

      const functionArgs = parseStackStxArgs(amountUstx, poxAddress, startBurnHeight, lockPeriod, signatureAndKey.signature, signatureAndKey.publicKey, maxAmount, authId);

      contractCall(functionName, functionArgs);
    }
  };

  const handleStackExtend = () => {
    if (balancesInfo && stackerInfo && poxInfo) {
      console.log('Stack Extend clicked', { stackExtendNumCycles });

      const functionName = 'stack-extend';
      const extendCount = stackExtendNumCycles;

      const topic = methodToPox4Topic[functionName];
      const poxAddress = parsePoxAddress(stackerInfo.value["pox-addr"].value.version.value, stackerInfo.value["pox-addr"].value.hashbytes.value);
      const currentCycle = poxInfo.current_cycle.id;
      const maxAmount = parseInt(balancesInfo.stx.locked) + activeIncreaseAmount;
      const authId = randomAuthId();

      const signatureAndKey = getStackingSignature(
        topic,
        poxAddress,
        currentCycle,
        extendCount,
        maxAmount,
        authId,
      );

      const functionArgs = parseStackExtendArgs(extendCount, poxAddress, signatureAndKey.signature, signatureAndKey.publicKey, maxAmount, authId);

      contractCall(functionName, functionArgs);
    }
  };

  const handleStackIncrease = () => {
    if (balancesInfo && stackerInfo && poxInfo) {
      console.log('Stack Increase clicked', { stackIncreaseAmount }, "STX.");

      const functionName = 'stack-increase';
      const increaseAmount = Math.floor(stackIncreaseAmount * 1000000);

      const topic = methodToPox4Topic[functionName];
      const poxAddress = parsePoxAddress(stackerInfo.value["pox-addr"].value.version.value, stackerInfo.value["pox-addr"].value.hashbytes.value);
      const currentCycle = poxInfo.current_cycle.id;
      const lockPeriod = parseInt(stackerInfo.value["lock-period"].value) + activeExtendCount;
      const maxAmount = parseInt(balancesInfo.stx.locked) + increaseAmount;
      const authId = randomAuthId();

      const signatureAndKey = getStackingSignature(
        topic,
        poxAddress,
        currentCycle,
        lockPeriod,
        maxAmount,
        authId,
      );

      const functionArgs = parseStackIncreaseArgs(increaseAmount, signatureAndKey.signature, signatureAndKey.publicKey, maxAmount, authId);

      contractCall(functionName, functionArgs);
    }
  };

  return (
    <div className="app">
      <Button
        label="Connect Wallet"
        disabled={false}
        onClick={connectWallet}
      />
      <div className="button-container">
        <div className="button-group">
          <Button
            label="Stack Stx"
            disabled={isStackStxDisabled}
            onClick={handleStackStx}
          />
          <div className="input-container">
            <div>
              <label>Amount: </label>
              <input
                type="number"
                step="0.000001"
                value={stackStxAmount}
                onChange={(e) => {
                  if (!(e.target.value) || parseFloat(e.target.value) < amountLowerLimit) {
                    setStackStxAmount(amountLowerLimit);
                  } else {
                    const newValue = parseFloat(e.target.value);
                    if (newValue <= amountUpperLimit) {
                      setStackStxAmount(newValue)
                    } else {
                      setStackStxAmount(amountUpperLimit)
                    }
                  }
                }}
                min={amountLowerLimit}
                max={amountUpperLimit}
              />
            </div>
            <div>
              <label>Cycles: </label>
              <input 
                type="number"
                step="1"
                value={stackStxNumCycles}
                onChange={(e) => {
                  if (!(e.target.value) || parseInt(e.target.value, 10) < 0) {
                    setStackStxNumCycles(0);
                  } else {
                    const newValue = parseInt(e.target.value, 10);
                    if (newValue <= cyclesLimit) {
                      setStackStxNumCycles(newValue)
                    } else {
                      setStackStxNumCycles(cyclesLimit)
                    }
                  }
                }}
                max={cyclesLimit}
              />
            </div>
            <div>
              <label>PoX Address: </label>
              <input type="text" value={stackStxPoxAddress} onChange={(e) => setStackStxPoxAddress(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="button-group">
          <Button
            label="Stack Extend"
            disabled={isStackExtendDisabled}
            onClick={handleStackExtend}
          />
          <div className="input-container">
            <div>
              <label>Cycles: </label>
              <input 
                type="number"
                step="1"
                value={stackExtendNumCycles}
                onChange={(e) => {
                  if (!(e.target.value) || parseInt(e.target.value, 10) < 0) {
                    setStackExtendNumCycles(0);
                  } else {
                    const newValue = parseInt(e.target.value, 10);
                    if (newValue <= cyclesLimit) {
                      setStackExtendNumCycles(newValue)
                    } else {
                      setStackExtendNumCycles(cyclesLimit)
                    }
                  }
                }}
                max={cyclesLimit}
              />
            </div>
          </div>
        </div>
        <div className="button-group">
          <Button
            label="Stack Increase"
            disabled={isStackIncreaseDisabled}
            onClick={handleStackIncrease}
          />
          <div className="input-container">
            <div>
              <label>Amount: </label>
              <input
                type="number"
                step="0.000001"
                value={stackIncreaseAmount}
                onChange={(e) => {
                  if (!(e.target.value) || parseFloat(e.target.value) < 0) {
                    setStackIncreaseAmount(0);
                  } else {
                    const newValue = parseFloat(e.target.value);
                    if (newValue <= amountUpperLimit) {
                      setStackIncreaseAmount(newValue)
                    } else {
                      setStackIncreaseAmount(amountUpperLimit)
                    }
                  }
                }}
                max={amountUpperLimit}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="button-group" style={{ color: 'red' }}>
        {isStackingEnabledMessage !== null && <p>{isStackingEnabledMessage}</p>}
        {isExtendEnabledMessage !== null && <p>{isExtendEnabledMessage}</p>}
        {isIncreaseEnabledMessage !== null && <p>{isIncreaseEnabledMessage}</p>}
      </div>
      <StackingInfo poxInfo={poxInfo} balancesInfo={balancesInfo} stackerInfo={stackerInfo} />
    </div>
  );
};

export default App;
