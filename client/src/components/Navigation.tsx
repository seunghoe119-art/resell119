import { Link, useLocation } from "wouter";
import { FileEdit, Save, Settings, Users, BookOpen, Music, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const handleTitleClick = () => setLocation("/");

  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="flex min-h-16 flex-wrap items-center gap-2 px-3 py-2 sm:px-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={handleTitleClick}
            className="text-xl font-bold p-0 h-auto hover:bg-transparent"
          >
            resell119
          </Button>
          <div className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap pb-1 sm:gap-2">
            <Link
              href="/"
              data-testid="link-study"
              className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover-elevate ${location === "/" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Timer className="h-4 w-4" />
              공부 타이머
            </Link>
            <Link
              href="/generator"
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
            <Link
              href="/guest"
              data-testid="link-guest"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover-elevate rounded-md ${
                location === "/guest" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Users className="h-4 w-4" />
              게스트 모집
            </Link>
            <Link
              href="/worklog"
              data-testid="link-worklog"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover-elevate rounded-md ${
                location === "/worklog" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              업무일지
            </Link>
            <Link
              href="/lyrics"
              data-testid="link-lyrics"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover-elevate rounded-md ${
                location === "/lyrics" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Music className="h-4 w-4" />
              가사생성
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettingsDialog(true)}
              className="h-9 w-9"
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent data-testid="dialog-settings">
          <DialogHeader>
            <DialogTitle>개발자 페이지</DialogTitle>
            <DialogDescription>supabase - seunghoe119</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              vercel - seunghoe119
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
