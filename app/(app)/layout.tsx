import { Topbar } from "@/components/topbar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="app-main">
      <Topbar />
      <main className="page-wrap">
        {children}
      </main>
    </div>
  );
}



