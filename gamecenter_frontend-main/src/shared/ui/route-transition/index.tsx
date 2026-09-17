import type { PropsWithChildren } from "react";
import { useLocation } from "react-router";

import "./index.scss";

interface Props extends PropsWithChildren {
  /**
   * Optional class name for consumers that need to adjust the transition
   * container without changing the route lifecycle.
   */
  className?: string;
  /** Pauses the first entrance until the startup curtain begins to leave. */
  initialCovered?: boolean;
}

/**
 * Re-mounts the route surface whenever the visible URL changes.  The
 * re-mount gives every page a consistent entrance animation while keeping the
 * router in charge of navigation and history.  Query string and hash changes
 * are included because they can represent a different page state as well.
 */
export const RouteTransition = ({
  children,
  className,
  initialCovered = false,
}: Props) => {
  const location = useLocation();
  // `location.key` also covers navigations that keep the same URL but carry a
  // different history state (for example, a back/forward transition).
  const routeId = `${location.key}:${location.pathname}${location.search}${location.hash}`;

  return (
    <div
      className={["route-transition", className].filter(Boolean).join(" ")}
      data-intro-covered={initialCovered || undefined}
      key={routeId}
    >
      {children}
    </div>
  );
};
