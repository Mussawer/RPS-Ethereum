
import './App.css'
import { useState } from 'react';
import Home from './pages/Home';
import { keccak256, toHex } from 'viem'
import { nanoid } from 'nanoid'
import AppContext from './lib/AppContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GameRoom } from '@/src/components/GameRoom';
import { User } from './interfaces/User';
import { Toaster } from './components/ui/Toaster';


const App = () => {
  const [username, setUsername] = useState("");
  const [gameId, setGameId] = useState(nanoid(30));
  const [bytesGameId, setBytesGameId] = useState(keccak256(toHex(gameId)));
  const [status, setStatus] = useState(0);
  const [outcome, setOutcome] = useState("unknown");
  const [stake, setStake] = useState(0);
  const [choice, setChoice] = useState(0);
  const [members, setMembers] = useState<User[]>([]);


  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home gameId={gameId}/>,
    },
    {
      path: "/game-room",
      element: <GameRoom gameId={gameId} username={username}/>,
    }
  ]);

  return (
    <AppContext.Provider
      value={{
        state: {
          username,
          gameId,
          bytesGameId,
          status,
          outcome,
          stake,
          choice,
          members,
        },
        setUsername,
        setGameId,
        setBytesGameId,
        setStatus,
        setOutcome,
        setStake,
        setChoice,
        setMembers,
      }}
    >
      <RouterProvider router={router} />
      <Toaster />
    </AppContext.Provider>
  );
};

export default App;