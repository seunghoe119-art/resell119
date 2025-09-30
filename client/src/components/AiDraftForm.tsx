import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AiDraftFormProps {
  onDraftGenerated: (draft: any) => void;
}

export default function AiDraftForm({ onDraftGenerated }: AiDraftFormProps) {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [briefDescription, setBriefDescription] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/generate-draft", {
        productName,
        brand: brand || undefined,
        briefDescription: briefDescription || undefined,
      });
    },
    onSuccess: (data) => {
      onDraftGenerated(data);
      setProductName("");
      setBrand("");
      setBriefDescription("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName.trim()) {
      generateMutation.mutate();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI 초안 생성
        </CardTitle>
        <CardDescription>
          제품 정보를 간단히 입력하면 AI가 판매글 초안을 작성해드립니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              제품명 <span className="text-destructive">*</span>
            </label>
            <Input
              data-testid="input-ai-product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="예: 아이폰 15 Pro"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              브랜드 (선택)
            </label>
            <Input
              data-testid="input-ai-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="예: Apple"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              간단한 설명 (선택)
            </label>
            <Textarea
              data-testid="input-ai-description"
              value={briefDescription}
              onChange={(e) => setBriefDescription(e.target.value)}
              placeholder="예: 거의 사용하지 않은 깨끗한 상태입니다"
              rows={3}
            />
          </div>
          <Button
            data-testid="button-generate-ai-draft"
            type="submit"
            className="w-full"
            disabled={!productName.trim() || generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                AI 초안 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI 초안 생성하기
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
