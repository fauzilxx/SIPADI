import { cookies } from "next/headers";

import LoginForm from "@/components/LoginForm";
import PakarDashboard from "@/components/PakarDashboard";
import { getSessionCookieName, verifySessionToken } from "@/lib/expert-auth";
import { readKnowledgeBaseFile } from "@/lib/expert-kb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PakarPage({
  searchParams,
}: {
  searchParams?: Promise<{
    role?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySessionToken(token);
  const knowledgeBaseData = await readKnowledgeBaseFile();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const preferredRole =
    resolvedSearchParams?.role === "admin" ? "admin" : "pakar";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef6e1,transparent_36%),linear-gradient(180deg,#f7faf4_0%,#eef4e8_100%)] px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {session ? (
          <PakarDashboard
            initialData={knowledgeBaseData}
            currentUserRole={session.role}
            currentUsername={session.username}
          />
        ) : (
          <div className="mx-auto max-w-2xl pt-12">
            <LoginForm key={preferredRole} preferredRole={preferredRole} />
          </div>
        )}
      </div>
    </div>
  );
}
