import type {
  ReactNode,
} from "react";

import AdminShell from "../../components/Admin/AdminShell";
import {
  requireAdmin,
} from "../../lib/requireAdmin";

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
