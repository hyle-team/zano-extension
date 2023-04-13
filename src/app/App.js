import Header from "./components/Header/Header";
import TokensTabs from "./components/TokensTabs/TokensTabs";
import Wallet from "./components/Wallet/Wallet";
import "./styles/App.scss";

function App() {
  return (
    <div className="App">
      <Header />
      <div className="container">
        <Wallet />
        <TokensTabs />
      </div>
    </div>
  );
}

export default App;
