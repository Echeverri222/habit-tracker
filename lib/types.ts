export type Habit = {
  id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
};

export type Log = {
  habit_id: string;
  day: string; // YYYY-MM-DD
};

export const HABIT_COLORS = [
  "#ffd35a", // window gold
  "#6fe39a", // terminal green
  "#5fd3f3", // neon cyan
  "#ff7a7a", // sign red
  "#c79bff", // arcade purple
  "#ffa94d", // sodium orange
] as const;
