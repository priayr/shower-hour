"use client";

import { useEffect, useState } from "react";

export function Clock() {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const updateTime = () => {
      const formatted = formatter.format(new Date());
      setTimeStr(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeStr) return <div className="w-[60px]" />; // Placeholder

  const parts = timeStr.split(":");
  if (parts.length !== 2) return <div>{timeStr}</div>;

  const hours = parts[0];
  const minsAndAmPm = parts[1];

  return (
    <div className="tabular-nums flex items-baseline text-sm sm:text-base font-medium opacity-90">
      <span>{hours}</span>
      <span className="animate-[blink_1s_infinite] mx-[1px] inline-block">:</span>
      <span>{minsAndAmPm}</span>
    </div>
  );
}
