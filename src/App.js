import "styles/App.scss";
import Header from "components/Header/Header";
import Wallet from "components/Wallet/Wallet";

function App() {
   return (
      <div className="App">
         <Header/>
         <div className="container">
            <Wallet />
         </div>
      </div>
   );
}

export default App;
