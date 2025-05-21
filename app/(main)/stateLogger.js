import { useState, useCallback } from "react";

/**
 * Like useState, but logs every time the setter is called.
 * @param {any} initialValue
 * @param {string} name - Optional: state name for logging
 */
export default function StateLogger(initialValue, name = "state") {
  const [state, setState] = useState(initialValue);

  const loggedSetState = useCallback((valOrFn) => {
    console.log(`[useLoggedState] setState called for "${name}"`, valOrFn);
    setState(valOrFn);
  }, [name]);

  return [state, loggedSetState];
}