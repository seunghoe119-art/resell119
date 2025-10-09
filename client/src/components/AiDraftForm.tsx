import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, Copy, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AiDraftFormProps {
  onPreviewUpdate: (preview: string) => void;
  briefDescription?: string;
  onBriefDescriptionChange?: (description: string) => void;
}

export default function AiDraftForm({ onPreviewUpdate, briefDescription = "", onBriefDescriptionChange }: AiDraftFormProps) {
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const handleDescriptionChange = (value: string) => {
    if (onBriefDescriptionChange) {
      onBriefDescriptionChange(value);
    }
  };

  const generateMutation = useMutation({
    mutationFn: async (description: string) => {
      return apiRequest("POST", "/api/generate-draft", {
        briefDescription: description,
      });
    },
    onSuccess: (data: any) => {
      if (data.content) {
        setGeneratedContent(data.content);
        onPreviewUpdate(data.content);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message?.includes("요청이 너무 많습니다")
        ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요"
        : error.message?.includes("시간이 초과")
        ? "요청 시간이 초과되었습니다. 다시 시도해주세요"
        : "AI 초안 생성에 실패했습니다. 다시 시도해주세요";
      
      toast({
        title: "생성 실패",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (briefDescription && briefDescription.trim().length > 5) {
      generateMutation.mutate(briefDescription);
    }
  };

  const continueMutation = useMutation({
    mutationFn: async (additionalInfo: string) => {
      return apiRequest("POST", "/api/modify-content", {
        existingContent: generatedContent,
        additionalInfo: additionalInfo,
      });
    },
    onSuccess: (data: any) => {
      if (data.content) {
        setGeneratedContent(data.content);
        onPreviewUpdate(data.content);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message?.includes("요청이 너무 많습니다")
        ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요"
        : error.message?.includes("시간이 초과")
        ? "요청 시간이 초과되었습니다. 다시 시도해주세요"
        : "추가 답변 생성에 실패했습니다. 다시 시도해주세요";
      
      toast({
        title: "생성 실패",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleContinue = () => {
    if (!generatedContent) {
      toast({
        title: "추가할 내용이 없습니다",
        description: "먼저 AI 작성하기를 눌러주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!briefDescription || briefDescription.trim().length === 0) {
      toast({
        title: "추가 정보를 입력해주세요",
        description: "제품 정보 입력란에 추가할 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    continueMutation.mutate(briefDescription);
  };

  const handleCopy = async () => {
    if (!generatedContent) {
      toast({
        title: "복사할 내용이 없습니다",
        description: "먼저 AI 작성하기를 눌러주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedContent);
      toast({
        title: "복사 완료",
        description: "AI 생성 내용이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI 글 생성
        </CardTitle>
        <CardDescription>
          배터리 횟수, 구매시기, 특이사항, 구성품, 판매가
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              제품 정보 입력
            </label>
            <Textarea
              data-testid="input-ai-description"
              value={briefDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="예: 아이폰 16 프로 이상없음"
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button
              data-testid="button-generate-ai-draft"
              onClick={handleGenerate}
              className="flex-1"
              disabled={!briefDescription || briefDescription.trim().length <= 5 || generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  AI 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI 작성하기
                </>
              )}
            </Button>
            <Button
              data-testid="button-continue-ai-content"
              variant="outline"
              onClick={handleContinue}
              disabled={!generatedContent || !briefDescription || briefDescription.trim().length === 0 || continueMutation.isPending}
            >
              {continueMutation.isPending ? (
                <>
                  <Plus className="mr-2 h-4 w-4 animate-pulse" />
                  추가 중...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  추가답하기
                </>
              )}
            </Button>
            <Button
              data-testid="button-copy-ai-content"
              variant="outline"
              onClick={handleCopy}
              disabled={!generatedContent}
            >
              <Copy className="mr-2 h-4 w-4" />
              복사하기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
