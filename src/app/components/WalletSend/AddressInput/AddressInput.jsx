import React, { useEffect, useRef, useState } from "react";
import checkIcon from "../../../assets/svg/check.svg";
import aliasIcon from "../../../assets/svg/contacts.svg";
import mainStyles from "../WalletSend.module.scss";
import s from "./AddressInput.module.scss";
import { getAliasDetails, getAlias } from "../../../../background/wallet";

const AddressInput = ({ address }) => {
  const textareaRef = useRef(null);
  const [aliasVisible, setAliasVisible] = useState(false);
  const [alias, setAlias] = useState({ value: "", address: "" });

  const buttonClasses = aliasVisible
    ? [s.addAliasBtn, s.active].join(" ")
    : s.addAliasBtn;

  const getTextAreaClasses = () => {
    const aliasVisibleClass = aliasVisible && address.value && s.thinText;
    const inputFilledClass = address.value.length && "_input-filled";
    return [aliasVisibleClass, inputFilledClass].join(" ");
  };

  useEffect(() => handleInput(), []);

  const handleInput = () => {
    textareaRef.current.style.height = "41px";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  };

  const toggleAlias = async () => {
    if (!aliasVisible && address.value) {
      const aliasValue = await getAlias(address.value);
      if (aliasValue) {
        setAlias((prevState) => ({ ...prevState, value: aliasValue }));
        setAliasVisible(true);
      } else {
        const addr = await getAliasDetails(address.value);
        if (addr) {
          setAlias((prevState) => ({ ...prevState, address: addr }));
          setAliasVisible(true);
        }
      }
    } else {
      setAliasVisible(!aliasVisible);
    }
  };

  const handleAliasChange = async (e) => {
    const aliasValue = e.target.value;
    const addr = await getAliasDetails(aliasValue);
    if (addr) {
      setAlias({ value: aliasValue, address: addr });
      address.onChange({ target: { value: addr } }); // set address to resolved address from alias
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
        {aliasVisible && (
          <div className={s.textAreaAlias}>
            @ <input value={alias.value} onChange={handleAliasChange} />
            <span>
              <img src={checkIcon} alt="check icon" />
            </span>
          </div>
        )}

        <textarea
          disabled={aliasVisible}
          ref={textareaRef}
          value={alias.address || address.value}
          onChange={address.onChange}
          onInput={handleInput}
          placeholder={
            aliasVisible
              ? alias.address
              : "Enter the Recipient's Address or Alias"
          }
          className={getTextAreaClasses()}
          id="address-wallet-send"
        />
      </div>
    </div>
  );
};

export default AddressInput;
