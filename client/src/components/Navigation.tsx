import { Link, useLocation } from "wouter";
import { FileEdit, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

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
            <DialogTitle>설정</DialogTitle>
            <DialogDescription>
              애플리케이션 설정을 관리합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              설정 옵션이 여기에 표시됩니다.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
