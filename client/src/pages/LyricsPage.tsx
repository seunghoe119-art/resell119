import { useState, useRef } from "react";
import { Music, Copy, Check, ChevronDown, ChevronUp, FileEdit, Save, Users, BookOpen, Image as ImageIcon, Clipboard as ClipboardPaste } from "lucide-react";
import { useLocation } from "wouter";

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <a
      href={href}
      data-testid={`link-nav-${label}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "6px 10px", borderRadius: 8, fontSize: 12,
        fontWeight: 600, textDecoration: "none",
        color: active ? "#f0f0f0" : "#8888aa",
        background: active ? "rgba(255,255,255,0.1)" : "transparent",
        border: "none", cursor: "pointer", whiteSpace: "nowrap" as const,
      }}
    >
      {icon}
      {label}
    </a>
  );
}

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
사용자가 제공한 [리믹스 기준 가사]의 파트 구조, 마디, 행별 글자 수(음절 수)를 그대로 분석하여 동일한 구조로 따라가야 합니다. 기존 가사에 어떤 파트가 몇 개 있든, 어떤 순서로 배치되어 있든, 그대로 매칭하여 개사합니다. 박자가 밀리거나 남아서 발생하는 후반부 무한 반복(뇌절)을 완벽히 차단하는 것이 핵심입니다.

구조 및 분량 제어 규칙:
- [리믹스 기준 가사]에 나타난 모든 파트 태그(Intro, Verse, Chorus, Pre-Chorus, Bridge, Outro, Hook, Drop, Interlude 등)를 그대로 동일한 순서와 개수로 유지합니다.
- 기존 가사에 Chorus가 3번 반복되면 새 가사도 Chorus를 3번 사용합니다. Bridge가 없으면 Bridge 없이 진행합니다. Verse가 1개만 있으면 1개만 사용합니다.
- 각 파트의 행 수와 음절 수를 기존 가사와 1:1로 매칭합니다.
- 감성적인 미사여구나 정보가 없는 쓸데없는 구절은 일절 배제합니다.
- 사용자가 준 정보를 마지막 파트까지 밀도 있게 꽉 채워 분배하세요.
- [Intro]: 아주 짧게 (분위기 잡는 한글 추임새나 핵심 키워드 1개만 배치)
- [Verse / Chorus / Bridge 등]: 해당 파트의 역할에 맞춰 정보 배치. Chorus는 핵심 암기 내용으로 중독성 있게 구성하되, 노래에서 유일하게 복습/반복이 허용되는 구간입니다.
- [Outro / Fade Out / End]: 기존 가사에 존재하는 경우에만 사용. 원곡 아웃트로 길이에 맞춰 남은 정보를 끝까지 서술한 뒤, 기존에 [Fade Out]이나 [End] 태그가 있었다면 동일하게 붙여 노래를 강제 종료시킵니다. (이전 가사 반복 절대 금지)

★ 핵심 지시: 기존 가사의 파트 구조를 그대로 따라가되, 코러스를 제외한 모든 파트는 '절대 반복 없음'을 원칙으로 하며, 각 파트에 새로운 정보만 매칭하여 끝까지 밀고 나가야 합니다.

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
  const [styleOpen, setStyleOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageError, setImageError] = useState("");
  const [localImageUrl, setLocalImageUrl] = useState("");
  const [localImageName, setLocalImageName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedLocalImage, setCopiedLocalImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const localImageRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    if (!studyContent.trim()) { setError("공부할 내용을 입력해주세요."); return; }
    if (!baselyrics.trim()) { setError("기준 가사를 입력해주세요."); return; }
    setError("");
    setLoading(true);
    setGeneratedLyrics("");
    try {
      const res = await fetch("/api/lyrics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyContent,
          baseLyrics: baselyrics,
          stylePrompt,
          vocal,
          tempo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `서버 오류 (HTTP ${res.status})`);
      }
      const text = data.lyrics ?? "";
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

  const generateImage = async () => {
    if (!imagePrompt.trim()) { setImageError("이미지 프롬프트를 입력해주세요."); return; }
    setImageError("");
    setImageLoading(true);
    setImageUrl("");
    try {
      const res = await fetch("/api/lyrics/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `서버 오류 (HTTP ${res.status})`);
      }
      const url = data.imageUrl ?? "";
      if (!url) throw new Error("이미지 URL을 받지 못했습니다.");
      setImageUrl(url);
    } catch (e: any) {
      setImageError(e.message ?? "이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError("이미지 파일만 업로드 가능합니다.");
      return;
    }
    setImageError("");
    setLocalImageName(file.name);
    const url = URL.createObjectURL(file);
    setLocalImageUrl(url);
    setTimeout(() => localImageRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFileSelect(file);
          break;
        }
      }
    }
  };

  const clearLocalImage = () => {
    if (localImageUrl) URL.revokeObjectURL(localImageUrl);
    setLocalImageUrl("");
    setLocalImageName("");
  };

  const copyLocalImage = async () => {
    if (!localImageUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = localImageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const W = 1080;
      const H = Math.round(W * 16 / 9);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      const imgRatio = img.width / img.height;
      const availableH = H * 0.8;
      const availableRatio = W / availableH;
      let drawW, drawH, drawX, drawY;
      if (imgRatio > availableRatio) {
        drawW = W;
        drawH = W / imgRatio;
      } else {
        drawH = availableH;
        drawW = availableH * imgRatio;
      }
      drawX = (W - drawW) / 2;
      drawY = H * 0.2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopiedLocalImage(true);
      setTimeout(() => setCopiedLocalImage(false), 1500);
    } catch {
      setImageError("복사하지 못했습니다. 이미지를 다시 시도해 보세요.");
    }
  };

  const [pastedLocalImage, setPastedLocalImage] = useState(false);
  const [savedLocalImage, setSavedLocalImage] = useState(false);

  const saveLocalImage = async () => {
    if (!localImageUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = localImageUrl;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const W = 1080;
      const H = Math.round(W * 16 / 9);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      const imgRatio = img.width / img.height;
      const availableH = H * 0.8;
      const availableRatio = W / availableH;
      let drawW, drawH, drawX, drawY;
      if (imgRatio > availableRatio) {
        drawW = W; drawH = W / imgRatio;
      } else {
        drawH = availableH; drawW = availableH * imgRatio;
      }
      drawX = (W - drawW) / 2;
      drawY = H * 0.2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      const link = document.createElement("a");
      link.download = localImageName.replace(/\.[^/.]+$/, "") + "_9x16.jpg";
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      setSavedLocalImage(true);
      setTimeout(() => setSavedLocalImage(false), 1500);
    } catch {
      setImageError("저장하지 못했습니다. 이미지를 다시 시도해 보세요.");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "clipboard-paste.png", { type });
            handleFileSelect(file);
            setPastedLocalImage(true);
            setTimeout(() => setPastedLocalImage(false), 1500);
            return;
          }
        }
      }
      setImageError("클립보드에 이미지가 없습니다.");
    } catch {
      setImageError("클립보드 접근이 차단되었습니다. 브라우저 권한을 허용해주세요.");
    }
  };

  const [location] = useLocation();

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
    imageCard: {
      background: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: "18px 16px",
      margin: "14px 16px 0",
      border: "1px solid rgba(255,255,255,0.08)",
    } as React.CSSProperties,
    imageGenerateBtn: {
      display: "block", width: "calc(100% - 32px)", margin: "10px 16px 0",
      padding: "14px 0", borderRadius: 14, fontSize: 15, fontWeight: 700,
      background: imageLoading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #06b6d4, #3b82f6)",
      color: imageLoading ? "#888" : "#fff", border: "none", cursor: imageLoading ? "not-allowed" : "pointer",
      letterSpacing: "0.03em",
    } as React.CSSProperties,
    imageContainer: {
      position: "relative" as const,
      width: "100%",
      maxWidth: 400,
      margin: "0 auto",
      aspectRatio: "9/16",
      background: "#000",
      borderRadius: 12,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties,
    imageInContainer: {
      maxWidth: "100%",
      maxHeight: "100%",
      width: "auto",
      height: "auto",
      objectFit: "contain" as const,
      display: "block",
    } as React.CSSProperties,
    dropZone: {
      width: "100%",
      borderRadius: 12,
      border: isDragging ? "2px dashed #3b82f6" : "2px dashed rgba(255,255,255,0.2)",
      background: isDragging ? "rgba(59,130,246,0.1)" : "rgba(0,0,0,0.2)",
      padding: "24px 16px",
      textAlign: "center" as const,
      cursor: "pointer",
      transition: "all 0.2s",
    } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      {/* Header + Nav */}
      <div style={{ ...S.header, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NavLink href="/" icon={<FileEdit size={14} />} label="판매글" active={location === "/"} />
          <NavLink href="/saved" icon={<Save size={14} />} label="저장" active={location === "/saved"} />
          <NavLink href="/guest" icon={<Users size={14} />} label="모집" active={location === "/guest"} />
          <NavLink href="/worklog" icon={<BookOpen size={14} />} label="업무일지" active={location === "/worklog"} />
          <NavLink href="/lyrics" icon={<Music size={14} />} label="가사생성" active={location === "/lyrics"} />
        </div>
      </div>

      {/* Hero */}
      <div style={{ margin: "0 16px 20px", padding: "20px 18px", borderRadius: 16, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <div style={S.badge}>
          <span>*</span> 수노 최적화
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
                if (!studyContent.trim()) return;
                setLoading(true);
                try {
                  const res = await fetch("/api/lyrics/preprocess", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: studyContent, mode: label }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error ?? `서버 오류 (HTTP ${res.status})`);
                  setStudyContent(data.result ?? studyContent);
                } catch (e: any) {
                  setError(e.message ?? "전처리 중 오류가 발생했습니다.");
                } finally {
                  setLoading(false);
                }
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

      {/* Local Image 9:16 Converter (NO API) */}
      <div ref={localImageRef} style={S.imageCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg, #10b981,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
            <ImageIcon size={14} />
          </div>
          <p style={S.label}>9:16 이미지 변환 (NO API)</p>
        </div>
        <p style={{ ...S.sublabel, marginBottom: 10 }}>
          파일을 드래그, 클릭 선택, 또는 클립보드 붙여넣기(Ctrl+V)로 가져옵니다
        </p>

        <button
          onClick={pasteFromClipboard}
          style={{ ...S.imageGenerateBtn, marginBottom: 10, fontSize: 12, background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", minHeight: "32px" }}
        >
          {pastedLocalImage ? <><Check size={14} style={{ marginRight: 6 }} />붙여넣기 완료</> : <><ClipboardPaste size={14} style={{ marginRight: 6 }} />클립보드에서 붙여넣기</>}
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        <div
          style={S.dropZone}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
          tabIndex={0}
        >
          <ImageIcon size={28} color={isDragging ? "#3b82f6" : "#6666aa"} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: isDragging ? "#3b82f6" : "#8888aa", marginBottom: 4 }}>
            {isDragging ? "여기에 놓으세요" : "이미지를 드래그하거나 클릭하여 선택"}
          </p>
          <p style={{ fontSize: 11, color: "#6666aa" }}>
            Ctrl+V 로 클립보드 이미지도 붙여넣기 가능
          </p>
        </div>

        {localImageUrl && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#8888aa" }}>{localImageName}</span>
              <button
                onClick={clearLocalImage}
                style={{ fontSize: 11, color: "#fca5a5", background: "none", border: "none", cursor: "pointer" }}
              >
                지우기
              </button>
            </div>
            <div style={{ ...S.imageContainer, position: "relative" }}>
              <img
                data-testid="img-local-converted"
                src={localImageUrl}
                alt="변환된 이미지"
                style={{
                  position: "absolute",
                  top: "20%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  maxWidth: "100%",
                  maxHeight: "80%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8, flexWrap: "wrap" as const }}>
              <button
                onClick={copyLocalImage}
                style={{ fontSize: 11, color: "#a78bfa", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                {copiedLocalImage ? <Check size={12} /> : <Copy size={12} />}
                {copiedLocalImage ? "복사됨" : "9:16 복사"}
              </button>
              <button
                onClick={saveLocalImage}
                style={{ fontSize: 11, color: "#10b981", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                {savedLocalImage ? <Check size={12} /> : <Save size={12} />}
                {savedLocalImage ? "저장 완료" : "JPG 저장"}
              </button>
              <span style={{ fontSize: 11, color: "#6666aa" }}>
                검은색 레터박스가 적용된 9:16 비율입니다
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Image Generation */}
      <div style={S.imageCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg, #06b6d4,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
            <ImageIcon size={14} />
          </div>
          <p style={S.label}>9:16 이미지 생성 (AI)</p>
        </div>
        <p style={{ ...S.sublabel, marginBottom: 10 }}>정사각형이나 와이드 이미지를 넣어도 위아래 레터박스로 9:16으로 보여줍니다</p>
        <textarea
          data-testid="textarea-image-prompt"
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="이미지 생성 프롬프트를 입력하세요 (예: 소방관이 화재 현장에서 구조하는 영웅적인 모습, 어두운 배경에 주황빛 불꽃, 사실적인 스타일)"
          style={{ ...S.textarea, minHeight: 60 }}
        />
        {imageError && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13, color: "#fca5a5" }}>
            {imageError}
          </div>
        )}
        <button
          data-testid="button-generate-image"
          onClick={generateImage}
          disabled={imageLoading}
          style={S.imageGenerateBtn}
        >
          {imageLoading ? "이미지 생성 중..." : "9:16 이미지 생성하기"}
        </button>

        {imageUrl && (
          <div style={{ marginTop: 14 }}>
            <div style={S.imageContainer}>
              <img
                data-testid="img-generated"
                src={imageUrl}
                alt="생성된 이미지"
                style={S.imageInContainer}
              />
            </div>
            <p style={{ fontSize: 11, color: "#6666aa", textAlign: "center", marginTop: 8 }}>
              검은색 레터박스가 적용된 9:16 비율입니다
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
