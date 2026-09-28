import { CategoriesSection } from "../../components/categories/CategoriesSection";
import { loadCategories } from "../../components/categories/data";

export default async function CategoriesPage() {
  const { categories, error } = await loadCategories();

  return <CategoriesSection categories={categories} loadError={error} />;
}
