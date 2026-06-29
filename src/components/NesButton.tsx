import type { ButtonHTMLAttributes } from "react";
import { useSound } from "../hooks/useSound";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders as the pressed/active state (e.g. selected tab). */
  active?: boolean;
  /** SFX to play on click. Defaults to "select". */
  sfx?: "move" | "select" | "back" | "toggle" | "coin";
}

export function NesButton({
  active,
  sfx = "select",
  className = "",
  onClick,
  children,
  ...rest
}: Props) {
  const { play } = useSound();
  return (
    <button
      type="button"
      data-active={active ? "true" : undefined}
      className={`pixel-btn px-4 py-3 text-[10px] leading-none uppercase tracking-wider text-ink ${className}`}
      onClick={(e) => {
        play(sfx);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
