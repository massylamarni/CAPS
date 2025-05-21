import { useState, useEffect } from "react";

export function useStateLogger(initialValue: any, name = "Unknown state") {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    console.log(`${name} was updated to:`, state);
  }, [state]);

  return [state, setState];
}