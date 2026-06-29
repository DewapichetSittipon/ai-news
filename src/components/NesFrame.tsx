import type { HTMLAttributes } from "react";

/** A chunky 8-bit panel. Optionally labelled with a title chip. */
export function NesFrame({
  title,
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { title?: string }) {
  return (
    <div className={`pixel-box relative p-4 ${className}`} {...rest}>
      {title && (
        <span className="pixel-box absolute -top-3 left-4 bg-mario px-2 py-1 text-[8px] uppercase tracking-widest text-ink">
          {title}
        </span>
      )}
      {children}
    </div>
  );
}
