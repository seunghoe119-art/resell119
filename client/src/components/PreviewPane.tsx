import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Save, Sparkles, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAdditionalInfo } from "@/lib/formatAdditionalInfo";
import { parseKoreanPrice } from "@/lib/parseKoreanPrice";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FormData } from "@shared/schema";

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
  const [showToneDialog, setShowToneDialog] = useState(false);
  const [transformedContent, setTransformedContent] = useState("");

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

  const transformToneMutation = useMutation({
    mutationFn: async (toneType: string) => {
      return apiRequest("POST", "/api/transform-tone", {
        content: editableMergedContent,
        toneType: toneType,
      });
    },
    onSuccess: (data: any) => {
      if (data.transformedContent) {
        setTransformedContent(data.transformedContent);
        toast({
          title: "말투 변환 완료",
          description: "선택한 스타일로 변환되었습니다.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "말투 변환 실패",
        description: error.message ?? error.error ?? "말투 변환에 실패했습니다. 다시 시도해주세요",
        variant: "destructive",
      });
    },
  });

  const handleToneTransform = (toneType: string) => {
    if (!editableMergedContent || editableMergedContent.trim() === "") {
      toast({
        title: "최종 완성본이 없습니다",
        description: "먼저 AI와 합성하기를 눌러 최종 완성본을 생성해주세요.",
        variant: "destructive",
      });
      setShowToneDialog(false);
      return;
    }
    
    setShowToneDialog(false);
    transformToneMutation.mutate(toneType);
  };

  const handleReset = () => {
    setTransformedContent("");
    onReset();
  };

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
    setTransformedContent("");
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
              <Input
                type="text"
                inputMode="numeric"
                value={parsedPrice.toLocaleString()}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                  if (numericValue) {
                    formData.askingPrice = parseInt(numericValue);
                  }
                }}
                className="flex-1 font-mono"
                data-testid="input-price"
              />
              <span className="text-sm">원</span>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
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
                }}
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

      {/* 말투변형본 */}
      {transformedContent && (
        <Card data-testid="card-transformed">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              말투변형본
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={transformedContent}
              onChange={(e) => setTransformedContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm leading-relaxed resize-none"
              data-testid="text-transformed"
            />
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(transformedContent);
                  toast({
                    title: "복사 완료",
                    description: "말투변형본이 클립보드에 복사되었습니다.",
                  });
                } catch (error) {
                  toast({
                    title: "복사 실패",
                    description: "다시 시도해주세요.",
                    variant: "destructive",
                  });
                }
              }}
              data-testid="button-copy-transformed"
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

      {/* 말투 변환 버튼 */}
      <Button
        variant="secondary"
        onClick={() => setShowToneDialog(true)}
        disabled={!editableMergedContent || editableMergedContent.trim() === "" || transformToneMutation.isPending}
        data-testid="button-tone-transform"
        className="w-full"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {transformToneMutation.isPending ? "변환 중..." : "말투 변환하기"}
      </Button>

      {/* 초기화 버튼 */}
      <Button
        variant="outline"
        onClick={handleReset}
        data-testid="button-reset"
        className="w-full"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        초기화
      </Button>

      {/* 말투 변환 Dialog */}
      <Dialog open={showToneDialog} onOpenChange={setShowToneDialog}>
        <DialogContent data-testid="dialog-tone-transform">
          <DialogHeader>
            <DialogTitle>말투 변환 스타일 선택</DialogTitle>
            <DialogDescription>
              원하는 말투 스타일을 선택하세요
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => handleToneTransform("professional")}
              data-testid="button-tone-professional"
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="font-semibold">직장인이 쓴 버전</div>
                <div className="text-sm text-muted-foreground mt-1">
                  격식있고 전문적인 말투
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleToneTransform("student")}
              data-testid="button-tone-student"
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="font-semibold">학생이 쓴 버전</div>
                <div className="text-sm text-muted-foreground mt-1">
                  친근하고 캐주얼한 말투
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleToneTransform("simple")}
              data-testid="button-tone-simple"
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="font-semibold">간단한 버전</div>
                <div className="text-sm text-muted-foreground mt-1">
                  핵심만 간결하게
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleToneTransform("brief")}
              data-testid="button-tone-brief"
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="font-semibold">용건만 있는 버전</div>
                <div className="text-sm text-muted-foreground mt-1">
                  불필요한 설명 없이 사실만
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}