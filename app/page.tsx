import { Header } from "./components/Header";
import { UsersManager } from "./components/UsersManager";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <Header />
      <UsersManager />
    </div>
  );
}
