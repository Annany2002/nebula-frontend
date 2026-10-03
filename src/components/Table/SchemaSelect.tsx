import { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export default function SchemaSelect({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="schema-select">
      <select {...props}>{children}</select>
      <ChevronDown size={14} aria-hidden="true" />
    </span>
  );
}
