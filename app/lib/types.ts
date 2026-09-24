// Mirrors the shape returned by voice-analyzer-api's User#toSafeJSON()
// and the /admin/users list/create/ban/unban endpoints.
export type AdminUser = {
  id: string;
  username: string;
  phone: string | null;
  email: string | null;
  name: string;
  role: "user" | "admin";
  isBanned: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  employeeId: string | null;
  department: string | null;
  jobTitle: string | null;
  createdAt: string;
};

export type CreatedUser = AdminUser & { tempPassword: string };

export type UserListResult = {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type ApiErrorBody = {
  error: { message: string; details?: unknown };
};

// Mirrors GET /admin/stats/summary.
export type AdminStatsSummary = {
  totalUsers: number;
  bannedUsers: number;
  totalPracticeSessions: number;
  sessionsThisWeek: number;
};

// Mirrors voice-analyzer-api's Topic model / /admin/topics endpoints.
export type Topic = {
  id: string;
  name: string;
  passage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TopicListResult = {
  items: Topic[];
  total: number;
  page: number;
  pageSize: number;
};

// Mirrors voice-analyzer-api's ScoreCategory model / /admin/score-categories endpoints.
export type ScoreCategory = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScoreCategoryListResult = {
  items: ScoreCategory[];
  total: number;
  page: number;
  pageSize: number;
};

// Mirrors GET /admin/modules list items.
export type AdminModuleSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  chapterCount: number;
  examCount: number;
  updatedAt: string;
};

export type AdminModuleListResult = {
  items: AdminModuleSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminMaterialType = "video" | "pdf" | "audio";

export type AdminChapter = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  materials: { id: string; type: AdminMaterialType; title: string; meta: string }[];
};

// Mirrors voice-analyzer-api's ModuleChapter#scenario (JSONB) — the AI
// roleplay scenario a trainee practices against for a chapter. The admin
// app never shows an editor for this; it's generated automatically from
// the chapter's title/description (see generate-scenario) and sent along
// with chapter create/update requests.
export type ChapterScenario = {
  clientInitials: string;
  clientName: string;
  clientTitle: string;
  objection: string;
  objective: string;
  criteria: string[];
};

export type AdminExam = {
  id: string;
  title: string;
  passMark: number;
  scenario: string;
  deadlineDays: number | null;
};

// Mirrors GET /admin/modules/:id — the Module Editor's data source.
export type AdminModuleDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  publishDate: string | null;
  chapters: AdminChapter[];
  exam: AdminExam | null;
};
