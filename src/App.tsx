
import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useAccount } from "wagmi";
import Home from './pages/Home';
const initGameData = {
  hand: "",
  amount: "",
  token: "",
  password: "",
};
const App = () => {
  const [gameData, setGameData] = useState(initGameData);
  return (
      <Home />
  );
};

export default App;