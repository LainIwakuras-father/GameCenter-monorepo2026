import React from "react";

import { bem } from "../../lib";

import "./index.scss";

interface Props
  extends
    React.PropsWithChildren,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Определяет цвет кнопки */
  view?: "primary" | "secondary" | "error";
  size?: "s" | "m";
  mix?: string;
}

const b = bem("button");

export const Button = ({
  className,
  disabled,
  mix,
  onClick,
  view = "primary",
  children,
  size = "m",
  ...props
}: Props) => {
  return (
    <button
      {...props}
      className={b(
        null,
        { view, size },
        [className, mix].filter(Boolean).join(" "),
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
