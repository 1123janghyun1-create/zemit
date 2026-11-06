import type { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "관리자 센터 (Super Admin Dashboard) — zemix",
  description: "zemix 플랫폼 통합 관리자 제어 센터",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
