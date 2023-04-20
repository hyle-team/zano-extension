import React, { useContext, useEffect, useRef, useState } from "react";
import checkIcon from "../../../assets/svg/check.svg";
import aliasIcon from "../../../assets/svg/contacts.svg";
import { useInput } from "../../../hooks/useInput";
import { Store } from "../../../store/store-reducer";
import mainStyles from "../WalletSend.module.scss";
import s from "./AddressInput.module.scss";

const AddressInput = ({ address }) => {
  const { state } = useContext(Store);
  const textareaRef = useRef(null);
  const alias = useInput(state.wallet.alias);
  const [aliasVisible, setAliasVisible] = useState(false);

  const buttonClasses = aliasVisible
    ? [s.addAliasBtn, s.active].join(" ")
    : s.addAliasBtn;

  const getTextAreaClasses = () => {
    const aliasVisibleClass = aliasVisible && address.value && s.thinText;
    const inputFilledClass = address.value.length && "_input-filled";
    return [aliasVisibleClass, inputFilledClass].join(" ");
  };

  useEffect(() => handleInput(), []);

  /* useEffect(() => {
     // Reset alias visibility if input empty
     if (!address.value.length && aliasVisible) {
       console.log("useEffect")
       setAliasVisible(false);
       textareaRef.current.style.height = "41px";
     }
   }, [address.value]);*/

  const handleInput = () => {
    textareaRef.current.style.height = "41px";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  };

  const toggleAlias = () => {
    if (aliasVisible) {
      setAliasVisible(false);
    } else {
      handleInput();
      setAliasVisible(true);
    }
  };

  return (
    <div>
      <label className={mainStyles.label} htmlFor="address-wallet-send">
        Address:
        {address.value && (
          <button className={buttonClasses} onClick={toggleAlias}>
            <img src={aliasIcon} alt="add alias button icon" />
          </button>
        )}
      </label>

      <div className={s.textArea}>
        {aliasVisible && address.value && (
          <div className={s.textAreaAlias}>
            @ <input value={alias.value} onChange={alias.onChange} />
            <span>
              <img src={checkIcon} alt="check icon" />
            </span>
          </div>
        )}

        <textarea
          disabled={aliasVisible}
          ref={textareaRef}
          value={address.value}
          onChange={address.onChange}
          onInput={handleInput}
          placeholder="Enter the recipient’s address"
          className={getTextAreaClasses()}
          id="address-wallet-send"
        />
      </div>
    </div>
  );
};

export default AddressInput;
