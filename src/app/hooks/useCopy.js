import copy from "copy-to-clipboard";
import React, { useState } from "react";
import CopyModal from "../components/UI/CopyModal/CopyModal";

export const useCopy = () => {
  const [copyModalVisible, setCopyModalVisible] = useState(false);

  const copyToClipboard = (text) => {
    copy(text);
    if (!copyModalVisible) {
      setCopyModalVisible(true);
      setTimeout(() => {
        setCopyModalVisible(false);
      }, 3000);
    }
  };

  return {
    copyToClipboard,
    SuccessCopyModal: <CopyModal isVisible={copyModalVisible} />,
  };
};
