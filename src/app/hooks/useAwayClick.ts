import { useEffect, useRef } from "react";

type Callback = () => void;

const useAwayClick = (ref: React.RefObject<HTMLElement>, callback: Callback) => {
  const savedCallback = useRef<Callback | undefined>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        savedCallback.current?.();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref]);
};

export default useAwayClick;
