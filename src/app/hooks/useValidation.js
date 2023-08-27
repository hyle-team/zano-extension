import { useEffect, useState } from "react";

export const useValidation = (value, validations) => {
  const [isEmpty, setIsEmpty] = useState(true);
  const [minLengthError, setMinLengthError] = useState(false);
  const [amountCorrectError, setAmountCorrectError] = useState(false);
  const [inputValid, setInputValid] = useState(false);

  useEffect(() => {
    for (const validation in validations) {
      switch (validation) {
        case "minLength":
          value.length < validations[validation]
            ? setMinLengthError(true)
            : setMinLengthError(false);
          break;
        case "isEmpty":
          value ? setIsEmpty(false) : setIsEmpty(true);
          break;
        case "isAmountCorrect":
          const amountCheckResult =
            !isNaN(value) && value >= 0.000000000001 && value <= 1000000000;
          setAmountCorrectError(!amountCheckResult);
          break;
        case "customValidation":
          setInputValid(true);
          break;
        default:
          break;
      }
    }
  }, [validations, value]);

  useEffect(() => {
    if (isEmpty || minLengthError || amountCorrectError) {
      setInputValid(false);
    } else {
      setInputValid(true);
    }
  }, [isEmpty, minLengthError, amountCorrectError]);

  return {
    isEmpty,
    minLengthError,
    amountCorrectError,
    inputValid,
  };
};
