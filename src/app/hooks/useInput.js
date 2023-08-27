import { useState } from "react";
import { useValidation } from "./useValidation";

export const useInput = (initialState, validations) => {
  const [value, setValue] = useState(initialState);
  const [isDirty, setIsDirty] = useState(false);
  const valid = useValidation(value, validations);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onInput = (value) => {
    setValue(value);
  };

  const onBlur = () => {
    setIsDirty(true);
  };

  const isFilled = value.length > 0;

  return { value, onChange, onInput, onBlur, isFilled, isDirty, ...valid };
};
