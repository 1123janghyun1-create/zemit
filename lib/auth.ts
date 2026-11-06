import { Builder } from "./types";

export const ADMIN_EMAILS = ["1123janghyun1@gmail.com"];
export const ADMIN_HANDLES = ["1123janghyun1"];
export const ADMIN_USER_IDS = ["08f75bdf-ba36-4ce2-a78d-ac289cb1d5c3"];

export function isUserAdmin(user: Builder | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
  if (user.handle && ADMIN_HANDLES.includes(user.handle.toLowerCase().trim())) return true;
  if (user.id && ADMIN_USER_IDS.includes(user.id.trim())) return true;
  return false;
}
