import { CategoriesSection } from "../../components/categories/CategoriesSection";
import { loadCategories } from "../../components/categories/data";
import { TopicsManager } from "../../components/TopicsManager";

export default async function SettingsPage() {
  const { categories, error } = await loadCategories();

  return (
    <div className="flex flex-col">
      <TopicsManager />
      <div className="h-px bg-border max-w-[1000px] w-full mx-auto" />
      <CategoriesSection categories={categories} loadError={error} />
    </div>
  );
}
