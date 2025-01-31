
import './App.css'
import { useState } from 'react';
import Home from './pages/Home';
import { keccak256, toHex } from 'viem'
import { nanoid } from 'nanoid'
import AppContext from './lib/AppContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GameRoom } from '@/src/components/GameRoom';


const App = () => {
  const [username, setUsername] = useState("");
  const [gameId, setGameId] = useState(nanoid(30));
  const [bytesGameId, setBytesGameId] = useState(keccak256(toHex(gameId)));
  const [status, setStatus] = useState(0);
  const [outcome, setOutcome] = useState("unknown");
  const [bet, setBet] = useState(0);
  const [choice, setChoice] = useState(1);


  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/game-room",
      element: <GameRoom />,
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
        },
        setUsername,
        setGameId,
        setBytesGameId,
        setStatus,
        setOutcome,
        setBet,
        setChoice,
      }}
    >
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
};

export default App;