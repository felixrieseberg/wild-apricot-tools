import { WildApricot } from "./interfaces";

export function getEventName(event: WildApricot.Event) {
  return `${event.Name} at ${event.Location} on ${event.StartDate}`;
}
