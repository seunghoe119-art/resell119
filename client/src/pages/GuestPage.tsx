import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  Calendar,
  Quote,
  AlignLeft,
  AlignCenter,
  List,
  ListOrdered,
  Table,
  Code,
  Sparkles,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

export default function GuestPage() {
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAIAssist = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/guest/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content || "다음 주 금요일 저녁 7시 게스트 모집 공지를 작성해주세요.",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "AI 요청 실패");
      }

      const parsed = await response.json();
      
      if (parsed.title && parsed.content) {
        setTitle(parsed.title);
        setContent(parsed.content);
        toast({
          title: "AI 제안 완료",
          description: "제목과 내용이 자동으로 생성되었습니다.",
        });
      }
    } catch (error: any) {
      console.error("AI 생성 오류:", error);
      toast({
        title: "오류",
        description: error.message || "AI 도움을 받는 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "게시글 작성 완료",
      description: "게시글이 성공적으로 작성되었습니다.",
    });
    setTitle("");
    setContent("");
    setHashtags("");
    setCategory("");
    setTopic("");
    setSelectedPrice(null);
  };

  const handlePriceClick = (price: number) => {
    const formatPrice = (p: number) => {
      if (p >= 10000) {
        return `${p / 10000}만원`;
      }
      return `${p / 1000}천원`;
    };
    
    const oldPriceText = selectedPrice ? `게스트비 ${formatPrice(selectedPrice)}` : "";
    const newPriceText = `게스트비 ${formatPrice(price)}`;
    
    if (selectedPrice === price) {
      setSelectedPrice(null);
      setContent((prev) => prev.replace(oldPriceText, "").trim());
    } else {
      if (selectedPrice) {
        setContent((prev) => prev.replace(oldPriceText, newPriceText));
      } else {
        setContent((prev) => (prev ? prev + " " : "") + newPriceText);
      }
      setSelectedPrice(price);
    }
  };

  const handleDateClick = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateText = `오늘 날짜 ${year}년 ${month}월 ${day}일`;
    setContent((prev) => (prev ? prev + " " : "") + dateText);
  };

  const handlePhoneClick = () => {
    const phoneText = "010-6467-8743 전화번호";
    setContent((prev) => (prev ? prev + " " : "") + phoneText);
  };

  const handleCopyImage = async (imageSrc: string, imageName: string) => {
    try {
      const response = await fetch(imageSrc, { mode: 'cors' });
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      toast({
        title: "이미지 복사 완료",
        description: `${imageName}이(가) 클립보드에 복사되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "이미지 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-guest-title">카페 글쓰기</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm p-6 space-y-6 border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="수도권 게스트" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seoul">서울 게스트</SelectItem>
                  <SelectItem value="gyeonggi">경기 게스트</SelectItem>
                  <SelectItem value="incheon">인천 게스트</SelectItem>
                </SelectContent>
              </Select>

              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger data-testid="select-topic">
                  <SelectValue placeholder="경기모임" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="game">경기모임</SelectItem>
                  <SelectItem value="practice">연습모임</SelectItem>
                  <SelectItem value="event">이벤트</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                data-testid="input-title"
                type="text"
                placeholder="제목을 입력해 주세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="border rounded-md">
              <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-align-left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-align-center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-list"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-list-ordered"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid="button-table"
                >
                  <Table className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant={selectedPrice === 5000 ? "default" : "ghost"}
                  size="sm"
                  data-testid="button-price-5000"
                  title="게스트비 5천원"
                  onClick={() => handlePriceClick(5000)}
                >
                  <span className="text-xs">5천원</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedPrice === 6000 ? "default" : "ghost"}
                  size="sm"
                  data-testid="button-price-6000"
                  title="게스트비 6천원"
                  onClick={() => handlePriceClick(6000)}
                >
                  <span className="text-xs">6천원</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedPrice === 7000 ? "default" : "ghost"}
                  size="sm"
                  data-testid="button-price-7000"
                  title="게스트비 7천원"
                  onClick={() => handlePriceClick(7000)}
                >
                  <span className="text-xs">7천원</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedPrice === 8000 ? "default" : "ghost"}
                  size="sm"
                  data-testid="button-price-8000"
                  title="게스트비 8천원"
                  onClick={() => handlePriceClick(8000)}
                >
                  <span className="text-xs">8천원</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedPrice === 9000 ? "default" : "ghost"}
                  size="sm"
                  data-testid="button-price-9000"
                  title="게스트비 9천원"
                  onClick={() => handlePriceClick(9000)}
                >
                  <span className="text-xs">9천원</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedPrice === 10000 ? "default" : "ghost"}
                  size="sm"
                  data-testid="button-price-10000"
                  title="게스트비 1만원"
                  onClick={() => handlePriceClick(10000)}
                >
                  <span className="text-xs">1만원</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="button-current-date"
                  title="현재날짜"
                  onClick={handleDateClick}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-xs">현재날짜</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="button-phone"
                  title="전화번호 입력"
                  onClick={handlePhoneClick}
                >
                  <Code className="h-4 w-4 mr-1" />
                  <span className="text-xs">전화번호</span>
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleAIAssist}
                    disabled={isGenerating}
                    data-testid="button-ai-assist"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    {isGenerating ? "생성 중..." : "AI 게스트 모집글 작성하기"}
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <Textarea
                  data-testid="textarea-content"
                  placeholder="'오늘 8월 19일이야. 이번주 금요일 기준으로 모집글 작성해줘 연락처는 0100000000'
'오늘 8월 23일 토요일이야. 다음주 금요일로 만들어줘 연락처는 0100000000'
'2025년 9월 2일 기준으로 글 써줘연락처는 0100000000'
'오늘은 9월 1일, 2파전으로 작성해줘 연락처는 0100000000, 게스트비는 7천원'"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] border-0 rounded-none resize-none focus-visible:ring-0 mb-4"
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <img 
                      src="https://img.shareit.kr/tempspaceauth/img/2025-03-17/c5b7c2d1-7188-44df-be4d-b0b5aabd8c76.jpg" 
                      alt="게스트 모집 이미지 1" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyImage("https://img.shareit.kr/tempspaceauth/img/2025-03-17/c5b7c2d1-7188-44df-be4d-b0b5aabd8c76.jpg", "이미지 1")}
                      className="w-full"
                      data-testid="button-copy-image-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      이미지 복사
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <img 
                      src="https://img.shareit.kr/tempspaceauth/img/2025-03-17/eb7e52a4-0f59-4277-ae96-3de43ba4a42e.jpg" 
                      alt="게스트 모집 이미지 2" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyImage("https://img.shareit.kr/tempspaceauth/img/2025-03-17/eb7e52a4-0f59-4277-ae96-3de43ba4a42e.jpg", "이미지 2")}
                      className="w-full"
                      data-testid="button-copy-image-2"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      이미지 복사
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <img 
                      src="https://img.shareit.kr/tempspaceauth/img/2025-03-17/cac14ee2-6cb4-4892-a762-fd8e6e382b6d.jpg" 
                      alt="게스트 모집 이미지 3" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyImage("https://img.shareit.kr/tempspaceauth/img/2025-03-17/cac14ee2-6cb4-4892-a762-fd8e6e382b6d.jpg", "이미지 3")}
                      className="w-full"
                      data-testid="button-copy-image-3"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      이미지 복사
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <img 
                      src="https://img.shareit.kr/tempspaceauth/img/2025-03-17/254924ce-c217-4566-91a1-588d93e5eb47.jpg" 
                      alt="게스트 모집 이미지 4" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyImage("https://img.shareit.kr/tempspaceauth/img/2025-03-17/254924ce-c217-4566-91a1-588d93e5eb47.jpg", "이미지 4")}
                      className="w-full"
                      data-testid="button-copy-image-4"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      이미지 복사
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <img 
                      src="/park1.png" 
                      alt="주차장 이미지" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyImage("/park1.png", "주차장 이미지")}
                      className="w-full"
                      data-testid="button-copy-image-5"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      이미지 복사
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <img 
                      src="/shower1.png" 
                      alt="샤워실 이미지" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyImage("/shower1.png", "샤워실 이미지")}
                      className="w-full"
                      data-testid="button-copy-image-6"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      이미지 복사
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <img 
                      src="/ball1.png" 
                      alt="농구공 이미지" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyImage("/ball1.png", "농구공 이미지")}
                      className="w-full"
                      data-testid="button-copy-image-7"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      이미지 복사
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Input
                data-testid="input-hashtags"
                type="text"
                placeholder="#해시태그"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              data-testid="button-submit"
            >
              등록
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
