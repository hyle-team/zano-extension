import { useContext } from "react";
import { updateBalancesHidden } from "../store/actions";
import { Store } from "../store/store-reducer";

export function useCensorDigits() {
  const { state, dispatch } = useContext(Store);

  const changeCensor = () => {
    updateBalancesHidden(dispatch, (prevState: boolean) => !prevState); 
  };

  const censorValue = (number: number | string): string | number => {
    if (state.isBalancesHidden) {
      return number.toString().replace(/\d/g, "*");
    } else {
      return number;
    }
  };

  return { changeCensor, censorValue };
}

