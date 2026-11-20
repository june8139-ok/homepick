import type { Metadata } from "next";

import type {
  ReactNode,
} from "react";

import AdminShell from "../../components/Admin/AdminShell";
import {
  requireAdmin,
} from "../../lib/requireAdmin";

export const metadata: Metadata = {
  title: "집눈 관리",
  robots: { index: false, follow: false },
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  await requireAdmin();

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
