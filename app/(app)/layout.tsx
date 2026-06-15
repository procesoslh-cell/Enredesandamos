import { Topbar } from "@/components/topbar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect("/login");
  return <div className="app-main"><Topbar /><main className="page-wrap">{children}</main></div>;
}
