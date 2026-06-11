import { SportFixture } from "@/types";

const REMINDERS_KEY = "streambd_reminders";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function setReminder(fixture: SportFixture): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    const reminders: SportFixture[] = raw ? JSON.parse(raw) : [];
    if (!reminders.find((r) => r.id === fixture.id)) {
      reminders.push(fixture);
    }
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch {
    // silent
  }
}

export function removeReminder(fixtureId: string): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    const reminders: SportFixture[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(
      REMINDERS_KEY,
      JSON.stringify(reminders.filter((r) => r.id !== fixtureId))
    );
  } catch {
    // silent
  }
}

export function isReminderSet(fixtureId: string): boolean {
  if (!isBrowser()) return false;
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    const reminders: SportFixture[] = raw ? JSON.parse(raw) : [];
    return reminders.some((r) => r.id === fixtureId);
  } catch {
    return false;
  }
}

export function getAllReminders(): SportFixture[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function checkReminders(): void {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const reminders = getAllReminders();
  const now = Date.now();

  for (const fixture of reminders) {
    const fixtureTime = new Date(`${fixture.date}T${fixture.time}:00`).getTime();
    const diff = fixtureTime - now;
    const fifteenMin = 15 * 60 * 1000;

    if (diff > 0 && diff <= fifteenMin) {
      new Notification("⚽ Match starting in 15 minutes!", {
        body: `${fixture.homeTeam} vs ${fixture.awayTeam} — Watch on ${fixture.watchChannel || "StreamBD"}`,
        icon: "/icon.svg",
        tag: fixture.id,
      });
    }
  }
}
