import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";

// Mock API call for AI modification
const modifyContentWithAI = async (content: string) => {
  console.log("AI Modification called with:", content);
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // In a real scenario, you would send `content` to your backend API
  // and return the modified content.
  return `AI Modified: ${content}`;
};


interface FormData {
  productName: string;
  brand: string;
  purchaseDate: string;
  usageCount: number;
  condition: string;
  conditionNote: string;
  baseItems: string | string[];
  extraItems: string | string[];
  features: string | string[];
  purchasePrice: number;
  askingPrice: number;
  tradeTypes: string[];
  tradeArea: string;
  nego: string;
  aiDraft?: string;
  pendingDraft?: string;
  finalDraft?: string;
}

interface ProductFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  aiPreview?: string;
  onPreviewUpdate?: (preview: string) => void;
}

export default function ProductForm({ formData, onChange, aiPreview, onPreviewUpdate }: ProductFormProps) {
  const { toast } = useToast();

  const handleChange = (field: keyof FormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleCopyProductName = async () => {
    if (!formData.productName) {
      toast({
        title: "복사할 내용이 없습니다",
        description: "제품명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(formData.productName);
      toast({
        title: "복사 완료",
        description: "제품명이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleCheckboxChange = (field: "baseItems" | "tradeTypes", value: string, checked: boolean) => {
    const current = formData[field] || [];
    const updated = checked
      ? [...current, value]
      : current.filter((item: string) => item !== value);
    handleChange(field, updated);
  };

  const parseDateText = (dateText: string): string => {
    const cleaned = dateText.replace(/\D/g, '');

    if (cleaned.length === 8) {
      const year = cleaned.substring(0, 4);
      const month = parseInt(cleaned.substring(4, 6), 10);
      const day = parseInt(cleaned.substring(6, 8), 10);
      return `${year}년 ${month}월 ${day}일 구매한 물품입니다`;
    } else if (cleaned.length === 6) {
      const year = cleaned.substring(0, 4);
      const month = parseInt(cleaned.substring(4, 6), 10);
      return `${year}년 ${month}월 구매한 물품입니다`;
    }

    return '';
  };

  const baseItemOptions = ["본체", "제품 박스", "충전기", "케이블"];
  const transactionOptions = ["직거래", "택배거래", "비대면거래 작전삼성홈타운"];

  const modifyContentMutation = useMutation({
    mutationFn: modifyContentWithAI,
    onSuccess: (data) => {
      toast({
        title: "AI 수정 완료",
        description: "글이 성공적으로 수정되었습니다.",
      });
      // In a real app, you would likely update your form data or state with the AI-generated content
      console.log("AI Modification Result:", data);
    },
    onError: (error) => {
      toast({
        title: "AI 수정 실패",
        description: "글 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("AI Modification Error:", error);
    },
  });

  const handleAddAllInfo = () => {
    // Combine all form data into a single string to be sent to the AI
    // This is a simplified example; you'd want to format this more robustly
    const combinedContent = `
      제품명: ${formData.productName || ''}
      브랜드: ${formData.brand || ''}
      구매일: ${formData.purchaseDate ? parseDateText(formData.purchaseDate) : ''}
      사용횟수: ${formData.usageCount || ''}
      상태 설명: ${formData.conditionNote || ''}
      기본 구성품: ${formData.baseItems?.join(", ") || ''}
      별도 구성품: ${formData.extraItems?.join(", ") || ''}
      제품 특징: ${formData.features?.join(", ") || ''}
      초기 구매가: ${formData.purchasePrice || ''}원
      판매 희망가: ${formData.askingPrice || ''}원
      거래 방식: ${formData.tradeTypes?.join(", ") || ''}
      직거래 장소: ${formData.tradeArea || ''}
      네고 가능 여부: ${formData.nego || ''}
    `;
    modifyContentMutation.mutate(combinedContent.trim());
  };


  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">추가 정보</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">최초 구매일</Label>
            <div className="flex gap-2">
              <Input
                id="purchaseDate"
                data-testid="input-purchase-date"
                type="text"
                placeholder="예: 2024년 2월 12일 또는 자유 입력"
                value={formData.purchaseDate}
                onChange={(e) => handleChange("purchaseDate", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                data-testid="button-add-purchase-date"
                onClick={() => {
                  if (formData.purchaseDate) {
                    handleChange("purchaseDate", "");
                  }
                }}
              >
                {formData.purchaseDate ? "삭제" : "추가"}
              </Button>
            </div>
            {formData.purchaseDate && parseDateText(formData.purchaseDate) && (
              <p className="text-sm text-muted-foreground" data-testid="text-parsed-purchase-date">
                {parseDateText(formData.purchaseDate)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageCount">배터리 사용횟수</Label>
            <div className="flex gap-2">
              <Input
                id="usageCount"
                data-testid="input-usage-count"
                type="text"
                placeholder="예: 100회 또는 자유 입력"
                value={formData.usageCount?.toString() || ""}
                onChange={(e) => handleChange("usageCount", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                data-testid="button-add-usage-count"
                onClick={() => {
                  if (formData.usageCount !== 0) {
                    handleChange("usageCount", 0);
                  }
                }}
              >
                {formData.usageCount !== 0 ? "삭제" : "추가"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditionNote">추가 상태 설명</Label>
          <div className="flex gap-2">
            <Textarea
              id="conditionNote"
              data-testid="textarea-condition-note"
              placeholder="제품의 상태를 자세히 설명해주세요"
              value={formData.conditionNote}
              onChange={(e) => handleChange("conditionNote", e.target.value)}
              rows={3}
              className="flex-1"
            />
            <Button
              type="button"
              variant="destructive"
              data-testid="button-add-condition-note"
              onClick={() => {
                if (formData.conditionNote) {
                  handleChange("conditionNote", "");
                }
              }}
            >
              {formData.conditionNote ? "삭제" : "추가"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">구성품</h3>

        <div className="space-y-2">
          <Label htmlFor="baseItems">기본 구성품</Label>
          <div className="flex gap-2">
            <Textarea
              id="baseItems"
              data-testid="input-base-items"
              placeholder="예: 본체, 제품 박스, 충전기, 케이블"
              value={Array.isArray(formData.baseItems) ? formData.baseItems.join(", ") : formData.baseItems || ""}
              onChange={(e) => {
                handleChange("baseItems", e.target.value);
              }}
              rows={2}
              className="flex-1"
            />
            <Button
              type="button"
              variant="destructive"
              data-testid="button-add-base-items"
              onClick={() => {
                if (formData.baseItems && (Array.isArray(formData.baseItems) ? formData.baseItems.length > 0 : formData.baseItems)) {
                  handleChange("baseItems", "");
                }
              }}
            >
              {formData.baseItems && (Array.isArray(formData.baseItems) ? formData.baseItems.length > 0 : formData.baseItems) ? "삭제" : "추가"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="extraItems">별도로 구입한 구성품</Label>
          <div className="flex gap-2">
            <Textarea
              id="extraItems"
              data-testid="input-extra-items"
              placeholder="예: 보호필름, 케이스"
              value={Array.isArray(formData.extraItems) ? formData.extraItems.join(", ") : formData.extraItems || ""}
              onChange={(e) => {
                handleChange("extraItems", e.target.value);
              }}
              rows={2}
              className="flex-1"
            />
            <Button
              type="button"
              variant="destructive"
              data-testid="button-add-extra-items"
              onClick={() => {
                if (formData.extraItems && (Array.isArray(formData.extraItems) ? formData.extraItems.length > 0 : formData.extraItems)) {
                  handleChange("extraItems", "");
                }
              }}
            >
              {formData.extraItems && (Array.isArray(formData.extraItems) ? formData.extraItems.length > 0 : formData.extraItems) ? "삭제" : "추가"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="features">제품 특징</Label>
          <div className="flex gap-2">
            <Textarea
              id="features"
              data-testid="input-features"
              placeholder="제품의 장점을 자유롭게 입력해주세요"
              value={Array.isArray(formData.features) ? formData.features.join(", ") : formData.features || ""}
              onChange={(e) => {
                handleChange("features", e.target.value);
              }}
              rows={3}
              className="flex-1"
            />
            <Button
              type="button"
              variant="destructive"
              data-testid="button-add-features"
              onClick={() => {
                if (formData.features && (Array.isArray(formData.features) ? formData.features.length > 0 : formData.features)) {
                  handleChange("features", "");
                }
              }}
            >
              {formData.features && (Array.isArray(formData.features) ? formData.features.length > 0 : formData.features) ? "삭제" : "추가"}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">판매 가격</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">초기 구매가 (원)</Label>
              <div className="flex gap-2">
                <Input
                  id="purchasePrice"
                  data-testid="input-purchase-price"
                  type="text"
                  placeholder="예: 500000 또는 자유 입력"
                  value={formData.purchasePrice?.toString() || ""}
                  onChange={(e) => handleChange("purchasePrice", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  data-testid="button-add-purchase-price"
                  onClick={() => {
                    if (formData.purchasePrice !== 0) {
                      handleChange("purchasePrice", 0);
                    }
                  }}
                >
                  {formData.purchasePrice !== 0 ? "삭제" : "추가"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="askingPrice">판매 희망가 (원)</Label>
              <div className="flex gap-2">
                <Input
                  id="askingPrice"
                  data-testid="input-asking-price"
                  type="text"
                  placeholder="예: 350000 또는 자유 입력"
                  value={formData.askingPrice?.toString() || ""}
                  onChange={(e) => handleChange("askingPrice", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  data-testid="button-add-asking-price"
                  onClick={() => {
                    if (formData.askingPrice !== 0) {
                      handleChange("askingPrice", 0);
                    }
                  }}
                >
                  {formData.askingPrice !== 0 ? "삭제" : "추가"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">거래 방식</h3>

        <div className="space-y-3">
          <Label>거래 종류</Label>
          <div className="grid grid-cols-3 gap-3">
            {transactionOptions.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Checkbox
                  id={`transaction-${item}`}
                  data-testid={`checkbox-transaction-${item}`}
                  checked={formData.tradeTypes?.includes(item)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("tradeTypes", item, checked as boolean)
                  }
                />
                <Label htmlFor={`transaction-${item}`} className="font-normal cursor-pointer">
                  {item}
                </Label>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Button
              type="button"
              variant="destructive"
              data-testid="button-add-transaction"
              onClick={() => {
                if (formData.tradeTypes && formData.tradeTypes.length > 0) {
                  handleChange("tradeTypes", []);
                } else {
                  handleChange("tradeTypes", transactionOptions);
                  handleAddAllInfo();
                }
              }}
              disabled={modifyContentMutation.isPending}
              className="w-full"
            >
              {modifyContentMutation.isPending 
                ? "수정 중..." 
                : (formData.tradeTypes && formData.tradeTypes.length > 0 ? "삭제" : "추가")}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>직거래 가능지역</Label>
          <div className="grid grid-cols-2 gap-3">
            {["인천 서구", "계양", "부천", "강서", "목동", "홍대입구역", "강남역인근"].map((area) => (
              <div key={area} className="flex items-center gap-2">
                <Checkbox
                  id={`area-${area}`}
                  data-testid={`checkbox-area-${area}`}
                  checked={formData.tradeArea?.includes(area)}
                  onCheckedChange={(checked) => {
                    const currentAreas = formData.tradeArea?.split(", ").filter(a => a.trim()) || [];
                    const updatedAreas = checked
                      ? [...currentAreas, area]
                      : currentAreas.filter(a => a !== area);
                    handleChange("tradeArea", updatedAreas.join(", "));
                  }}
                />
                <Label htmlFor={`area-${area}`} className="font-normal cursor-pointer">
                  {area}
                </Label>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Button
              type="button"
              variant="destructive"
              data-testid="button-add-default-areas"
              onClick={() => {
                if (formData.tradeArea) {
                  handleChange("tradeArea", "");
                } else {
                  const defaultAreas = ["인천 서구", "계양", "부천", "강서", "목동"];
                  handleChange("tradeArea", defaultAreas.join(", "));
                }
              }}
              className="w-full"
            >
              {formData.tradeArea ? "삭제" : "추가"}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>네고 가능 여부</Label>
          <RadioGroup
            value={formData.nego}
            onValueChange={(value) => handleChange("nego", value)}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="상의는 타이트한 100 ~ 루즈하게 105, XL 입습니다. (키 176cm 80kg)" id="phone-1" data-testid="radio-phone-1" />
              <Label htmlFor="phone-1" className="font-normal cursor-pointer">
                상의는 타이트한 100 ~ 루즈하게 105, XL 입습니다. (키 176cm 80kg)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="하의는 허리 32사이즈, 176cm, 신발, 발볼넓은275~280 입습니다" id="phone-2" data-testid="radio-phone-2" />
              <Label htmlFor="phone-2" className="font-normal cursor-pointer">
                하의는 허리 32사이즈, 176cm, 신발, 발볼넓은275~280 입습니다
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>택배비</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="delivery-included"
                data-testid="checkbox-delivery-included"
                checked={formData.nego === "택배비 포함"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleChange("nego", "택배비 포함");
                  } else {
                    handleChange("nego", "");
                  }
                }}
              />
              <Label htmlFor="delivery-included" className="font-normal cursor-pointer">
                택배비 포함
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="delivery-4500"
                data-testid="checkbox-delivery-4500"
                checked={formData.nego?.includes("택배비 4500원") || false}
                onCheckedChange={(checked) => {
                  const current = formData.nego || "";
                  const fees = current.split(", ").filter(f => f.trim() && f !== "택배비 포함");

                  if (checked) {
                    const updated = [...fees, "택배비 4500원"];
                    handleChange("nego", updated.join(", "));
                  } else {
                    const updated = fees.filter(f => f !== "택배비 4500원");
                    handleChange("nego", updated.join(", "));
                  }
                }}
                disabled={formData.nego === "택배비 포함"}
              />
              <Label htmlFor="delivery-4500" className="font-normal cursor-pointer">
                택배비 4500원
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="delivery-2200"
                data-testid="checkbox-delivery-2200"
                checked={formData.nego?.includes("반값택배 2200원") || false}
                onCheckedChange={(checked) => {
                  const current = formData.nego || "";
                  const fees = current.split(", ").filter(f => f.trim() && f !== "택배비 포함");

                  if (checked) {
                    const updated = [...fees, "반값택배 2200원"];
                    handleChange("nego", updated.join(", "));
                  } else {
                    const updated = fees.filter(f => f !== "반값택배 2200원");
                    handleChange("nego", updated.join(", "));
                  }
                }}
                disabled={formData.nego === "택배비 포함"}
              />
              <Label htmlFor="delivery-2200" className="font-normal cursor-pointer">
                반값택배 2200원
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}