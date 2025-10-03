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

interface ProductFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

export default function ProductForm({ formData, onChange }: ProductFormProps) {
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

  const handleCheckboxChange = (field: "basicAccessories" | "transactionMethods", value: string, checked: boolean) => {
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

  const basicAccessoryOptions = ["본체", "제품 박스", "충전기", "케이블"];
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
      상태 설명: ${formData.additionalDescription || ''}
      기본 구성품: ${formData.basicAccessories?.join(", ") || ''}
      별도 구성품: ${formData.otherAccessories || ''}
      제품 특징: ${formData.features || ''}
      초기 구매가: ${formData.originalPrice || ''}원
      판매 희망가: ${formData.sellingPrice || ''}원
      거래 방식: ${formData.transactionMethods?.join(", ") || ''}
      직거래 장소: ${formData.directLocation || ''}
      네고 가능 여부: ${formData.negotiable || ''}
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
                inputMode="numeric"
                placeholder="예: 20240212 또는 202402"
                value={formData.purchaseDate}
                onChange={(e) => handleChange("purchaseDate", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                data-testid="button-add-purchase-date"
                onClick={() => {
                  // 기능은 나중에 추가 예정
                }}
              >
                전체추가
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
                placeholder="예: 100회"
                value={formData.usageCount}
                onChange={(e) => handleChange("usageCount", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                data-testid="button-add-usage-count"
                onClick={() => {
                  // 기능은 나중에 추가 예정
                }}
              >
                전체추가
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalDescription">추가 상태 설명</Label>
          <div className="flex gap-2">
            <Textarea
              id="additionalDescription"
              data-testid="textarea-additional-description"
              placeholder="제품의 상태를 자세히 설명해주세요"
              value={formData.additionalDescription}
              onChange={(e) => handleChange("additionalDescription", e.target.value)}
              rows={3}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              data-testid="button-add-additional-description"
              onClick={() => {
                // 기능은 나중에 추가 예정
              }}
            >
              전체추가
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">구성품</h3>

        <div className="space-y-2">
          <Label htmlFor="basicAccessories">기본 구성품</Label>
          <div className="flex gap-2">
            <Input
              id="basicAccessories"
              data-testid="input-basic-accessories"
              placeholder="예: 본체, 제품 박스, 충전기, 케이블"
              value={formData.basicAccessories?.join(", ") || ""}
              onChange={(e) => {
                const accessories = e.target.value
                  .split(",")
                  .map(item => item.trim())
                  .filter(item => item !== "");
                handleChange("basicAccessories", accessories);
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              data-testid="button-add-basic-accessories"
              onClick={() => {
                // 기능은 나중에 추가 예정
              }}
            >
              전체추가
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherAccessories">별도로 구입한 구성품</Label>
          <div className="flex gap-2">
            <Input
              id="otherAccessories"
              data-testid="input-other-accessories"
              placeholder="예: 보호필름, 케이스"
              value={formData.otherAccessories}
              onChange={(e) => handleChange("otherAccessories", e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              data-testid="button-add-other-accessories"
              onClick={() => {
                // 기능은 나중에 추가 예정
              }}
            >
              전체추가
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
              data-testid="textarea-features"
              placeholder="제품의 장점을 한 줄씩 입력해주세요"
              value={formData.features}
              onChange={(e) => handleChange("features", e.target.value)}
              rows={4}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              data-testid="button-add-features"
              onClick={() => {
                // 기능은 나중에 추가 예정
              }}
            >
              전체추가
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
              <Label htmlFor="originalPrice">초기 구매가 (원)</Label>
              <div className="flex gap-2">
                <Input
                  id="originalPrice"
                  data-testid="input-original-price"
                  type="number"
                  placeholder="500000"
                  value={formData.originalPrice}
                  onChange={(e) => handleChange("originalPrice", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  data-testid="button-add-original-price"
                  onClick={() => {
                    // 기능은 나중에 추가 예정
                  }}
                >
                  전체추가
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">판매 희망가 (원)</Label>
              <div className="flex gap-2">
                <Input
                  id="sellingPrice"
                  data-testid="input-selling-price"
                  type="number"
                  placeholder="350000"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange("sellingPrice", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  data-testid="button-add-selling-price"
                  onClick={() => {
                    // 기능은 나중에 추가 예정
                  }}
                >
                  전체추가
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
                  checked={formData.transactionMethods?.includes(item)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("transactionMethods", item, checked as boolean)
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
              variant="outline"
              data-testid="button-add-transaction"
              onClick={() => {
                // 모든 거래 방식 체크
                handleChange("transactionMethods", transactionOptions);
                // AI 수정 호출
                handleAddAllInfo();
              }}
              disabled={modifyContentMutation.isPending}
              className="w-full"
            >
              {modifyContentMutation.isPending ? "수정 중..." : "전체추가"}
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
                  checked={formData.directLocation?.includes(area)}
                  onCheckedChange={(checked) => {
                    const currentAreas = formData.directLocation?.split(", ").filter(a => a.trim()) || [];
                    const updatedAreas = checked
                      ? [...currentAreas, area]
                      : currentAreas.filter(a => a !== area);
                    handleChange("directLocation", updatedAreas.join(", "));
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
              variant="outline"
              data-testid="button-add-default-areas"
              onClick={() => {
                const defaultAreas = ["인천 서구", "계양", "부천", "강서", "목동"];
                handleChange("directLocation", defaultAreas.join(", "));
              }}
              className="w-full"
            >
              기본 추가
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>네고 여부</Label>
          <RadioGroup
            value={formData.negotiable}
            onValueChange={(value) => handleChange("negotiable", value)}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="네고 불가" id="nego-no" data-testid="radio-nego-no" />
              <Label htmlFor="nego-no" className="font-normal cursor-pointer">
                네고 불가
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="네고 가능" id="nego-yes" data-testid="radio-nego-yes" />
              <Label htmlFor="nego-yes" className="font-normal cursor-pointer">
                네고 가능
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}