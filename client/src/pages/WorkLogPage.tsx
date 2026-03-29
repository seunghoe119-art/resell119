import { useState, useEffect, useRef, useCallback } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "worklog_entries";
const MEMO_KEY = "worklog_memo";
const SECRET_KEY = "worklog_secret";

interface WorkEntry {
  id: string;
  time: string;
  content: string;
  hasTimeSet: boolean;
}

interface AiModalState {
  open: boolean;
  entryId: string;
  original: string;
  suggestion: string;
  loading: boolean;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getCurrentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function getTodayLabel() {
  const now = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
}

const emptyEntry = (): WorkEntry => ({
  id: generateId(),
  time: "",
  content: "",
  hasTimeSet: false,
});

export default function WorkLogPage() {
  const [entries, setEntries] = useState<WorkEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [emptyEntry()];
  });

  const [memo, setMemo] = useState(() => localStorage.getItem(MEMO_KEY) ?? "");
  const [secret, setSecret] = useState(() => localStorage.getItem(SECRET_KEY) ?? "");
  const [aiModal, setAiModal] = useState<AiModalState>({
    open: false,
    entryId: "",
    original: "",
    suggestion: "",
    loading: false,
  });

  const { toast } = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((data: WorkEntry[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 300);
  }, []);

  useEffect(() => {
    persist(entries);
  }, [entries, persist]);

  useEffect(() => {
    localStorage.setItem(MEMO_KEY, memo);
  }, [memo]);

  useEffect(() => {
    localStorage.setItem(SECRET_KEY, secret);
  }, [secret]);

  const handleContentChange = (id: string, value: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, content: value };
        if (!e.hasTimeSet && value.length > 0) {
          updated.time = getCurrentTime();
          updated.hasTimeSet = true;
        }
        if (value.length === 0) {
          updated.hasTimeSet = false;
          updated.time = "";
        }
        return updated;
      })
    );
  };

  const handleTimeChange = (id: string, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, time: value } : e))
    );
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, emptyEntry()]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      return next.length === 0 ? [emptyEntry()] : next;
    });
  };

  const clearAll = () => {
    setEntries([emptyEntry()]);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "업무일지가 초기화되었습니다." });
  };

  const openAiModal = async (entry: WorkEntry) => {
    if (!entry.content.trim()) {
      toast({ title: "내용을 먼저 입력해주세요.", variant: "destructive" });
      return;
    }
    setAiModal({
      open: true,
      entryId: entry.id,
      original: entry.content,
      suggestion: "",
      loading: true,
    });
    await fetchSuggestion(entry.id, entry.content);
  };

  const fetchSuggestion = async (entryId: string, original: string) => {
    try {
      const res = await fetch("/api/worklog/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: original }),
      });
      const data = await res.json();
      setAiModal((prev) => ({
        ...prev,
        suggestion: data.refined ?? "정리에 실패했습니다.",
        loading: false,
      }));
    } catch {
      setAiModal((prev) => ({
        ...prev,
        suggestion: "서버 오류가 발생했습니다.",
        loading: false,
      }));
    }
  };

  const handleApprove = () => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === aiModal.entryId ? { ...e, content: aiModal.suggestion } : e
      )
    );
    setAiModal((prev) => ({ ...prev, open: false }));
    toast({ title: "AI 추천 문구가 적용되었습니다." });
  };

  const handleRegenerate = async () => {
    setAiModal((prev) => ({ ...prev, loading: true, suggestion: "" }));
    await fetchSuggestion(aiModal.entryId, aiModal.original);
  };

  const handleCancel = () => {
    setAiModal((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold" data-testid="text-worklog-title">
              업무일지
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-worklog-date">
              {getTodayLabel()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            data-testid="button-clear-all"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            전체 초기화
          </Button>
        </div>

        <Tabs defaultValue="log">
          <TabsList className="mb-4">
            <TabsTrigger value="log" data-testid="tab-log">업무 기록</TabsTrigger>
            <TabsTrigger value="memo" data-testid="tab-memo">메모</TabsTrigger>
            <TabsTrigger value="secret" data-testid="tab-secret">참고 자료</TabsTrigger>
          </TabsList>

          {/* 업무 기록 탭 */}
          <TabsContent value="log">
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="w-24 px-3 py-2 text-left font-medium text-muted-foreground">
                      시간
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      업무 내용
                    </th>
                    <th className="w-28 px-3 py-2 text-center font-medium text-muted-foreground">
                      AI 정리
                    </th>
                    <th className="w-10 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className="border-b last:border-0 hover-elevate"
                      data-testid={`row-entry-${entry.id}`}
                    >
                      <td className="px-2 py-1.5 align-top">
                        <Input
                          data-testid={`input-time-${entry.id}`}
                          value={entry.time}
                          onChange={(e) => handleTimeChange(entry.id, e.target.value)}
                          placeholder="00:00"
                          className="w-20 text-center text-sm font-mono"
                        />
                      </td>
                      <td className="px-2 py-1.5 align-top">
                        <Textarea
                          data-testid={`textarea-content-${entry.id}`}
                          value={entry.content}
                          onChange={(e) => handleContentChange(entry.id, e.target.value)}
                          placeholder={`${idx + 1}번 업무 내용을 입력하세요`}
                          className="min-h-[64px] resize-none text-sm"
                        />
                      </td>
                      <td className="px-2 py-1.5 align-top text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openAiModal(entry)}
                          data-testid={`button-ai-refine-${entry.id}`}
                          className="w-full"
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1" />
                          AI 정리
                        </Button>
                      </td>
                      <td className="px-1 py-1.5 align-top text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(entry.id)}
                          data-testid={`button-remove-${entry.id}`}
                          className="text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={addEntry}
              data-testid="button-add-entry"
            >
              <Plus className="h-4 w-4 mr-1" />
              항목 추가
            </Button>
          </TabsContent>

          {/* 메모 탭 */}
          <TabsContent value="memo">
            <div className="rounded-md border">
              <Textarea
                data-testid="textarea-memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="자유롭게 메모를 입력하세요. 새로고침해도 유지됩니다."
                className="min-h-[320px] border-0 rounded-md resize-none focus-visible:ring-0 text-sm"
              />
            </div>
          </TabsContent>

          {/* 참고 자료 탭 (비밀 탭) */}
          <TabsContent value="secret">
            <div className="rounded-md border p-3 mb-3 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                아래 내용은 기본적으로 숨겨져 있습니다. 마우스로 드래그하면 내용이 보입니다.
              </p>
            </div>
            <div className="rounded-md border">
              <Textarea
                data-testid="textarea-secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="비밀 참고 자료를 입력하세요 (드래그해야 보임)"
                className="min-h-[320px] border-0 rounded-md resize-none focus-visible:ring-0 text-sm secret-textarea"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI 정리 모달 */}
      <Dialog open={aiModal.open} onOpenChange={(v) => !v && handleCancel()}>
        <DialogContent className="max-w-lg" data-testid="dialog-ai-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI 업무 내용 정리
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">원문</p>
              <div
                className="rounded-md bg-muted/50 px-3 py-2.5 text-sm text-foreground whitespace-pre-wrap border"
                data-testid="text-ai-original"
              >
                {aiModal.original}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI 추천 문구</p>
              <div
                className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2.5 text-sm min-h-[72px] whitespace-pre-wrap"
                data-testid="text-ai-suggestion"
              >
                {aiModal.loading ? (
                  <span className="text-muted-foreground animate-pulse">AI가 정리 중입니다...</span>
                ) : (
                  aiModal.suggestion
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleApprove}
              disabled={aiModal.loading || !aiModal.suggestion}
              className="flex-1"
              data-testid="button-ai-approve"
            >
              승인 (적용)
            </Button>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={aiModal.loading}
              data-testid="button-ai-regenerate"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              다시 생성
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              data-testid="button-ai-cancel"
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
