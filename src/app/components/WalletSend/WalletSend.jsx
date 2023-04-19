import React, { useContext, useState } from "react";
import { useCheckbox } from "../../hooks/useCheckbox";
import { useInput } from "../../hooks/useInput";
import { Store } from "../../store/store-reducer";
import MyButton from "../UI/MyButton/MyButton";
import MyInput from "../UI/MyInput/MyInput";
import RoutersNav from "../UI/RoutersNav/RoutersNav";
import AdditionalDetails from "./AdditionalDetails/AdditionalDetails";
import AddressInput from "./AddressInput/AddressInput";
import AssetsSelect from "./AssetsSelect/AssetsSelect";
import s from "./WalletSend.module.scss";

const WalletSend = () => {
  const { state } = useContext(Store);
  // Form data
  const address = useInput("");
  const [asset, setAsset] = useState(state.wallet.assets[0]);
  const amount = useInput("");
  const comment = useInput("");
  const mixin = useInput("");
  const fee = useInput("");
  const isSenderInfo = useCheckbox(false);
  const isReceiverInfo = useCheckbox(false);

  const sendHandler = () => {
    alert("Sending tokens");
  };

  return (
    <div className={s.sendForm}>
      <RoutersNav title="Send" />

      <AddressInput address={address} />

      <AssetsSelect value={asset} setValue={setAsset} />

      <MyInput
        type="number"
        placeholder="Enter how much you want to transfer"
        label="Amount:"
        value={amount.value}
        onChange={amount.onChange}
      />

      <MyInput
        placeholder="Enter the comment"
        label="Comment:"
        value={comment.value}
        onChange={comment.onChange}
      />

      <AdditionalDetails
        mixin={mixin}
        fee={fee}
        isSenderInfo={isSenderInfo}
        isReceiverInfo={isReceiverInfo}
      />

      <MyButton onClick={sendHandler}>Send</MyButton>
    </div>
  );
};

export default WalletSend;
