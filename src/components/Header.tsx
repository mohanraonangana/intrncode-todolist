import { BookOpenCheck } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-2xl font-bold text-foreground">
            To-DoZen
          </h1>
        </div>
      </div>
    </header>
  );
}
