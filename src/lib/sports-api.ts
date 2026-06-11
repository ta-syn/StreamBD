import { SportFixture } from "@/types";

export async function getAllFixtures(): Promise<SportFixture[]> {
  try {
    const res = await fetch("/api/sports");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
