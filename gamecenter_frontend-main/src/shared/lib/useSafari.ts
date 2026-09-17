import { useEffect, useState } from "react";

/** Узнать находится ли человек в сафари */
export const useSafari = () => {
  const [safari, setImInHell] = useState(false);

  useEffect(() => {
    if (
      navigator.userAgent.match(/AppleWebKit/) &&
      !navigator.userAgent.match(/Chrome/)
    ) {
      setImInHell(true);
    }
  });

  return safari;
};
