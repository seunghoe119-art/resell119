import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatAdditionalInfo } from "@/lib/formatAdditionalInfo";
import { parseKoreanPrice } from "@/lib/parseKoreanPrice";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FormData {
  productName: string;
  brand: string;
  purchaseDate: string;
  usageCount: number;
  condition: string;
  conditionNote: string;
  baseItems: string[];
  extraItems: string[];
  features: string[];
  purchasePrice: number;
  askingPrice: number;
  tradeTypes: string[];
  tradeArea: string;
  nego: string;
}

interface PreviewPaneProps {
  formData: FormData;
  aiDraft: string;
  mergedContent: string;
  onSave: () => void;
  onReset: () => void;
  onMerge: () => void;
  isSaving?: boolean;
  isMerging?: boolean;
}

export default function PreviewPane({
  formData,
  aiDraft,
  mergedContent,
  onSave,
  onReset,
  onMerge,
  isSaving,
  isMerging
}: PreviewPaneProps) {
  const { toast } = useToast();
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [editableAiDraft, setEditableAiDraft] = useState("");
  const [editableAdditionalInfo, setEditableAdditionalInfo] = useState("");
  const [editableMergedContent, setEditableMergedContent] = useState("");

  const additionalInfoPreview = formatAdditionalInfo(formData);

  const generateTitlesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/generate-titles", {
        productName: formData.productName,
        brand: formData.brand,
        condition: formData.condition,
        features: formData.features,
        aiDraft: aiDraft,
      });
    },
    onSuccess: (data: any) => {
      if (data.titles && Array.isArray(data.titles)) {
        setGeneratedTitles(data.titles);
      }
    },
    onError: (error: any) => {
      toast({
        title: "제목 생성 실패",
        description: error.message || "제목 생성에 실패했습니다. 다시 시도해주세요",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (aiDraft && aiDraft.trim()) {
      generateTitlesMutation.mutate();
    } else {
      setGeneratedTitles([]);
    }
    setEditableAiDraft(aiDraft);
  }, [aiDraft]);

  useEffect(() => {
    setEditableAdditionalInfo(additionalInfoPreview);
  }, [additionalInfoPreview]);

  useEffect(() => {
    setEditableMergedContent(mergedContent);
  }, [mergedContent]);

  const parsedPrice = formData.askingPrice ? parseKoreanPrice(formData.askingPrice.toString()) : null;

  const handleCopyAiDraft = async () => {
    if (!aiDraft) {
      toast({
        title: "복사할 내용이 없습니다",
        description: "AI 초안을 먼저 생성해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(aiDraft);
      toast({
        title: "복사 완료",
        description: "AI 초안이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleCopyAdditionalInfo = async () => {
    if (!additionalInfoPreview || additionalInfoPreview === "입력한 추가 정보가 여기에 실시간으로 반영됩니다") {
      toast({
        title: "복사할 내용이 없습니다",
        description: "추가 정보를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(additionalInfoPreview);
      toast({
        title: "복사 완료",
        description: "추가 정보가 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleCopyMerged = async () => {
    if (!mergedContent) {
      toast({
        title: "복사할 내용이 없습니다",
        description: "먼저 AI와 합성하기를 눌러주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(mergedContent);
      toast({
        title: "복사 완료",
        description: "최종 완성본이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleCopyTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      toast({
        title: "복사 완료",
        description: "제목이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPrice = async () => {
    if (!parsedPrice) {
      toast({
        title: "복사할 가격이 없습니다",
        description: "판매 희망가를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(parsedPrice.toLocaleString());
      toast({
        title: "복사 완료",
        description: "가격이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const hasAdditionalInfo = additionalInfoPreview !== "입력한 추가 정보가 여기에 실시간으로 반영됩니다";

  return (
    <div className="flex flex-col space-y-6">
      {/* 제목 미리보기 */}
      {generatedTitles.length > 0 && (
        <Card data-testid="card-title-preview">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">제목 미리보기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {generatedTitles.map((title, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => {
                    const newTitles = [...generatedTitles];
                    newTitles[index] = e.target.value;
                    setGeneratedTitles(newTitles);
                  }}
                  className="flex-1"
                  data-testid={`input-title-${index}`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyTitle(title)}
                  data-testid={`button-copy-title-${index}`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 가격 표시 */}
      {parsedPrice && (
        <Card data-testid="card-price-display">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">가격</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted/50 rounded-md text-sm font-mono" data-testid="text-price">
                {parsedPrice.toLocaleString()}원
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPrice}
                data-testid="button-copy-price"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 초안 미리보기 */}
      <Card data-testid="card-ai-draft-preview">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 초안 미리보기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={editableAiDraft || "AI 작성하기를 눌러 초안을 생성해주세요"}
            onChange={(e) => setEditableAiDraft(e.target.value)}
            className="min-h-[200px] font-mono text-sm leading-relaxed resize-none"
            data-testid="text-ai-draft-preview"
          />
          <Button
            variant="outline"
            onClick={async () => {
              if (!editableAiDraft) {
                toast({
                  title: "복사할 내용이 없습니다",
                  description: "AI 초안을 먼저 생성해주세요.",
                  variant: "destructive",
                });
                return;
              }
              try {
                await navigator.clipboard.writeText(editableAiDraft);
                toast({
                  title: "복사 완료",
                  description: "AI 초안이 클립보드에 복사되었습니다.",
                });
              } catch (error) {
                toast({
                  title: "복사 실패",
                  description: "다시 시도해주세요.",
                  variant: "destructive",
                });
              }
            }}
            disabled={!editableAiDraft}
            data-testid="button-copy-ai-draft"
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            복사하기
          </Button>
        </CardContent>
      </Card>

      {/* 추가 정보 미리보기 */}
      <Card data-testid="card-additional-info-preview">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">추가 정보 미리보기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={editableAdditionalInfo}
            onChange={(e) => setEditableAdditionalInfo(e.target.value)}
            className="min-h-[200px] font-mono text-sm leading-relaxed resize-none"
            data-testid="text-additional-info-preview"
          />
          <Button
            variant="outline"
            onClick={async () => {
              if (!editableAdditionalInfo || editableAdditionalInfo === "입력한 추가 정보가 여기에 실시간으로 반영됩니다") {
                toast({
                  title: "복사할 내용이 없습니다",
                  description: "추가 정보를 입력해주세요.",
                  variant: "destructive",
                });
                return;
              }
              try {
                await navigator.clipboard.writeText(editableAdditionalInfo);
                toast({
                  title: "복사 완료",
                  description: "추가 정보가 클립보드에 복사되었습니다.",
                });
              } catch (error) {
                toast({
                  title: "복사 실패",
                  description: "다시 시도해주세요.",
                  variant: "destructive",
                });
              }
            }}
            disabled={!editableAdditionalInfo || editableAdditionalInfo === "입력한 추가 정보가 여기에 실시간으로 반영됩니다"}
            data-testid="button-copy-additional-info"
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            복사하기
          </Button>
        </CardContent>
      </Card>

      {/* AI와 합성하기 버튼 */}
      <Button
        variant="default"
        size="lg"
        onClick={onMerge}
        disabled={!aiDraft || !hasAdditionalInfo || isMerging}
        data-testid="button-merge"
        className="w-full"
      >
        <Sparkles className="h-5 w-5 mr-2" />
        {isMerging ? "합성 중..." : "AI와 합성하기"}
      </Button>

      {/* 최종 완성본 */}
      {mergedContent && (
        <Card data-testid="card-final-preview">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              최종 완성본
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={editableMergedContent}
              onChange={(e) => setEditableMergedContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm leading-relaxed resize-none"
              data-testid="text-final-preview"
            />
            <Button
              variant="outline"
              onClick={async () => {
                if (!editableMergedContent) {
                  toast({
                    title: "복사할 내용이 없습니다",
                    description: "먼저 AI와 합성하기를 눌러주세요.",
                    variant: "destructive",
                  });
                  return;
                }
                try {
                  await navigator.clipboard.writeText(editableMergedContent);
                  toast({
                    title: "복사 완료",
                    description: "최종 완성본이 클립보드에 복사되었습니다.",
                  });
                } catch (error) {
                  toast({
                    title: "복사 실패",
                    description: "다시 시도해주세요.",
                    variant: "destructive",
                  });
                }
              }}
              data-testid="button-copy-final"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              복사하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 저장 버튼 */}
      <Button
        variant="default"
        size="lg"
        onClick={onSave}
        disabled={isSaving || !aiDraft}
        data-testid="button-save"
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "저장 중..." : "저장하기"}
      </Button>

      {/* 초기화 버튼 */}
      <Button
        variant="outline"
        onClick={onReset}
        data-testid="button-reset"
        className="w-full"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        초기화
      </Button>
    </div>
  );
}