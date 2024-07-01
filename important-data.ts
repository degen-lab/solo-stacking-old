// balances: https://api.nakamoto.testnet.hiro.so/extended/v1/address/<address>/balances
// you get:
//   - total balance
//   - locked
//   - burnchain lock height
//   - burnchain unlock height
// 
// pox: https://api.nakamoto.testnet.hiro.so/v2/pox
// you get:
//   - estimated minimum threshold
//   - current cycle
//
//
// THISS NOOOOOO:
// once first call is made, this endpoint returns address balance, locked, nonce and unlock height: 
// https://api.nakamoto.testnet.hiro.so/v2/accounts/ST33TPJB97CQ0NWW6Z5SRGV2TXN1FRKYKS0QDF9HZ?proof=0
//
//
// IDK:
// this endpoint sees all transactions, but not the one in mempool (stack-stx):
// https://api.nakamoto.testnet.hiro.so/extended/v1/address/ST33TPJB97CQ0NWW6Z5SRGV2TXN1FRKYKS0QDF9HZ/transactions?limit=50&unanchored=true
//
//
// this endpoint sees an unanchored transaction in mempool:
// https://api.nakamoto.testnet.hiro.so/extended/v1/address/ST33TPJB97CQ0NWW6Z5SRGV2TXN1FRKYKS0QDF9HZ/mempool?unanchored=true
// it also sees that the contract call is on pox-4, with name 'stack-stx'
//
// makes a post to get stacker info:
// https://api.nakamoto.testnet.hiro.so/v2/contracts/call-read/ST000000000000000000002AMW42H/pox-4/get-stacker-info
// with payload:
// {
//   "sender": "ST33TPJB97CQ0NWW6Z5SRGV2TXN1FRKYKS0QDF9HZ",
//   "arguments": [
//     "0x051ac7ab49693b2e0af386f973886c5aed42fc4fd3c8"
//   ]
// }
// calling the read-only manually returns:
// (some (tuple (delegated-to none) (first-reward-cycle u31) (lock-period u2) (pox-addr (tuple (hashbytes 0xb93ab4222b0bf8745a0ad7f250ced8e2a368519f) (version 0x04))) (reward-set-indexes (list u2 u2))))
// the balances endpoints know that the unlock height is 29030 (beginning of cycle 32 reward phase) - current cycle 30
// 
// extending for 1 cycle:
// it knows that i'm extending (by checking mempool transactions)
// 
// 
// 
// THE CODE IS MAKING THE REQUESTS EVERY 5 SECONDS AND AUTO-REFRESHES THE PAGE (the fucking api limits are driving me insane)
//
//
//
// Locked: 21,000,000 STX
// Duration: 0 / 2
// Start: Cycle 31
// End: Cycle 32
// Bitcoin address: tb1qh…y96wn
//
// extend: stacking from 30 to 40 (included). current cycle 38. to go: 38, 39, 40. can extend by 9 (until 49)
// sig cycle: always current cycle
