import * as React from "react";

export const Delay = ({ children, delay }) => {
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const showTimer = setTimeout(() => setDone(true), delay);
    return () => clearTimeout(showTimer);
  });

  return done && <>{children}</>;
};
