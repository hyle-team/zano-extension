import React, { useState } from 'react';
import s from "components/Wallet/Wallet.module.scss"
import { ReactComponent as SendIcon } from "assets/svg/send.svg";
import { ReactComponent as ReceiveIcon } from "assets/svg/receive.svg";
import { ReactComponent as CopyIcon } from "assets/svg/copy.svg";
import copy from 'copy-to-clipboard';

const Wallet = () => {
   const [modalVisible, setModalVisible] = useState(false)
   const walletStatus = true;
   const percentChange = false;
   const walletAddress = "ZxDCjtvEPnwKFPa9Hy5frFbQoT6KQaR7EPnwKFPa9Hy5frFbQoT6KQaR7";

   const getWalletStatusColor = () => {
      return walletStatus ? "#16D1D6" : "red"
   }

   const getWalletPercentColor = () => {
      return percentChange ? "#16D1D6" : "#FFCBCB"
   }

   const copyToClipboard = (text) => {
      copy(text)
      setModalVisible(true)
      setTimeout(() => {
         setModalVisible(false)
      }, 2000)
   };


   return (
      <div>

         <div className={s.infoWallet}>
            <div className={s.infoTop}>
               <div>Wallet Name 1</div>
               <span
                  className={s.infoWalletStatus}
                  style={{backgroundColor: getWalletStatusColor()}}
               />
            </div>
            <div className={s.infoBalance}>
               <span>$1224.15</span>
               <span
                  style={{color: getWalletPercentColor()}}
                  className={s.percentСhange}
               >
                  -4.6%
               </span>
            </div>
            <div className={s.infoAddress}>
               <span>{walletAddress}</span>
               <button
                  onClick={() => copyToClipboard(walletAddress)}
                  className={`${s.copyButton} round-button`}
               >
                  <CopyIcon/>
               </button>
            </div>
         </div>

         <div className={s.actionsWallet}>
            <button className={s.actionsButton}>
               <SendIcon/> Send
            </button>
            <button className={s.actionsButton}>
               <ReceiveIcon/> Receive
            </button>
         </div>

         {modalVisible &&
            (
               <div className={s.clipboardModal}>
                  Copied to clipboard!
               </div>
            )
         }


      </div>
   );
};

export default Wallet;