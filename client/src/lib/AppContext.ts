import React from 'react'
import { User } from '../interfaces/User';

type AppContextType = {
    state: {
        username: string;
        gameId: string;
        bytesGameId: `0x${string}`; // for viem's keccak256 return type
        status: number;
        outcome: string;
        stake: number;
        choice: number;
        members: User[]
    };
    setUsername: (username: string) => void;
    setGameId: (gameId: string) => void;
    setBytesGameId: (bytesGameId: `0x${string}`) => void;
    setStatus: (status: number) => void;
    setOutcome: (outcome: string) => void;
    setStake: (stake: number) => void;
    setChoice: (choice: number) => void;
    setMembers: (members: User[]) => void
}

const defaultContext: AppContextType = {
    state: {
        username: '',
        gameId: '',
        bytesGameId: '0x',
        status: 0,
        outcome: 'unknown',
        stake: 0,
        choice: 1,
        members: []
    },
    setUsername: () => { },
    setGameId: () => { },
    setBytesGameId: () => { },
    setStatus: () => { },
    setOutcome: () => { },
    setStake: () => { },
    setChoice: () => { },
    setMembers: () => { }
};

const AppContext = React.createContext(defaultContext);

export default AppContext;