import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FormData {
  productName: string;
  brand: string;
  purchaseDate: string;
  usageCount: string;
  condition: string;
  additionalDescription: string;
  basicAccessories: string[];
  otherAccessories: string;
  features: string;
  originalPrice: string;
  sellingPrice: string;
  transactionMethods: string[];
  directLocation: string;
  negotiable: string;
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

  const generateAdditionalInfoPreview = () => {
    let preview = "";
    
    if (formData.purchaseDate) {
      preview += `✔ 최초 구매일: ${formData.purchaseDate}\n`;
    }
    
    if (formData.usageCount) {
      preview += `✔ 배터리 사용횟수: ${formData.usageCount}\n`;
    }
    
    if (formData.additionalDescription) {
      preview += `✔ 상태 설명: ${formData.additionalDescription}\n`;
    }
    
    if (formData.basicAccessories?.length > 0) {
      preview += `✔ 기본 구성품: ${formData.basicAccessories.join(", ")}\n`;
    }
    
    if (formData.otherAccessories) {
      preview += `✔ 별도 구성품: ${formData.otherAccessories}\n`;
    }
    
    if (formData.features) {
      preview += `✔ 제품 특징:\n${formData.features}\n`;
    }
    
    if (formData.originalPrice) {
      preview += `✔ 초기 구매가: ${Number(formData.originalPrice).toLocaleString()}원\n`;
    }
    
    if (formData.sellingPrice) {
      preview += `✔ 판매 희망가: ${Number(formData.sellingPrice).toLocaleString()}원\n`;
    }
    
    if (formData.transactionMethods?.length > 0) {
      preview += `✔ 거래 방식: ${formData.transactionMethods.join(", ")}\n`;
    }
    
    if (formData.directLocation) {
      preview += `✔ 직거래 장소: ${formData.directLocation}\n`;
    }
    
    if (formData.negotiable) {
      preview += `✔ 네고 여부: ${formData.negotiable}\n`;
    }
    
    return preview || "입력한 추가 정보가 여기에 실시간으로 반영됩니다";
  };

  const additionalInfoPreview = generateAdditionalInfoPreview();

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

  const hasAdditionalInfo = additionalInfoPreview !== "입력한 추가 정보가 여기에 실시간으로 반영됩니다";

  return (
    <div className="flex flex-col space-y-6">
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
            value={aiDraft || "AI 작성하기를 눌러 초안을 생성해주세요"}
            readOnly
            className="min-h-[200px] font-mono text-sm leading-relaxed resize-none bg-muted/50"
            data-testid="text-ai-draft-preview"
          />
          <Button
            variant="outline"
            onClick={handleCopyAiDraft}
            disabled={!aiDraft}
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
            value={additionalInfoPreview}
            readOnly
            className="min-h-[200px] font-mono text-sm leading-relaxed resize-none bg-muted/50"
            data-testid="text-additional-info-preview"
          />
          <Button
            variant="outline"
            onClick={handleCopyAdditionalInfo}
            disabled={!hasAdditionalInfo}
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
              value={mergedContent}
              readOnly
              className="min-h-[300px] font-mono text-sm leading-relaxed resize-none"
              data-testid="text-final-preview"
            />
            <div className="flex gap-3">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleCopyMerged}
                data-testid="button-copy-final"
              >
                <Copy className="h-4 w-4 mr-2" />
                복사하기
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={onSave}
                disabled={isSaving}
                data-testid="button-save-final"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "저장 중..." : "저장하기"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
