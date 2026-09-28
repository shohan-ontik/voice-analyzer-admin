import { ApiClientError, listAdminModules } from "../../lib/apiClient";
import { getSessionToken } from "../../lib/session";
import type { AdminModuleSummary } from "../../lib/types";
import { CreateModuleTrigger } from "../../components/modules/CreateModuleTrigger";
import { ModulesExplorer } from "../../components/modules/ModulesExplorer";

const PAGE_SIZE = 10;

export default async function ModulesPage(props: PageProps<"/modules">) {
  const searchParams = await props.searchParams;
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const page = Math.max(1, Number(rawPage) || 1);

  const token = await getSessionToken();

  let items: AdminModuleSummary[] = [];
  let total = 0;
  let error: string | null = null;

  if (!token) {
    error = "Not authenticated.";
  } else {
    try {
      const result = await listAdminModules(token, { page, pageSize: PAGE_SIZE });
      items = result.items;
      total = result.total;
    } catch (err) {
      error = err instanceof ApiClientError ? err.message : "Failed to load modules.";
    }
  }

  return (
    <div className="flex-1 px-10 py-8 max-w-[1240px] w-full mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[28px] text-foreground mb-1">Modules & Content</h1>
          <p className="text-[14px] text-foreground-muted">Manage training curriculum, exams, and settings.</p>
        </div>

        <CreateModuleTrigger />
      </div>

      {error && <div className="text-[13px] text-danger">{error}</div>}

      <ModulesExplorer items={items} total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
