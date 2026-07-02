import React, { useState, useEffect } from "react";

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  onChange: (val: number) => void;
}

export const NumericInput: React.FC<NumericInputProps> = ({ value, onChange, className, ...props }) => {
  const [inputValue, setInputValue] = useState<string>(value !== undefined && value !== null ? value.toString() : "");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Update local string value when the prop value changes externally (e.g. via preset loading)
  useEffect(() => {
    if (!isFocused) {
      const parsedLocal = parseFloat(inputValue);
      const isLocalNaN = isNaN(parsedLocal);
      const isValueNaN = isNaN(value);
      
      const numbersAreEqual = (isLocalNaN && isValueNaN) || (!isLocalNaN && !isValueNaN && parsedLocal === value);
      
      if (!numbersAreEqual) {
        setInputValue(value !== undefined && value !== null ? value.toString() : "");
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // We immediately update the local state so typing remains fluid and supports '.' or trailing spaces
    setInputValue(rawVal);

    if (rawVal === "" || rawVal === "-") {
      onChange(0);
    } else {
      // Replace comma with dot if user typed a comma (common in European/South American keyboards)
      const normalized = rawVal.replace(",", ".");
      const parsed = parseFloat(normalized);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format perfectly to the updated state value once focus is lost
    setInputValue(value !== undefined && value !== null ? value.toString() : "");
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      {...props}
    />
  );
};
