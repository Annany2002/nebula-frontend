import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

const CopyButton = ({
  text,
  label = "Copy code",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) => {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timeout.current), []);

  const copy = async () => {
    clearTimeout(timeout.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    timeout.current = setTimeout(() => setStatus("idle"), 2400);
  };

  return (
    <button type="button" className={`nbl-copy ${className}`} onClick={copy}>
      {status === "copied" ? <Check size={14} /> : <Copy size={14} />}
      <span aria-live="polite">
        {status === "copied" ? "Copied!" : status === "failed" ? "Copy failed, try again" : label}
      </span>
    </button>
  );
};

export default CopyButton;
