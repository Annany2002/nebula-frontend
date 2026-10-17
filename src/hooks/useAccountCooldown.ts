import { useEffect, useState } from "react";

// Store deadlines rather than decrementing counters, so background tabs cannot bypass cooldowns.
export function useAccountCooldown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!until) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= until) setUntil(0);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [until]);
  const start = (seconds: number) => {
    const current = Date.now();
    setNow(current);
    setUntil(current + seconds * 1000);
  };
  return { remaining: Math.max(0, Math.ceil((until - now) / 1000)), start };
}
