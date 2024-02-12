import ora from "ora";
import { differenceInSeconds } from "date-fns";

import { WildApricot } from "./interfaces";

export function getEventName(event: WildApricot.Event) {
  return `${event.Name} at ${event.Location} on ${event.StartDate}`;
}

export function countdownUntil(targetTime: Date): Promise<void> {
  return new Promise<void>((resolve) => {
    const spinner = ora({
      text: `Waiting until ${targetTime.toLocaleString()}`,
      hideCursor: false,
    }).start();
    const currentTime = new Date();
    const timeDifference = differenceInSeconds(targetTime, currentTime);

    if (timeDifference <= 0) {
      // If the target time has already passed, resolve immediately
      resolve();
    } else {
      const interval = setInterval(() => {
        const remainingTime = differenceInSeconds(targetTime, new Date());

        if (remainingTime <= 0) {
          clearInterval(interval);
          resolve();
        } else {
          const formattedTime = formatCountdown(remainingTime);
          spinner.text = `Waiting: ${formattedTime} (interval: ${remainingTime})`;
        }
      }, 1000);
    }
  });
}

export function extendDateStringWithTimezoneOffset(
  date1: string,
  date2: string
): string {
  const timezoneOffset = date1.substr(-6);
  const timezoneOffset2 = date2.substr(-6);
  const date2WithTimeZone = date2.replace(timezoneOffset2, timezoneOffset);

  return date2WithTimeZone;
}

function formatCountdown(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  let parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

  return parts.join(", ");
}
