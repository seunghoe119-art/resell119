import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

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
  aiPreview: string;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

export default function PreviewPane({ formData, aiPreview, onSave, onReset, isSaving }: PreviewPaneProps) {
  const { toast } = useToast();
  const [editablePreview, setEditablePreview] = useState<string>("");

  const generatePreview = () => {
    if (aiPreview) {
      return aiPreview;
    }
    let preview = "";

    if (formData.brand) {
      preview += `브랜드\n${formData.brand} 정품입니다.\n\n`;
    }

    if (formData.purchaseDate || formData.usageCount || formData.condition || formData.additionalDescription) {
      preview += `상태\n`;
      if (formData.purchaseDate) {
        preview += `- 최초 구매일: ${formData.purchaseDate}\n`;
      }
      if (formData.usageCount || formData.condition) {
        let statusLine = "- ";
        if (formData.usageCount) {
          statusLine += `사용 횟수: 총 ${formData.usageCount}회`;
        }
        if (formData.condition) {
          statusLine += ` (컨디션: ${formData.condition})`;
        }
        preview += statusLine + "\n";
      }
      if (formData.additionalDescription) {
        preview += `- 상세 설명: ${formData.additionalDescription}\n`;
      }
      preview += "\n";
    }

    if (formData.basicAccessories?.length > 0 || formData.otherAccessories) {
      preview += `구성품\n`;
      if (formData.basicAccessories?.length > 0) {
        preview += `- 기본: ${formData.basicAccessories.join(", ")}\n`;
      }
      if (formData.otherAccessories) {
        preview += `- 기타: ${formData.otherAccessories}\n`;
      }
      preview += "\n";
    }

    if (formData.features) {
      preview += `특징\n`;
      const features = formData.features.split("\n").filter((f) => f.trim());
      features.forEach((feature) => {
        preview += `- ${feature.trim()}\n`;
      });
      preview += "\n";
    }

    if (formData.originalPrice || formData.sellingPrice) {
      preview += `판매가\n`;
      if (formData.originalPrice && formData.sellingPrice) {
        preview += `- 초기 구매가 ${Number(formData.originalPrice).toLocaleString()}원 → 현재 ${Number(formData.sellingPrice).toLocaleString()}원에 판매합니다.\n\n`;
      } else if (formData.sellingPrice) {
        preview += `- ${Number(formData.sellingPrice).toLocaleString()}원에 판매합니다.\n\n`;
      }
    }

    if (formData.transactionMethods?.length > 0 || formData.directLocation) {
      preview += `거래 방식\n`;
      if (formData.transactionMethods?.length > 0) {
        preview += `- ${formData.transactionMethods.join(", ")} 가능합니다.\n`;
      }
      if (formData.directLocation) {
        preview += `- 직거래 선호 지역은 ${formData.directLocation}입니다.\n`;
      }
      preview += "\n";
    }

    if (formData.negotiable) {
      preview += `${formData.negotiable}. 빠른 거래 원합니다.`;
    }

    return preview || "왼쪽 입력 내용이 실시간으로 반영됩니다";
  };

  const previewText = generatePreview();

  // Sync editable preview with generated preview
  useEffect(() => {
    setEditablePreview(previewText);
  }, [previewText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editablePreview);
      toast({
        title: "복사 완료",
        description: "게시글이 클립보드에 복사되었습니다.",
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
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">실시간 미리보기</h2>
      </div>

      <div className="flex-1 mb-4">
        <Textarea
          value={editablePreview}
          onChange={(e) => setEditablePreview(e.target.value)}
          className="h-full min-h-[400px] font-mono text-sm leading-relaxed resize-none"
          data-testid="text-preview"
          placeholder="왼쪽 입력 내용이 실시간으로 반영됩니다"
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="default"
          className="flex-1"
          onClick={handleCopy}
          data-testid="button-copy"
        >
          <Copy className="h-4 w-4 mr-2" />
          복사하기
        </Button>
        <Button
          variant="default"
          className="flex-1"
          onClick={onSave}
          disabled={isSaving || (!formData.productName && !aiPreview)}
          data-testid="button-save"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "저장 중..." : "저장하기"}
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          data-testid="button-reset"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          초기화
        </Button>
      </div>
    </div>
  );
}
