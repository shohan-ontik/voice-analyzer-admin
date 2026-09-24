import type { ScoreCategory } from "../../lib/types";
import { CategoryList } from "./CategoryList";
import { CreateCategoryForm } from "./CreateCategoryForm";

export function CategoriesSection({
  categories,
  loadError,
}: {
  categories: ScoreCategory[];
  loadError: string | null;
}) {
  return (
    <div className="px-16 py-10 max-w-[1000px] w-full mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-[26px] text-foreground mb-1">Categories</h1>
        <p className="text-[14px] text-foreground-muted">
          Extra dimensions the AI marks every pitch on, alongside presentation, correctness, pronunciation and soft
          skills. Turn a category off to stop applying it to new sessions without losing its history.
        </p>
      </div>

      <CreateCategoryForm />

      {loadError && <div className="text-[13px] text-danger">{loadError}</div>}

      <CategoryList categories={categories} />
    </div>
  );
}
