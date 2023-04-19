import React, { useContext, useState } from "react";

import { useInput } from "../../hooks/useInput";
import { Store } from "../../store/store-reducer";
import RoutersNav from "../UI/RoutersNav/RoutersNav";
import AddressInput from "./AddressInput/AddressInput";
import AssetsSelect from "./AssetsSelect/AssetsSelect";

const WalletSend = () => {
  const { state } = useContext(Store);
  const address = useInput("");
  const [asset, setAsset] = useState();

  return (
    <div>
      <RoutersNav title="Send" />

      <AddressInput address={address} />

      <AssetsSelect value={asset} setValue={setAsset} />
    </div>
  );
};

export default WalletSend;
