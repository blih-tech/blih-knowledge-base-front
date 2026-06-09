import { apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MeetingStatus = "draft" | "published";
export type ActionItemStatus = "pending" | "in-progress" | "done";
export type MeetingVisibility = "everyone" | "department_only" | "admins_only" | "private";

export interface MeetingAuthor {
  _id: string;
  name: string;
  email: string;
  position?: string;
}

export interface MeetingDepartment {
  _id: string;
  name: string;
}

export interface MeetingAttendee {
  _id: string;
  name: string;
  email: string;
  position?: string;
}

export interface ExternalAttendee {
  name: string;
  email?: string;
  organization?: string;
}

export interface ActionItem {
  _id: string;
  task: string;
  assignee: { _id: string; name: string; email: string };
  dueDate?: string;
  status: ActionItemStatus;
}

export interface MeetingMinute {
  _id: string;
  title: string;
  date: string;
  location: string;
  department: MeetingDepartment;
  author: MeetingAuthor;
  attendees: MeetingAttendee[];
  externalAttendees: ExternalAttendee[];
  agenda: string[];
  content: string;
  actionItems: ActionItem[];
  status: MeetingStatus;
  visibility: MeetingVisibility;
  allowedViewers: { _id: string; name: string; email: string }[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingMinuteListResponse {
  minutes: MeetingMinute[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MeetingMinuteFilters {
  page?: number;
  limit?: number;
  department?: string;
  status?: MeetingStatus;
  visibility?: MeetingVisibility;
  sortBy?: string;
  sortOrder?: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

const unwrap = (res: any) => res.data.data;

// Admin
export const listMeetingMinutes = (
  filters: MeetingMinuteFilters = {},
): Promise<MeetingMinuteListResponse> =>
  apiAxios
    .get("/meetings", { params: filters })
    .then((r) => r.data.data as MeetingMinuteListResponse);

export const getMeetingMinute = (id: string): Promise<MeetingMinute> =>
  apiAxios.get(`/meetings/${id}`).then((r) => r.data.data as MeetingMinute);

export const createMeetingMinute = (data: object): Promise<MeetingMinute> =>
  apiAxios.post("/meetings", data).then(unwrap);

export const updateMeetingMinute = (
  id: string,
  data: object,
): Promise<MeetingMinute> =>
  apiAxios.put(`/meetings/${id}`, data).then(unwrap);

export const deleteMeetingMinute = (id: string): Promise<void> =>
  apiAxios.delete(`/meetings/${id}`).then(() => undefined);

// Public (department-scoped)
export const listPublicMeetingMinutes = (
  filters: Omit<MeetingMinuteFilters, "department" | "status"> = {},
): Promise<MeetingMinuteListResponse> =>
  apiAxios
    .get("/meetings/public", { params: filters })
    .then((r) => r.data.data as MeetingMinuteListResponse);
