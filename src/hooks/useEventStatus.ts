type EventStatus = "active" | "completed";

export function getEventStatus(): EventStatus {
  return process.env.NEXT_PUBLIC_EVENT_STATUS === "completed"
    ? "completed"
    : "active";
}

export function useEventStatus(): EventStatus {
  return getEventStatus();
}
