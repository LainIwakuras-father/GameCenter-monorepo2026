import React, { useEffect } from "react";
import cx from "classnames";

import { bem } from "../../lib";

import "./index.scss";

interface Props {
  title: string;
  status: "finished" | "locked" | "active" | "finish-stantion";
  numberic?: number;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
  mix?: string;
  color: "white" | "gray";
  /** Optional stagger offset for the entrance animation. */
  animationDelay?: number;
}

const b = bem("popup-plate");

export const PopupPlate = ({
  title,
  status,
  numberic,
  defaultExpanded,
  children,
  mix,
  color,
  animationDelay = 40,
}: Props) => {
  const isExpandable = status === "active" || status === "finish-stantion";
  const hasContent = children !== undefined && children !== null;
  const canExpand = isExpandable && hasContent;
  const contentId = React.useId();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState(
    isExpandable && (defaultExpanded ?? false),
  );

  const handleExpand = () => {
    if (canExpand) {
      setExpanded((val) => !val);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (canExpand && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      handleExpand();
    }
  };

  useEffect(() => {
    if (!isExpandable) {
      setExpanded(false);
    }
  }, [isExpandable]);

  React.useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.inert = !expanded;
    }
  }, [expanded]);

  return (
    <div
      className={cx(b(null, { status, color }), mix)}
      style={
        {
          "--popup-delay": `${Math.max(0, animationDelay)}ms`,
        } as React.CSSProperties
      }
    >
      <div
        className={b("controls")}
        onClick={handleExpand}
        onKeyDown={handleKeyDown}
        role={canExpand ? "button" : undefined}
        tabIndex={canExpand ? 0 : undefined}
        aria-expanded={canExpand ? expanded : undefined}
        aria-controls={canExpand ? contentId : undefined}
      >
        <div
          className={b("status-badge", { status })}
          data-numberic={numberic}
        />

        <h2 className={b("title")}>{title}</h2>

        <svg
          aria-hidden="true"
          className={b("expand-button", { expanded })}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M12 8L6 14L12 8Z" fill="var(--font-color-primary)" />
          <path
            d="M18 14L12 8L6 14"
            stroke="var(--font-color-placeholder)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {hasContent && (
        <div
          className={b("content", { expanded })}
          id={hasContent ? contentId : undefined}
          ref={contentRef}
          aria-hidden={!expanded}
        >
          <div className={b("content-inner")}>{children}</div>
        </div>
      )}
    </div>
  );
};
