import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AiDraftFormProps {
  onPreviewUpdate: (preview: string) => void;
}

export default function AiDraftForm({ onPreviewUpdate }: AiDraftFormProps) {
  const [briefDescription, setBriefDescription] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (description: string) => {
      return apiRequest("POST", "/api/generate-draft", {
        briefDescription: description,
      });
    },
    onSuccess: (data: any) => {
      if (data.content) {
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

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (briefDescription.trim().length > 5) {
      const timer = setTimeout(() => {
        generateMutation.mutate(briefDescription);
      }, 1500);
      
      setDebounceTimer(timer);
    } else {
      onPreviewUpdate("");
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [briefDescription, onPreviewUpdate]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI 판매글 생성
        </CardTitle>
        <CardDescription>
          제품 정보를 입력하면 AI가 자동으로 판매글을 작성합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            제품 정보 입력 {generateMutation.isPending && <span className="text-muted-foreground">(생성 중...)</span>}
          </label>
          <Textarea
            data-testid="input-ai-description"
            value={briefDescription}
            onChange={(e) => setBriefDescription(e.target.value)}
            placeholder="예: 아이폰 16 프로 이상없음"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
