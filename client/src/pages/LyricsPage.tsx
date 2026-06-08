import { useState, useRef } from "react";
import { Music, Copy, Check, Settings, ChevronDown, ChevronUp } from "lucide-react";

const LS_API_KEY = "lyrics_openai_api_key";

const DEFAULT_STYLE = "Shiny K-pop/R&B crossover for female vocals, clean sidechained synths and soft plucky guitar, midtempo bounce, Verses ride a tight groove with close-mic vocal and subtle vocoder doubles; chorus lifts with wide pads, bright top-line, and stacked hooks, Bridge strips to bass, snaps, and airy reverb before a final high-energy chorus with ad-libs and a tasteful guitar lick outro.";
const DEFAULT_VOCAL = "여성 보컬";
const DEFAULT_TEMPO = "미드템포 바운스";

const SYSTEM_PROMPT = `당신은 작곡 AI인 'Suno AI'를 위한 교육용 가사를 전문적으로 만드는 스타 작사가입니다. 사용자가 제공한 [공부할 내용]과 [리믹스 기준 가사]를 바탕으로, 원곡의 리듬감을 100% 살리면서도 암기가 잘 되는 트렌디한 리믹스 가사를 생성해야 합니다.

반드시 아래의 3가지 절대 규칙을 철저하게 지켜주세요.

### 1. 언어 변환 규칙 (가장 중요)
Suno AI가 자연스러운 한국어 발음으로 노래해야 하므로, 출력되는 모든 텍스트는 오직 '한글'로만 작성해야 합니다. 영문 표기, 기호, 괄호 병기는 절대 금지합니다.
- 영어 알파벳 금지: 영어가 나오면 무조건 한국식 독음으로 적으세요. (예: DNA -> 디엔에이 / NFPC -> 엔에프피씨)
- 숫자 및 기호 변환: 문맥에 맞게 읽는 법으로 풀어 쓰세요. (예: 100m -> 백미터 / + -> 플러스, 더하기 / = -> 는, 이콜)

### 2. 리믹스 매칭 및 가사 구조화 (Suno AI 최적화)
사용자가 제공한 [리믹스 기준 가사]의 구조, 마디, 행별 글자 수(음절 수)를 다음 외워야할 소방시험 외울 정보와 최대한 1:1로 매칭하여 개사해야 합니다. 박자가 밀리거나 남아서 발생하는 후반부 무한 반복(뇌절)을 완벽히 차단하는 것이 핵심입니다.

구조 및 분량 제어 규칙:
- 감성적인 미사여구나 정보가 없는 쓸데없는 구절은 일절 배제합니다.
- 사용자가 준 정보를 [Outro] 끝까지 밀도 있게 꽉 채워 분배하세요.
- [Intro]: 아주 짧게 (1~2줄 내외, 분위기 잡는 한글 추임새나 핵심 키워드 1개만 배치)
- [Verse 1]: 개념 설명 1 (원곡 브레이크/벌스 비트에 맞춰 정보 배치)
- [Pre-Chorus]: 코러스로 가기 위한 빌드업 (박자 매칭 필수)
- [Chorus]: 핵심 암기 내용. (가장 중독성 있게 구성하되, 노래에서 유일하게 복습/반복이 허용되는 구간)
- [Verse 2]: 개념 설명 2 (심화 정보 배치)
- [Bridge]: 후반부 정보 배치. (감성 문구 절대 금지, 새로운 정보 주입)
- [Outro]: 남은 정보를 끝까지 털어 넣는 구간. 원곡 아웃트로 길이에 맞춰 정보를 끝까지 서술한 뒤, 마지막 줄 다음 칸에 반드시 [Fade Out]과 [End] 태그를 붙여 노래를 강제 종료시킵니다. (이전 가사 반복 절대 금지)

★ 핵심 지시: 코러스를 제외한 모든 파트는 '절대 반복 없음'을 원칙으로 하며, 특히 Bridge와 Outro에는 새로운 정보만 매칭하여 끝까지 밀고 나가야 합니다.

### 3. 스타일 및 톤 (음악 장르 정보)
- 음악적 분위기: 감성적이면서도 그루브가 살아있는 K-Pop 스타일
- 장르 태그 키워드 (Suno Style Prompt용): 사용자가 제공한 스타일 프롬프트를 그대로 반영합니다.`;

function buildSunoPrompt(style: string, vocal: string, tempo: string) {
  return `${style}, ${vocal}, ${tempo}`;
}

export default function LyricsPage() {
  const [studyContent, setStudyContent] = useState("");
  const [baselyrics, setBaseLyrics] = useState("");
  const [stylePrompt, setStylePrompt] = useState(DEFAULT_STYLE);
  const [vocal, setVocal] = useState(DEFAULT_VOCAL);
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [copiedSuno, setCopiedSuno] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_API_KEY) ?? "");
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem(LS_API_KEY) ?? "");
  const [styleOpen, setStyleOpen] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const saveApiKey = () => {
    localStorage.setItem(LS_API_KEY, apiKeyInput);
    setApiKey(apiKeyInput);
    setApiDialogOpen(false);
  };

  const generate = async () => {
    if (!apiKey) { setApiDialogOpen(true); return; }
    if (!studyContent.trim()) { setError("공부할 내용을 입력해주세요."); return; }
    if (!baselyrics.trim()) { setError("기준 가사를 입력해주세요."); return; }
    setError("");
    setLoading(true);
    setGeneratedLyrics("");
    try {
      const userMsg = `[공부할 내용]\n${studyContent}\n\n[리믹스 기준 가사]\n${baselyrics}\n\n[스타일 프롬프트]\n${stylePrompt}\n보컬: ${vocal}, 템포: ${tempo}`;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMsg },
          ],
          temperature: 0.85,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      setGeneratedLyrics(text);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: any) {
      setError(e.message ?? "생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const copyLyrics = () => {
    navigator.clipboard.writeText(generatedLyrics);
    setCopiedLyrics(true);
    setTimeout(() => setCopiedLyrics(false), 1500);
  };

  const copySuno = () => {
    const sunoStyle = buildSunoPrompt(stylePrompt, vocal, tempo);
    const combined = `[스타일]\n${sunoStyle}\n\n[가사]\n${generatedLyrics}`;
    navigator.clipboard.writeText(combined);
    setCopiedSuno(true);
    setTimeout(() => setCopiedSuno(false), 1500);
  };

  const S = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(160deg, #12121e 0%, #1a1a2e 60%, #0f0f1a 100%)",
      color: "#f0f0f0",
      fontFamily: "'Noto Sans KR', sans-serif",
      paddingBottom: 40,
    } as React.CSSProperties,
    header: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 20px 14px",
    } as React.CSSProperties,
    card: {
      background: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: "18px 16px",
      margin: "0 16px 14px",
      border: "1px solid rgba(255,255,255,0.08)",
    } as React.CSSProperties,
    label: {
      fontSize: 16, fontWeight: 700, color: "#f0f0f0", margin: 0,
    } as React.CSSProperties,
    sublabel: {
      fontSize: 12, color: "#8888aa", marginTop: 2,
    } as React.CSSProperties,
    textarea: {
      width: "100%", boxSizing: "border-box" as const,
      background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, color: "#e0e0f0", fontSize: 13, lineHeight: 1.7,
      padding: "10px 12px", resize: "vertical" as const, outline: "none",
      fontFamily: "'Noto Sans KR', sans-serif",
    } as React.CSSProperties,
    pill: {
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#ccc", cursor: "pointer",
      whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
    generateBtn: {
      display: "block", width: "calc(100% - 32px)", margin: "8px 16px 0",
      padding: "16px 0", borderRadius: 14, fontSize: 16, fontWeight: 700,
      background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #7c3aed, #ec4899)",
      color: loading ? "#888" : "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
      letterSpacing: "0.03em",
    } as React.CSSProperties,
    badge: {
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "rgba(124,58,237,0.2)", borderRadius: 20, padding: "4px 10px",
      fontSize: 11, color: "#c084fc", border: "1px solid rgba(124,58,237,0.3)",
      marginBottom: 10,
    } as React.CSSProperties,
    copyBtn: {
      flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600,
      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
      color: "#e0e0f0", cursor: "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", gap: 6,
    } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Music size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0" }}>암기송 리믹스</div>
            <div style={{ fontSize: 11, color: "#8888aa" }}>소방시험 가사 생성기</div>
          </div>
        </div>
        <button
          data-testid="button-lyrics-api-setting"
          onClick={() => { setApiKeyInput(apiKey); setApiDialogOpen(true); }}
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10, padding: "7px 14px", color: "#ccc", fontSize: 12,
            cursor: "pointer", fontWeight: 600,
          }}
        >
          API 설정
        </button>
      </div>

      {/* Hero */}
      <div style={{ margin: "0 16px 20px", padding: "20px 18px", borderRadius: 16, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <div style={S.badge}>
          <span>✦</span> 수노 최적화
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.35, color: "#f0f0f0", marginBottom: 8 }}>
          기존 가사 리듬에 맞춰<br />새 암기 가사를 생성
        </div>
        <div style={{ fontSize: 13, color: "#9090b0", lineHeight: 1.6 }}>
          공부할 내용, 기존 가사, 스타일을 넣으면 한글 전용 리믹스 가사를 만들어 줍니다.
        </div>
      </div>

      {/* 공부할 내용 */}
      <div style={S.card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg, #3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>이</div>
            <p style={S.label}>공부할 내용</p>
          </div>
          <span style={{ fontSize: 11, color: "#6666aa" }}>외울 정보</span>
        </div>
        <p style={{ ...S.sublabel, marginBottom: 10 }}>소방시험 외울 정보</p>
        <textarea
          data-testid="textarea-study-content"
          value={studyContent}
          onChange={(e) => setStudyContent(e.target.value)}
          placeholder={"예시: 소방시설관리업 지위승계 사유는 사망, 영업 양도,\n법인 합병, 경매 환가 등이다. 승계자는 삼십일 이내 신고한다."}
          style={{ ...S.textarea, minHeight: 100 }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" as const }}>
          {["핵심만 추출", "중복 제거", "시험식 표현"].map((label) => (
            <button key={label} style={S.pill} data-testid={`button-content-${label}`}
              onClick={async () => {
                if (!apiKey) { setApiDialogOpen(true); return; }
                if (!studyContent.trim()) return;
                setLoading(true);
                try {
                  const map: Record<string, string> = {
                    "핵심만 추출": "다음 텍스트에서 암기에 꼭 필요한 핵심 정보만 추출해서 간결하게 정리해주세요. 한글로만 출력하세요.",
                    "중복 제거": "다음 텍스트에서 중복되는 내용을 제거하고 간결하게 정리해주세요. 한글로만 출력하세요.",
                    "시험식 표현": "다음 텍스트를 소방시험 답안 형식의 간결하고 명확한 표현으로 바꿔주세요. 한글로만 출력하세요.",
                  };
                  const res = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
                    body: JSON.stringify({
                      model: "gpt-4o",
                      messages: [
                        { role: "system", content: map[label] },
                        { role: "user", content: studyContent },
                      ],
                      temperature: 0.3,
                    }),
                  });
                  const data = await res.json();
                  setStudyContent(data.choices?.[0]?.message?.content ?? studyContent);
                } catch {}
                setLoading(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 기준 가사 */}
      <div style={S.card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg, #10b981,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>삼</div>
            <p style={S.label}>기준 가사</p>
          </div>
          <span style={{ fontSize: 11, color: "#6666aa" }}>리듬 매칭</span>
        </div>
        <p style={{ ...S.sublabel, marginBottom: 10 }}>기존 가사</p>
        <textarea
          data-testid="textarea-base-lyrics"
          value={baselyrics}
          onChange={(e) => setBaseLyrics(e.target.value)}
          placeholder="원곡 구조와 마디를 참고할 기존 가사를 붙여넣기"
          style={{ ...S.textarea, minHeight: 140 }}
        />
        <p style={{ fontSize: 11, color: "#6666aa", marginTop: 8 }}>행별 길이와 파트 구조를 기준으로 새 가사를 맞춥니다.</p>
      </div>

      {/* 스타일 설정 */}
      <div style={S.card}>
        <button
          onClick={() => setStyleOpen(!styleOpen)}
          style={{ width: "100%", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg, #f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>사</div>
            <p style={S.label}>스타일 설정</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#6666aa" }}>수노 스타일</span>
            {styleOpen ? <ChevronUp size={14} color="#6666aa" /> : <ChevronDown size={14} color="#6666aa" />}
          </div>
        </button>
        {styleOpen && (
          <div style={{ marginTop: 12 }}>
            <p style={{ ...S.sublabel, marginBottom: 6 }}>스타일 프롬프트</p>
            <textarea
              data-testid="textarea-style-prompt"
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              style={{ ...S.textarea, minHeight: 80 }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <div>
                <p style={{ ...S.sublabel, marginBottom: 4 }}>보컬</p>
                <input
                  data-testid="input-vocal"
                  value={vocal}
                  onChange={(e) => setVocal(e.target.value)}
                  style={{ ...S.textarea, height: 38, minHeight: "unset", resize: "none" } as React.CSSProperties}
                />
              </div>
              <div>
                <p style={{ ...S.sublabel, marginBottom: 4 }}>템포</p>
                <input
                  data-testid="input-tempo"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  style={{ ...S.textarea, height: 38, minHeight: "unset", resize: "none" } as React.CSSProperties}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: "0 16px 12px", padding: "10px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13, color: "#fca5a5" }}>
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        data-testid="button-generate-lyrics"
        onClick={generate}
        disabled={loading}
        style={S.generateBtn}
      >
        {loading ? "생성 중..." : "새 가사 생성하기"}
      </button>

      {/* Output */}
      <div ref={outputRef} style={{ ...S.card, marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: generatedLyrics ? "linear-gradient(135deg, #7c3aed,#ec4899)" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {generatedLyrics ? "완" : "•"}
            </div>
            <p style={S.label}>새로 생성된 가사</p>
          </div>
          {generatedLyrics && <span style={{ fontSize: 11, color: "#9090c0" }}>복사 가능</span>}
        </div>

        {generatedLyrics ? (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button data-testid="button-copy-lyrics" onClick={copyLyrics} style={S.copyBtn}>
                {copiedLyrics ? <Check size={14} color="#a78bfa" /> : <Copy size={14} />}
                {copiedLyrics ? "복사됨" : "가사 복사"}
              </button>
              <button data-testid="button-copy-suno" onClick={copySuno} style={S.copyBtn}>
                {copiedSuno ? <Check size={14} color="#a78bfa" /> : <Copy size={14} />}
                {copiedSuno ? "복사됨" : "수노용 복사"}
              </button>
            </div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.85, color: "#d0d0f0", background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "12px 14px" }}>
              {generatedLyrics}
            </div>
          </>
        ) : (
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "16px 14px", fontSize: 13 }}>
            <p style={{ color: "#6060a0", marginBottom: 12, fontSize: 12 }}>생성 버튼을 누르면 이곳에 새 리믹스 가사가 표시됩니다.</p>
            <p style={{ fontSize: 12, color: "#4a4a70", marginBottom: 6 }}>예상 출력 구조</p>
            {["인트로", "벌스 일", "프리코러스", "코러스", "벌스 이", "브릿지", "아웃트로", "페이드 아웃", "엔드"].map((s) => (
              <p key={s} style={{ fontSize: 12, color: "#4a4a68", margin: "2px 0" }}>{s}</p>
            ))}
          </div>
        )}
      </div>

      {/* API Dialog */}
      {apiDialogOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setApiDialogOpen(false); }}
        >
          <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "24px 20px", width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Settings size={18} color="#a78bfa" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>OpenAI API 키 설정</p>
            </div>
            <p style={{ fontSize: 12, color: "#8888aa", marginBottom: 10 }}>
              API 키는 기기에만 저장되며 서버로 전송되지 않습니다.
            </p>
            <input
              data-testid="input-api-key"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveApiKey(); }}
              placeholder="sk-..."
              style={{ ...S.textarea, resize: "none", height: 42, minHeight: "unset", marginBottom: 12, fontFamily: "monospace" } as React.CSSProperties}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setApiDialogOpen(false)} style={{ ...S.copyBtn, flex: "0 0 auto", padding: "10px 20px" }}>취소</button>
              <button
                onClick={saveApiKey}
                data-testid="button-save-api-key"
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
