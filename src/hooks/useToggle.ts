import { useState, useCallback } from 'react';

/**
 * A custom hook that provides a boolean state and functions to toggle it
 * 
 * @param initialValue - Initial boolean value (default: false)
 * @returns A tuple containing [isOn, toggle, setOn]
 */
export const useToggle = (initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] => {
  const [isOn, setOn] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setOn(prevValue => !prevValue);
  }, []);

  const setValue = useCallback((value: boolean) => {
    setOn(value);
  }, []);

  return [isOn, toggle, setValue];
};

/**
 * Hook variant that returns an object instead of tuple (for named destructuring)
 */
export const useToggleObject = (initialValue: boolean = false) => {
  const [isOn, toggle, setValue] = useToggle(initialValue);
  
  return {
    value: isOn,
    toggle,
    setValue,
    setTrue: useCallback(() => setValue(true), [setValue]),
    setFalse: useCallback(() => setValue(false), [setValue]),
  };
};

export default useToggle;