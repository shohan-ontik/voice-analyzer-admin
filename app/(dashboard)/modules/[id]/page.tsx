import Link from "next/link";
import { ApiClientError, getAdminModule } from "../../../lib/apiClient";
import { getSessionToken } from "../../../lib/session";
import { ArrowRightIcon, ClipboardIcon } from "../../../components/icons";
import { ChapterBuilder } from "../../../components/modules/ChapterBuilder";
import { ModuleBasicsForm } from "../../../components/modules/ModuleBasicsForm";

export default async function ModuleEditorPage(props: PageProps<"/modules/[id]">) {
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
      <div className="px-10 py-8 max-w-[900px] w-full mx-auto flex flex-col gap-3">
        <div className="text-[13.5px] text-danger">{loadError ?? "This module could not be found."}</div>
        <Link href="/modules" className="text-[13px] font-semibold text-accent cursor-pointer">
          Back to Content Management
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-10 pt-8 pb-32 max-w-[900px] w-full mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-1.5 text-[13px]">
          <Link href="/modules" className="font-semibold text-foreground-muted hover:text-foreground cursor-pointer">
            Content Management
          </Link>
          <span className="text-foreground-muted">›</span>
          <span className="font-semibold text-accent">Edit Module</span>
        </div>

        <div>
          <h1 className="font-display font-bold text-[28px] text-foreground mb-1">Module Editor</h1>
          <p className="text-[14px] text-foreground-muted">
            Construct and refine training modules, chapters, and associated assessments.
          </p>
        </div>

        <ModuleBasicsForm moduleId={id} module={trainingModule} />

        <ChapterBuilder moduleId={id} chapters={trainingModule.chapters} />

        <Link
          href={`/modules/${id}/exams`}
          className="rounded-2xl border border-border bg-background-elevated p-6 flex items-center justify-between gap-4 cursor-pointer hover:border-accent/40"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <ClipboardIcon size={18} />
            </div>
            <div>
              <div className="font-display font-bold text-[15px] text-foreground">
                Module Assessment {trainingModule.exam ? "· Configured" : "· Not set up"}
              </div>
              <p className="text-[13px] text-foreground-muted">Set the pass mark, deadline, and scenario question.</p>
            </div>
          </div>
          <ArrowRightIcon size={16} className="text-foreground-muted shrink-0" />
        </Link>
      </div>
    </div>
  );
}
