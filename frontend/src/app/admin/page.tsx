import type { Metadata } from "next";
import { AdminPanel } from "@/features/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Content Studio",
  description: "Upload and manage catalog titles.",
};

/** Admin content studio — upload movies & series with posters and quality variants. */
export default function AdminPage() {
  return <AdminPanel />;
}
