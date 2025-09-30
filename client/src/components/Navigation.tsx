import { Link, useLocation } from "wouter";
import { FileEdit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();

  const handleTitleClick = () => {
    // Clear localStorage to reset form data
    localStorage.clear();
    // Refresh the page to reset all state
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Button 
            variant="ghost" 
            onClick={handleTitleClick}
            className="text-xl font-bold p-0 h-auto hover:bg-transparent"
          >
            판매글 생성기
          </Button>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              data-testid="link-generator"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover-elevate rounded-md ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <FileEdit className="h-4 w-4" />
              판매글 생성기
            </Link>
            <Link
              href="/saved"
              data-testid="link-saved"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover-elevate rounded-md ${
                location === "/saved" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Save className="h-4 w-4" />
              저장된 글
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
