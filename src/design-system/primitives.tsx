import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <Button aria-label={label} {...props}>
      {children}
    </Button>
  );
}
export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" {...props} />;
}
export function Badge({ children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props}>{children}</span>;
}
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={className} />;
}
export function InlineAlert({
  children,
  role = "status",
}: {
  children: ReactNode;
  role?: "status" | "alert";
}) {
  return <div role={role}>{children}</div>;
}
