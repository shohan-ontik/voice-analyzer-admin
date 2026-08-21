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
