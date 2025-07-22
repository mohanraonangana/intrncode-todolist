import { Header } from "@/components/Header";
import { TodoListCard } from "@/components/TodoListCard";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center bg-background p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl">
          <TodoListCard />
        </div>
      </main>
    </div>
  );
}
