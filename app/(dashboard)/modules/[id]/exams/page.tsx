import Link from "next/link";
import { ApiClientError, getAdminModule } from "../../../../lib/apiClient";
import { getSessionToken } from "../../../../lib/session";
import { ExamEditorCard } from "../../../../components/exams/ExamEditorCard";

export default async function ManageExamsPage(props: PageProps<"/modules/[id]/exams">) {
  const { id } = await props.params;
  const token = await getSessionToken();

  let trainingModule = null;
  let loadError: string | null = null;

  if (!token) {
    loadError = "Not authenticated.";
  } else {
    try {
      trainingModule = await getAdminModule(token, id);
    } catch (err) {
      loadError = err instanceof ApiClientError ? err.message : "Failed to load this module.";
    }
  }

  if (loadError || !trainingModule) {
    return (
      <div className="px-10 py-8 max-w-[800px] w-full mx-auto flex flex-col gap-3">
        <div className="text-[13.5px] text-danger">{loadError ?? "This module could not be found."}</div>
        <Link href="/modules" className="text-[13px] font-semibold text-accent cursor-pointer">
          Back to Content Management
        </Link>
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-[800px] w-full mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-1.5 text-[13px] flex-wrap">
        <Link href="/modules" className="font-semibold text-foreground-muted hover:text-foreground cursor-pointer">
          Content Management
        </Link>
        <span className="text-foreground-muted">›</span>
        <Link href={`/modules/${id}`} className="font-semibold text-foreground-muted hover:text-foreground cursor-pointer">
          {trainingModule.title}
        </Link>
        <span className="text-foreground-muted">›</span>
        <span className="font-semibold text-accent">Manage Exams</span>
      </div>

      <div>
        <h1 className="font-display font-bold text-[26px] text-foreground mb-1">Manage Exams</h1>
        <p className="text-[14px] text-foreground-muted">
          Every module has {trainingModule.exams.length} exams. All of them need a scenario before the module can be
          published.
        </p>
      </div>

      {trainingModule.exams.map((exam, i) => (
        <ExamEditorCard key={exam.id} moduleId={id} exam={exam} index={i} />
      ))}
    </div>
  );
}
