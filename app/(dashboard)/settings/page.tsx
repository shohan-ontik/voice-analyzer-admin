import { CategoriesManager } from "../../components/CategoriesManager";
import { TopicsManager } from "../../components/TopicsManager";

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <TopicsManager />
      <div className="h-px bg-border max-w-[1000px] w-full mx-auto" />
      <CategoriesManager />
    </div>
  );
}
