// Mirrors the shape returned by voice-analyzer-api's User#toSafeJSON()
// and the /admin/users list/create/ban/unban endpoints.
export type AdminUser = {
  id: string;
  email: string;
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

// Mirrors GET /admin/modules/:id — a read-only content preview (chapters +
// materials + exam). No authoring endpoints exist yet for any of these
// nested entities.
export type AdminModuleDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  chapters: {
    id: string;
    slug: string;
    title: string;
    description: string;
    materials: { id: string; type: "video" | "pdf" | "audio"; title: string; meta: string }[];
  }[];
  exam: { id: string; title: string; passMark: number; scenario: string } | null;
};
