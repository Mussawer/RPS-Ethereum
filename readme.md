# RPS-Xtended Web3

RPS-Xtended Web3 is a decentralized Rock-Paper-Scissors-Lizard-Spock game built on Ethereum, featuring a secure commit-reveal mechanism and real-time gameplay interactions. Built with modern web3 technologies, this implementation ensures fair play through cryptographic commitments and blockchain-enforced rules.

---

## Live Demo

Experience the game live at [https://rps-extended.onrender.com](https://rps-extended.onrender.com)

> *Note: Requires MetaMask wallet and Sepolia testnet ETH*

---

## Key Features

- 🛡️ **Commit-Reveal Mechanism** ensures move secrecy
- ⏳ **Time-Locked Game Resolution** with automatic forfeits
- 🔗 **Smart Contract Enforcement** of game rules
- 💸 **Sepolia Testnet** ETH betting system
- 🌐 **Real-Time Game Updates** via WebSocket
- 🔄 **Automatic Payouts** for winners
- ⚖️ **Tie Resolution** with full stake returns

---

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Blockchain**: Wagmi + viem for Ethereum interactions
- **Smart Contracts**: Solidity with RPS+LS logic
- **Realtime**: Socket.IO for game synchronization
- **UI**: Shadcn UI components with Tailwind CSS

---

## Getting Started

### Prerequisites
- Node.js v18+
- MetaMask wallet
- Sepolia testnet ETH

## Game Flow

1. **Wallet Connection**  
   Connect your MetaMask wallet to Sepolia testnet

2. **Room Creation**  
   - Host creates game with unique ID
   - Shares game ID with opponent

3. **Move Commitment**
   - Player 1 place the stake which set the stake of the game
   - Players secretly choose moves (R/P/S/L/K)
   - Hashed commitments sent to blockchain
   - 5-minute timer starts for opponent response

4. **Move Revelation**  
   - Player 1 reveals move with secret salt
   - Smart contract verifies commitment hash
   - Game outcome calculated on-chain

5. **Payout Resolution**  
   - Winners automatically receive ETH payouts
   - Ties return stakes to both players
   - Timeouts penalize inactive players

---

## Contract Architecture

```solidity
interface RPS-Xtended {
  // Core Functions
  function play(bytes32 hashedMove) external payable;
  function solve(uint8 move, bytes32 salt) external;
  
  // Timeout Handlers
  function j1Timeout() external;
  function j2Timeout() external;
}
```

---

## Future Roadmap

- 📊 Leaderboards
- 🔄 Multi-Round Match System
- 🌉 Cross-Chain Gameplay Support
- 🗄️ Database Layer to persist game data and game histories

---