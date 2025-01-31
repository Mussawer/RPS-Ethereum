
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
  const [bet, setBet] = useState(0);
  const [choice, setChoice] = useState(1);
  const [user, setUser] = useState<User>({username: '', id: '', address: '',});
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
          bet,
          choice,
          members,
          user
        },
        setUsername,
        setGameId,
        setBytesGameId,
        setStatus,
        setOutcome,
        setBet,
        setChoice,
        setMembers,
        setUser
      }}
    >
      <RouterProvider router={router} />
      <Toaster />
    </AppContext.Provider>
  );
};

export default App;