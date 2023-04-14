import { useState } from "react";
import AppPlug from "./components/AppPlug/AppPlug";
import Header from "./components/Header/Header";
import TokensTabs from "./components/TokensTabs/TokensTabs";
import Wallet from "./components/Wallet/Wallet";
import "./styles/App.scss";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="App">
      {isConnected ? (
        <AppPlug />
      ) : (
        <>
          <Header />
          <div className="container">
            <Wallet />
            <TokensTabs />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
