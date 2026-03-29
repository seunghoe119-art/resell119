import { useState, useEffect, useRef, useCallback } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Trash2, Sparkles, RefreshCw, ChevronLeft, ChevronRight, Calendar, FileText, BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ─── */
interface WorkEntry {
  id: string;
  time: string;
  content: string;
  aiResult: string;
  note: string;
  hasTimeSet: boolean;
}

interface DayData {
  entries: WorkEntry[];
  tomorrowPlan: string;
  freeMemo: string;
  author: string;
  department: string;
}

interface AiModalState {
  open: boolean;
  entryId: string;
  original: string;
  suggestion: string;
  loading: boolean;
}

/* ─── Helpers ─── */
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function dateToKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(date: Date) {
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return { dateStr: `${y}-${m}-${d}`, dayStr: days[date.getDay()] };
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function emptyEntry(): WorkEntry {
  return { id: generateId(), time: "", content: "", aiResult: "", note: "", hasTimeSet: false };
}

function emptyDayData(author = "", department = ""): DayData {
  return { entries: [emptyEntry()], tomorrowPlan: "", freeMemo: "", author, department };
}

const STORE = "worklog_v2";
const PROFILE_KEY = "worklog_profile";

function loadAll(): Record<string, DayData> {
  try { return JSON.parse(localStorage.getItem(STORE) ?? "{}"); } catch { return {}; }
}

function saveAll(data: Record<string, DayData>) {
  localStorage.setItem(STORE, JSON.stringify(data));
}

/* ─── Component ─── */
export default function WorkLogPage() {
  const [tab, setTab] = useState<"log" | "ref">("log");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allData, setAllData] = useState<Record<string, DayData>>(loadAll);
  const [profile, setProfile] = useState<{ author: string; department: string }>(() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "{}"); } catch { return { author: "", department: "" }; }
  });
  const [aiModal, setAiModal] = useState<AiModalState>({
    open: false, entryId: "", original: "", suggestion: "", loading: false,
  });
  const [secretText, setSecretText] = useState(() => localStorage.getItem("worklog_secret") ?? "");

  const { toast } = useToast();
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const key = dateToKey(currentDate);
  const dayData: DayData = allData[key] ?? emptyDayData(profile.author, profile.department);

  const updateDay = useCallback((updater: (prev: DayData) => DayData) => {
    setAllData((prev) => {
      const existing = prev[key] ?? emptyDayData(profile.author, profile.department);
      const next = { ...prev, [key]: updater(existing) };
      if (saveRef.current) clearTimeout(saveRef.current);
      saveRef.current = setTimeout(() => saveAll(next), 300);
      return next;
    });
  }, [key, profile]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("worklog_secret", secretText);
  }, [secretText]);

  /* Entry handlers */
  const handleContentChange = (id: string, value: string) => {
    updateDay((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, content: value };
        if (!e.hasTimeSet && value.length > 0) { updated.time = getCurrentTime(); updated.hasTimeSet = true; }
        if (value.length === 0) { updated.hasTimeSet = false; updated.time = ""; }
        return updated;
      }),
    }));
  };

  const handleTimeChange = (id: string, value: string) =>
    updateDay((prev) => ({ ...prev, entries: prev.entries.map((e) => e.id === id ? { ...e, time: value } : e) }));

  const handleNoteChange = (id: string, value: string) =>
    updateDay((prev) => ({ ...prev, entries: prev.entries.map((e) => e.id === id ? { ...e, note: value } : e) }));

  const addEntry = () =>
    updateDay((prev) => ({ ...prev, entries: [...prev.entries, emptyEntry()] }));

  const removeEntry = (id: string) =>
    updateDay((prev) => {
      const next = prev.entries.filter((e) => e.id !== id);
      return { ...prev, entries: next.length === 0 ? [emptyEntry()] : next };
    });

  /* AI */
  const openAiModal = async (entry: WorkEntry) => {
    if (!entry.content.trim()) { toast({ title: "내용을 먼저 입력해주세요.", variant: "destructive" }); return; }
    setAiModal({ open: true, entryId: entry.id, original: entry.content, suggestion: "", loading: true });
    await fetchSuggestion(entry.id, entry.content);
  };

  const fetchSuggestion = async (entryId: string, original: string) => {
    try {
      const res = await fetch("/api/worklog/refine", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: original }),
      });
      const data = await res.json();
      setAiModal((prev) => ({ ...prev, suggestion: data.refined ?? "정리에 실패했습니다.", loading: false }));
    } catch {
      setAiModal((prev) => ({ ...prev, suggestion: "서버 오류가 발생했습니다.", loading: false }));
    }
  };

  const handleApprove = () => {
    updateDay((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === aiModal.entryId ? { ...e, content: aiModal.suggestion, aiResult: aiModal.suggestion } : e
      ),
    }));
    setAiModal((prev) => ({ ...prev, open: false }));
    toast({ title: "AI 추천 문구가 적용되었습니다." });
  };

  const handleRegenerate = async () => {
    setAiModal((prev) => ({ ...prev, loading: true, suggestion: "" }));
    await fetchSuggestion(aiModal.entryId, aiModal.original);
  };

  const handleCancel = () => setAiModal((prev) => ({ ...prev, open: false }));

  /* Date pages for pagination */
  const allKeys = Object.keys(allData).sort().reverse();
  const pageKeys = allKeys.length > 0 ? allKeys : [key];
  const currentPageIdx = pageKeys.indexOf(key);

  const { dateStr, dayStr } = formatDateLabel(currentDate);

  const S = {
    page: { minHeight: "100vh", backgroundColor: "#f4f6f9", color: "#1a1a1a" } as React.CSSProperties,
    container: { maxWidth: 1000, margin: "0 auto", padding: "24px 16px" } as React.CSSProperties,
    card: { backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e8eaed", marginBottom: 16 } as React.CSSProperties,
    cardPad: { padding: "20px 24px" } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <Navigation />
      <div style={S.container}>

        {/* Top Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e8eaed", marginBottom: 24 }}>
          {(["log", "ref"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "12px 20px", fontSize: 14, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? "#2563eb" : "#666",
                borderBottom: tab === t ? "2px solid #2563eb" : "2px solid transparent",
                marginBottom: -2, background: "none", border: "none",
                borderBottomStyle: "solid", borderBottomWidth: 2,
                borderBottomColor: tab === t ? "#2563eb" : "transparent",
                cursor: "pointer", transition: "color .15s",
              }}
            >
              {t === "log" ? <FileText size={15} /> : <BookOpen size={15} />}
              {t === "log" ? "업무 일지" : "참고 문헌"}
            </button>
          ))}
        </div>

        {tab === "log" && (
          <>
            {/* Date + Profile Card */}
            <div style={{ ...S.card, ...S.cardPad, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -1))} data-testid="button-prev-day">
                  <ChevronLeft size={16} />
                </Button>
                <Calendar size={16} style={{ color: "#2563eb" }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>{dateStr}</span>
                <span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>({dayStr})</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))} data-testid="button-next-day">
                  <ChevronRight size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  style={{ fontSize: 12, color: "#888", marginLeft: 4 }}
                  data-testid="button-today"
                >
                  오늘
                </Button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#888" }}>작성자:</span>
                  <Input
                    value={dayData.author || profile.author}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, author: e.target.value }));
                      updateDay((d) => ({ ...d, author: e.target.value }));
                    }}
                    placeholder="이름"
                    data-testid="input-author"
                    style={{ width: 80, fontSize: 13, border: "none", borderBottom: "1px solid #ddd", borderRadius: 0, padding: "2px 4px", height: 28, backgroundColor: "transparent" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#888" }}>소속:</span>
                  <Input
                    value={dayData.department || profile.department}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, department: e.target.value }));
                      updateDay((d) => ({ ...d, department: e.target.value }));
                    }}
                    placeholder="팀/부서"
                    data-testid="input-department"
                    style={{ width: 100, fontSize: 13, border: "none", borderBottom: "1px solid #ddd", borderRadius: 0, padding: "2px 4px", height: 28, backgroundColor: "transparent" }}
                  />
                </div>
              </div>
            </div>

            {/* Work Entries Card */}
            <div style={S.card}>
              <div style={{ padding: "16px 24px 0" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>업무 기록</h2>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 16 }}>
                  <thead>
                    <tr style={{ borderTop: "1px solid #f0f2f5", borderBottom: "1px solid #f0f2f5", backgroundColor: "#fafafa" }}>
                      <th style={{ width: 80, padding: "10px 20px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 12 }}>기록 시각</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 12 }}>업무 상세 내용</th>
                      <th style={{ width: 160, padding: "10px 12px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 12 }}>AI 최적화</th>
                      <th style={{ width: 120, padding: "10px 12px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 12 }}>비고</th>
                      <th style={{ width: 90, padding: "10px 20px 10px 12px", textAlign: "center", fontWeight: 500, color: "#888", fontSize: 12 }}>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayData.entries.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        style={{ borderBottom: "1px solid #f0f2f5" }}
                        data-testid={`row-entry-${entry.id}`}
                      >
                        <td style={{ padding: "12px 20px", verticalAlign: "middle" }}>
                          <Input
                            data-testid={`input-time-${entry.id}`}
                            value={entry.time}
                            onChange={(e) => handleTimeChange(entry.id, e.target.value)}
                            placeholder="00:00"
                            style={{
                              width: 60, textAlign: "center", fontSize: 14, fontWeight: 600,
                              fontFamily: "monospace", color: "#2563eb",
                              border: "none", borderRadius: 0, padding: "0", height: 28,
                              backgroundColor: "transparent",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px", verticalAlign: "middle" }}>
                          <Input
                            data-testid={`input-content-${entry.id}`}
                            value={entry.content}
                            onChange={(e) => handleContentChange(entry.id, e.target.value)}
                            placeholder={`${idx + 1}번 업무 내용을 입력하세요`}
                            style={{
                              width: "100%", fontSize: 13, fontWeight: 500,
                              border: "none", borderRadius: 0, padding: "0", height: 28,
                              backgroundColor: "transparent",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px", verticalAlign: "middle" }}>
                          <span style={{ fontSize: 12, color: entry.aiResult ? "#1a1a1a" : "#bbb", fontStyle: entry.aiResult ? "normal" : "italic" }}>
                            {entry.aiResult || "AI 정리 대기 중..."}
                          </span>
                        </td>
                        <td style={{ padding: "12px", verticalAlign: "middle" }}>
                          <Input
                            data-testid={`input-note-${entry.id}`}
                            value={entry.note}
                            onChange={(e) => handleNoteChange(entry.id, e.target.value)}
                            placeholder="비고"
                            style={{
                              width: "100%", fontSize: 13,
                              border: "none", borderRadius: 0, padding: "0", height: 28,
                              backgroundColor: "transparent", color: "#555",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px 20px 12px 12px", verticalAlign: "middle", textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openAiModal(entry)}
                              data-testid={`button-ai-refine-${entry.id}`}
                              style={{ fontSize: 12, padding: "0 10px", height: 30, borderColor: "#e0e0e0" }}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI 정리
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEntry(entry.id)}
                              data-testid={`button-remove-${entry.id}`}
                              style={{ color: "#ccc", width: 28, height: 28 }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "12px 24px 20px" }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addEntry}
                  data-testid="button-add-entry"
                  style={{ fontSize: 13, color: "#888", border: "1px dashed #ddd", width: "100%", height: 36, borderRadius: 8 }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  항목 추가
                </Button>
              </div>
            </div>

            {/* Tomorrow Plan + Free Memo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={S.card}>
                <div style={{ ...S.cardPad, paddingBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>내일 업무 계획</h3>
                  <Textarea
                    data-testid="textarea-tomorrow"
                    value={dayData.tomorrowPlan}
                    onChange={(e) => updateDay((d) => ({ ...d, tomorrowPlan: e.target.value }))}
                    placeholder="내일 예정된 업무를 작성하세요..."
                    style={{
                      minHeight: 140, resize: "none", fontSize: 13,
                      border: "1px solid #f0f2f5", borderRadius: 8,
                      backgroundColor: "#f8fafc", color: "#1a1a1a", lineHeight: 1.7,
                    }}
                    className="focus-visible:ring-1"
                  />
                </div>
              </div>
              <div style={S.card}>
                <div style={{ ...S.cardPad, paddingBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>자유 메모</h3>
                  <Textarea
                    data-testid="textarea-memo"
                    value={dayData.freeMemo}
                    onChange={(e) => updateDay((d) => ({ ...d, freeMemo: e.target.value }))}
                    placeholder="기타 메모 사항을 작성하세요..."
                    style={{
                      minHeight: 140, resize: "none", fontSize: 13,
                      border: "1px solid #f0f2f5", borderRadius: 8,
                      backgroundColor: "#f8fafc", color: "#1a1a1a", lineHeight: 1.7,
                    }}
                    className="focus-visible:ring-1"
                  />
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div style={{ ...S.card, ...S.cardPad, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {pageKeys.slice(0, 5).map((k, i) => (
                  <button
                    key={k}
                    onClick={() => { const [y, m, d] = k.split("-").map(Number); setCurrentDate(new Date(y, m - 1, d)); }}
                    data-testid={`button-page-${i + 1}`}
                    style={{
                      width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 500,
                      backgroundColor: k === key ? "#1e3a5f" : "#f4f6f9",
                      color: k === key ? "#fff" : "#555",
                      border: "none", cursor: "pointer",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                {pageKeys.length > 5 && (
                  <span style={{ color: "#888", fontSize: 14 }}>...</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Input
                  type="date"
                  data-testid="input-date-search"
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split("-").map(Number);
                      setCurrentDate(new Date(y, m - 1, d));
                    }
                  }}
                  style={{ fontSize: 13, height: 34, width: 150, borderColor: "#e0e0e0" }}
                />
                <Button variant="outline" size="sm" style={{ fontSize: 13, height: 34 }} data-testid="button-date-search">
                  날짜로 검색
                </Button>
              </div>
            </div>
          </>
        )}

        {tab === "ref" && (
          <div style={S.card}>
            <div style={{ ...S.cardPad }}>
              <div style={{
                backgroundColor: "#fef9f0", border: "1px solid #e8e0d0",
                borderRadius: 8, padding: "10px 14px", marginBottom: 12,
                fontSize: 12, color: "#999",
              }}>
                아래 내용은 기본적으로 숨겨져 있습니다. 마우스로 드래그하면 내용이 보입니다.
              </div>
              <Textarea
                data-testid="textarea-secret"
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                placeholder="비밀 참고 자료를 입력하세요 (드래그해야 보임)"
                style={{
                  minHeight: 400, resize: "none", fontSize: 13,
                  border: "1px solid #f0f2f5", borderRadius: 8,
                  backgroundColor: "#f8fafc", lineHeight: 1.7,
                }}
                className="focus-visible:ring-0 secret-textarea"
              />
            </div>
          </div>
        )}
      </div>

      {/* AI Modal */}
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
              <div style={{ backgroundColor: "#f5f3ef", border: "1px solid #e5e2dc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#333", whiteSpace: "pre-wrap", lineHeight: 1.6 }} data-testid="text-ai-original">
                {aiModal.original}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>AI 추천 문구</p>
              <div style={{ backgroundColor: "#fef9f0", border: "1px solid #e8d8b8", borderRadius: 8, padding: "10px 14px", fontSize: 13, minHeight: 72, whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#333" }} data-testid="text-ai-suggestion">
                {aiModal.loading ? <span style={{ color: "#bbb" }}>AI가 정리 중입니다...</span> : aiModal.suggestion}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
            <Button onClick={handleApprove} disabled={aiModal.loading || !aiModal.suggestion} style={{ flex: 1 }} data-testid="button-ai-approve">
              승인 (적용)
            </Button>
            <Button variant="outline" onClick={handleRegenerate} disabled={aiModal.loading} data-testid="button-ai-regenerate">
              <RefreshCw className="h-4 w-4 mr-1" />다시 생성
            </Button>
            <Button variant="ghost" onClick={handleCancel} style={{ color: "#888" }} data-testid="button-ai-cancel">취소</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
