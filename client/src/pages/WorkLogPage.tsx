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

  useEffect(() => { persist(entries); }, [entries, persist]);
  useEffect(() => { localStorage.setItem(MEMO_KEY, memo); }, [memo]);
  useEffect(() => { localStorage.setItem(SECRET_KEY, secret); }, [secret]);

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

  const addEntry = () => setEntries((prev) => [...prev, emptyEntry()]);

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
    setAiModal({ open: true, entryId: entry.id, original: entry.content, suggestion: "", loading: true });
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
      setAiModal((prev) => ({ ...prev, suggestion: data.refined ?? "정리에 실패했습니다.", loading: false }));
    } catch {
      setAiModal((prev) => ({ ...prev, suggestion: "서버 오류가 발생했습니다.", loading: false }));
    }
  };

  const handleApprove = () => {
    setEntries((prev) =>
      prev.map((e) => (e.id === aiModal.entryId ? { ...e, content: aiModal.suggestion } : e))
    );
    setAiModal((prev) => ({ ...prev, open: false }));
    toast({ title: "AI 추천 문구가 적용되었습니다." });
  };

  const handleRegenerate = async () => {
    setAiModal((prev) => ({ ...prev, loading: true, suggestion: "" }));
    await fetchSuggestion(aiModal.entryId, aiModal.original);
  };

  const handleCancel = () => setAiModal((prev) => ({ ...prev, open: false }));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f4", color: "#1a1a1a" }}>
      <Navigation />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }} data-testid="text-worklog-title">
              업무일지
            </h1>
            <p style={{ fontSize: 13, color: "#888", marginTop: 4 }} data-testid="text-worklog-date">
              {getTodayLabel()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            data-testid="button-clear-all"
            style={{ fontSize: 13, color: "#888", borderColor: "#ddd", backgroundColor: "#fff" }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            전체 초기화
          </Button>
        </div>

        <Tabs defaultValue="log">
          <TabsList style={{ backgroundColor: "#ede9e3", borderRadius: 8, padding: "3px 4px", marginBottom: 20 }}>
            <TabsTrigger value="log" data-testid="tab-log" style={{ fontSize: 13 }}>업무 기록</TabsTrigger>
            <TabsTrigger value="memo" data-testid="tab-memo" style={{ fontSize: 13 }}>메모</TabsTrigger>
            <TabsTrigger value="secret" data-testid="tab-secret" style={{ fontSize: 13 }}>참고 자료</TabsTrigger>
          </TabsList>

          {/* 업무 기록 탭 */}
          <TabsContent value="log">
            <div style={{ backgroundColor: "#fff", borderRadius: 10, border: "1px solid #e5e2dc", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0ede8", borderBottom: "1px solid #e5e2dc" }}>
                    <th style={{ width: 90, padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 12 }}>
                      작성시간
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 12 }}>
                      업무 내용
                    </th>
                    <th style={{ width: 90, padding: "10px 12px", textAlign: "center", fontWeight: 600, color: "#666", fontSize: 12 }}>
                      AI 정리
                    </th>
                    <th style={{ width: 40, padding: "10px 8px" }} />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      style={{ borderBottom: "1px solid #f0ede8" }}
                      data-testid={`row-entry-${entry.id}`}
                    >
                      <td style={{ padding: "8px 10px", verticalAlign: "top" }}>
                        <Input
                          data-testid={`input-time-${entry.id}`}
                          value={entry.time}
                          onChange={(e) => handleTimeChange(entry.id, e.target.value)}
                          placeholder="00:00"
                          style={{
                            width: 72,
                            textAlign: "center",
                            fontSize: 13,
                            fontFamily: "monospace",
                            backgroundColor: "#f5f3ef",
                            border: "1px solid #e0ddd8",
                            borderRadius: 6,
                            color: "#333",
                          }}
                        />
                      </td>
                      <td style={{ padding: "8px 10px", verticalAlign: "top" }}>
                        <Textarea
                          data-testid={`textarea-content-${entry.id}`}
                          value={entry.content}
                          onChange={(e) => handleContentChange(entry.id, e.target.value)}
                          placeholder={`${idx + 1}번 업무 내용을 입력하세요`}
                          style={{
                            minHeight: 64,
                            resize: "none",
                            fontSize: 13,
                            backgroundColor: "#f5f3ef",
                            border: "1px solid #e0ddd8",
                            borderRadius: 6,
                            color: "#1a1a1a",
                            lineHeight: 1.6,
                          }}
                          className="focus-visible:ring-1"
                        />
                      </td>
                      <td style={{ padding: "8px 10px", verticalAlign: "top", textAlign: "center" }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openAiModal(entry)}
                          data-testid={`button-ai-refine-${entry.id}`}
                          style={{
                            width: "100%",
                            fontSize: 12,
                            backgroundColor: "#fff",
                            borderColor: "#d4d0ca",
                            color: "#555",
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI 정리
                        </Button>
                      </td>
                      <td style={{ padding: "8px 6px", verticalAlign: "top", textAlign: "center" }}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(entry.id)}
                          data-testid={`button-remove-${entry.id}`}
                          style={{ color: "#bbb" }}
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
              onClick={addEntry}
              data-testid="button-add-entry"
              style={{
                marginTop: 12,
                width: "100%",
                fontSize: 13,
                backgroundColor: "#fff",
                borderColor: "#ddd",
                color: "#666",
                borderStyle: "dashed",
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              항목 추가
            </Button>
          </TabsContent>

          {/* 메모 탭 */}
          <TabsContent value="memo">
            <div style={{ backgroundColor: "#fff", borderRadius: 10, border: "1px solid #e5e2dc", overflow: "hidden" }}>
              <Textarea
                data-testid="textarea-memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="자유롭게 메모를 입력하세요. 새로고침해도 유지됩니다."
                style={{
                  minHeight: 340,
                  resize: "none",
                  fontSize: 13,
                  border: "none",
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  color: "#1a1a1a",
                  lineHeight: 1.7,
                  padding: "16px",
                }}
                className="focus-visible:ring-0"
              />
            </div>
          </TabsContent>

          {/* 참고 자료 탭 (비밀 탭) */}
          <TabsContent value="secret">
            <div style={{
              backgroundColor: "#fef9f0",
              border: "1px solid #e8e0d0",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 12,
              fontSize: 12,
              color: "#999",
            }}>
              아래 내용은 기본적으로 숨겨져 있습니다. 마우스로 드래그하면 내용이 보입니다.
            </div>
            <div style={{ backgroundColor: "#fff", borderRadius: 10, border: "1px solid #e5e2dc", overflow: "hidden" }}>
              <Textarea
                data-testid="textarea-secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="비밀 참고 자료를 입력하세요 (드래그해야 보임)"
                style={{
                  minHeight: 340,
                  resize: "none",
                  fontSize: 13,
                  border: "none",
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  lineHeight: 1.7,
                  padding: "16px",
                }}
                className="focus-visible:ring-0 secret-textarea"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI 정리 모달 */}
      <Dialog open={aiModal.open} onOpenChange={(v) => !v && handleCancel()}>
        <DialogContent className="max-w-lg" data-testid="dialog-ai-modal">
          <DialogHeader>
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
              <Sparkles className="h-4 w-4" style={{ color: "#e67e22" }} />
              AI 업무 내용 정리
            </DialogTitle>
          </DialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>원문</p>
              <div
                style={{
                  backgroundColor: "#f5f3ef",
                  border: "1px solid #e5e2dc",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#333",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
                data-testid="text-ai-original"
              >
                {aiModal.original}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>AI 추천 문구</p>
              <div
                style={{
                  backgroundColor: "#fef9f0",
                  border: "1px solid #e8d8b8",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  minHeight: 72,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  color: "#333",
                }}
                data-testid="text-ai-suggestion"
              >
                {aiModal.loading ? (
                  <span style={{ color: "#bbb" }}>AI가 정리 중입니다...</span>
                ) : (
                  aiModal.suggestion
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
            <Button
              onClick={handleApprove}
              disabled={aiModal.loading || !aiModal.suggestion}
              style={{ flex: 1 }}
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
              style={{ color: "#888" }}
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
