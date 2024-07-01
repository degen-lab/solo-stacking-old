import React, { useEffect, useState } from 'react';
import { parsePoxAddress } from '../helpers/helpers';

const StackingInfo = ({poxInfo, balancesInfo, stackerInfo}: any) => {
  const [info, setInfo] = useState({
    currentCycle: 'Loading...',
    cycleEndsIn: 'Loading...',
    minimumThreshold: 'Loading...',
    totalBalance: 'Loading...',
    lockedBalance: 'Loading...',
    availableToStack: 'Loading...',
    poxAddress: 'Loading...',
    startCycle: 'Loading...',
    endCycle: 'Loading...',
    progress: 'Loading...',
  });

  useEffect(() => {
    const setShownInfo = () => {
      if (poxInfo && balancesInfo) {
        const accountBalance = (balancesInfo.stx.balance / 1000000).toLocaleString(undefined, {maximumFractionDigits:2});
        const lockedBalance = (balancesInfo.stx.locked / 1000000).toLocaleString(undefined, {maximumFractionDigits:2});
        const availableToStack = (Math.max(balancesInfo.stx.balance - balancesInfo.stx.locked - 10000000, 0) / 1000000).toLocaleString(undefined, {maximumFractionDigits:2})

        if (stackerInfo) {
          setInfo({
            currentCycle: `Current Cycle: ${poxInfo.current_cycle.id}`,
            cycleEndsIn: `Cycle ends in: ${poxInfo.next_cycle.blocks_until_prepare_phase} blocks`,
            minimumThreshold: `Minimum Threshold: ${(poxInfo.next_cycle.min_threshold_ustx / 1000000).toLocaleString(undefined, {maximumFractionDigits:2})} STX`,
            totalBalance: `Account Balance: ${accountBalance} STX`,
            lockedBalance: `Locked Balance: ${lockedBalance} STX`,
            availableToStack: `Available for Stacking: ${availableToStack} STX`,
            poxAddress: `Rewarded BTC Address: ${parsePoxAddress(stackerInfo.value["pox-addr"].value.version.value, stackerInfo.value["pox-addr"].value.hashbytes.value)}`,
            startCycle: `Starting From Cycle: ${parseInt(stackerInfo.value["first-reward-cycle"].value)}`,
            endCycle: `Ending At Cycle: ${parseInt(stackerInfo.value["first-reward-cycle"].value ) + parseInt(stackerInfo.value["lock-period"].value) - 1}`,
            progress: `Progress: ${poxInfo.current_cycle.id >= parseInt(stackerInfo.value["first-reward-cycle"].value) ? (poxInfo.current_cycle.id - parseInt(stackerInfo.value["first-reward-cycle"].value) + ' / ' + (parseInt(stackerInfo.value["lock-period"].value))) : "Not yet stacking!"}`,
          })
        } else {
          setInfo({
            currentCycle: `Current Cycle: ${poxInfo.current_cycle.id}`,
            cycleEndsIn: `Cycle ends in: ${poxInfo.next_cycle.blocks_until_prepare_phase} blocks`,
            minimumThreshold: `Minimum Threshold: ${(poxInfo.next_cycle.min_threshold_ustx / 1000000).toLocaleString(undefined, {maximumFractionDigits:2})} STX`,
            totalBalance: `Account Balance: ${accountBalance} STX`,
            lockedBalance: `Locked Balance: ${lockedBalance} STX`,
            availableToStack: `Available for Stacking: ${availableToStack} STX`,
            poxAddress: `Not Available`,
            startCycle: `Not Available`,
            endCycle: `Not Available`,
            progress: `Not Available`,
          })
        }
      }
    }

    setShownInfo()
  }, [poxInfo, balancesInfo, stackerInfo])

  if (stackerInfo) {
    return (
      <div className="stacking-info">
        <h2>Stacking Info</h2>
        <p>{info.currentCycle}</p>
        <p>{info.cycleEndsIn}</p>
        <p>{info.minimumThreshold}</p>
        <p>{info.totalBalance}</p>
        <p>{info.lockedBalance}</p>
        <p>{info.availableToStack}</p>
        <p>{info.poxAddress}</p>
        <p>{info.startCycle}</p>
        <p>{info.endCycle}</p>
        <p>{info.progress}</p>
      </div>
    );
  } else {
    return (
      <div className="stacking-info">
        <h2>Stacking Info</h2>
        <p>{info.currentCycle}</p>
        <p>{info.cycleEndsIn}</p>
        <p>{info.minimumThreshold}</p>
        <p>{info.totalBalance}</p>
        <p>{info.lockedBalance}</p>
        <p>{info.availableToStack}</p>
      </div>
    )
  }
};

export default StackingInfo;
