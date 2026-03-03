// ============================================================
// BoardBoss localStorage utilities
// ============================================================

export type Exam = {
  id: string;
  name: string;
  subjectId?: string;
  examDate: string; // ISO date string
};

export type Quote = {
  id: string;
  text: string;
  author?: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type TimetableEntry = {
  day: string; // "Mon","Tue",...
  slot: string; // "08:00-09:00"
  subjectId: string;
  subjectName: string;
  color: string;
};

export type SubjectHours = {
  subjectId: string;
  hoursPerDay: number;
};

// Keys
const KEYS = {
  streakDays: "boardboss_streak_days",
  exams: "boardboss_exams",
  quotes: "boardboss_quotes",
  announcements: "boardboss_announcements",
  timetable: "boardboss_timetable",
  subjectHours: "boardboss_subject_hours",
  timetableStartTime: "boardboss_timetable_start_time",
};

// Generic helpers
function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Streak ----
export function getStreakDays(): string[] {
  return getItem<string[]>(KEYS.streakDays, []);
}

export function addStreakDay(date: string): void {
  const days = getStreakDays();
  if (!days.includes(date)) {
    setItem(KEYS.streakDays, [...days, date]);
  }
}

export function computeStreak(): number {
  const days = getStreakDays();
  if (days.length === 0) return 0;
  const sorted = [...days].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  let count = 0;
  let current = today;
  for (const day of sorted) {
    if (day === current) {
      count++;
      // move to previous day
      const d = new Date(current);
      d.setDate(d.getDate() - 1);
      current = d.toISOString().slice(0, 10);
    } else if (day < current) {
      break;
    }
  }
  return count;
}

// ---- Exams ----
export function getExams(): Exam[] {
  return getItem<Exam[]>(KEYS.exams, []);
}

export function saveExams(exams: Exam[]): void {
  setItem(KEYS.exams, exams);
}

export function addExam(exam: Exam): void {
  const exams = getExams();
  setItem(KEYS.exams, [...exams, exam]);
}

export function deleteExam(id: string): void {
  const exams = getExams().filter((e) => e.id !== id);
  setItem(KEYS.exams, exams);
}

// ---- Quotes ----
const DEFAULT_QUOTES: Quote[] = [
  {
    id: "q1",
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    id: "q2",
    text: "Education is not the filling of a pail, but the lighting of a fire.",
    author: "W.B. Yeats",
  },
  {
    id: "q3",
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    id: "q4",
    text: "The more that you read, the more things you will know.",
    author: "Dr. Seuss",
  },
  {
    id: "q5",
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    id: "q6",
    text: "Study hard, for the well is deep, and our brains are shallow.",
    author: "Richard Baxter",
  },
  {
    id: "q7",
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
  },
  {
    id: "q8",
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
  {
    id: "q9",
    text: "Every expert was once a beginner.",
    author: "Helen Hayes",
  },
  {
    id: "q10",
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
];

export function getQuotes(): Quote[] {
  const stored = getItem<Quote[] | null>(KEYS.quotes, null);
  if (!stored) {
    setItem(KEYS.quotes, DEFAULT_QUOTES);
    return DEFAULT_QUOTES;
  }
  return stored;
}

export function saveQuotes(quotes: Quote[]): void {
  setItem(KEYS.quotes, quotes);
}

export function addQuote(quote: Quote): void {
  const quotes = getQuotes();
  setItem(KEYS.quotes, [...quotes, quote]);
}

export function deleteQuote(id: string): void {
  const quotes = getQuotes().filter((q) => q.id !== id);
  setItem(KEYS.quotes, quotes);
}

export function getRandomQuote(): Quote {
  const quotes = getQuotes();
  if (quotes.length === 0) return DEFAULT_QUOTES[0];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// ---- Announcements ----
export function getAnnouncements(): Announcement[] {
  return getItem<Announcement[]>(KEYS.announcements, []);
}

export function saveAnnouncements(announcements: Announcement[]): void {
  setItem(KEYS.announcements, announcements);
}

export function addAnnouncement(ann: Announcement): void {
  const anns = getAnnouncements();
  setItem(KEYS.announcements, [...anns, ann]);
}

export function deleteAnnouncement(id: string): void {
  const anns = getAnnouncements().filter((a) => a.id !== id);
  setItem(KEYS.announcements, anns);
}

export function getLatestAnnouncement(): Announcement | null {
  const anns = getAnnouncements();
  if (anns.length === 0) return null;
  return [...anns].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

// ---- Timetable ----
export function getTimetable(): TimetableEntry[] {
  return getItem<TimetableEntry[]>(KEYS.timetable, []);
}

export function saveTimetable(entries: TimetableEntry[]): void {
  setItem(KEYS.timetable, entries);
}

export function getSubjectHours(): SubjectHours[] {
  return getItem<SubjectHours[]>(KEYS.subjectHours, []);
}

export function saveSubjectHours(hours: SubjectHours[]): void {
  setItem(KEYS.subjectHours, hours);
}

export function getTimetableStartTime(): string {
  return getItem<string>(KEYS.timetableStartTime, "08:00");
}

export function saveTimetableStartTime(time: string): void {
  setItem(KEYS.timetableStartTime, time);
}

// ---- Date helpers ----
export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---- BigInt conversions ----
export function dateToBigIntNs(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

export function bigIntNsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

// ---- ID generator ----
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---- Quick Notes ----
const QUICK_NOTES_KEY = "boardboss_quick_notes";

export function getQuickNotes(): string {
  return getItem<string>(QUICK_NOTES_KEY, "");
}

export function saveQuickNotes(text: string): void {
  setItem(QUICK_NOTES_KEY, text);
}

// ---- Daily Focus Goal ----
const DAILY_GOAL_KEY = "boardboss_daily_goal_minutes";
const FOCUS_MINUTES_KEY = "boardboss_focus_minutes";

export function getDailyGoalMinutes(): number {
  return getItem<number>(DAILY_GOAL_KEY, 120);
}

export function saveDailyGoalMinutes(mins: number): void {
  setItem(DAILY_GOAL_KEY, mins);
}

export function getTodayFocusMinutes(): number {
  const stored = getItem<{ date: string; minutes: number } | null>(
    FOCUS_MINUTES_KEY,
    null,
  );
  const today = new Date().toISOString().slice(0, 10);
  if (!stored || stored.date !== today) return 0;
  return stored.minutes;
}

export function addFocusMinutes(mins: number): void {
  const today = new Date().toISOString().slice(0, 10);
  const current = getTodayFocusMinutes();
  setItem(FOCUS_MINUTES_KEY, { date: today, minutes: current + mins });
}

// ---- Flashcards ----
export type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

const FLASHCARDS_PREFIX = "boardboss_flashcards_";

export function getFlashcards(materialId: string): Flashcard[] {
  return getItem<Flashcard[]>(`${FLASHCARDS_PREFIX}${materialId}`, []);
}

export function saveFlashcards(materialId: string, cards: Flashcard[]): void {
  setItem(`${FLASHCARDS_PREFIX}${materialId}`, cards);
}

// ---- Weekly Task Completions (for chart) ----
const TASK_COMPLETIONS_KEY = "boardboss_task_completions";

export function recordTaskCompletion(): void {
  const today = new Date().toISOString().slice(0, 10);
  const stored = getItem<string[]>(TASK_COMPLETIONS_KEY, []);
  setItem(TASK_COMPLETIONS_KEY, [...stored, today]);
}

export function getWeeklyCompletions(): number[] {
  const stored = getItem<string[]>(TASK_COMPLETIONS_KEY, []);
  const result: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push(stored.filter((s) => s === dateStr).length);
  }
  return result;
}

// ---- Grades ----
export type GradeAssignment = {
  id: string;
  name: string;
  score: number; // 0-100
  weight: number; // percentage
};

export type GradeSubject = {
  id: string;
  name: string;
  assignments: GradeAssignment[];
};

const GRADES_KEY = "boardboss_grades";

export function getGradeSubjects(): GradeSubject[] {
  return getItem<GradeSubject[]>(GRADES_KEY, []);
}

export function saveGradeSubjects(subjects: GradeSubject[]): void {
  setItem(GRADES_KEY, subjects);
}
