import React from 'react'

type AppContextType = {
    state: {
      username: string;
      gameId: string;
      bytesGameId: `0x${string}`; // for viem's keccak256 return type
      status: number;
      outcome: string;
      bet: number;
      choice: number;
    };
    setUsername: (username: string) => void;
    setGameId: (gameId: string) => void;
    setBytesGameId: (bytesGameId: `0x${string}`) => void;
    setStatus: (status: number) => void;
    setOutcome: (outcome: string) => void;
    setBet: (bet: number) => void;
    setChoice: (choice: number) => void;
  }
  
  const defaultContext: AppContextType = {
    state: {
      username: '',
      gameId: '',
      bytesGameId: '0x',
      status: 0,
      outcome: 'unknown',
      bet: 0,
      choice: 1,
    },
    setUsername: () => {},
    setGameId: () => {},
    setBytesGameId: () => {},
    setStatus: () => {},
    setOutcome: () => {},
    setBet: () => {},
    setChoice: () => {},
  };

const AppContext = React.createContext(defaultContext);

export default AppContext;