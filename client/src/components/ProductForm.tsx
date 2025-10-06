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
  deliveryFee: string;
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
                placeholder="예: 100회"
                value={formData.usageCount}
                onChange={(e) => handleChange("usageCount", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                data-testid="button-add-usage-count"
                onClick={() => {
                  if (formData.usageCount) {
                    handleChange("usageCount", "");
                  }
                }}
              >
                {formData.usageCount ? "삭제" : "추가"}
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
              variant="destructive"
              data-testid="button-add-additional-description"
              onClick={() => {
                if (formData.additionalDescription) {
                  handleChange("additionalDescription", "");
                }
              }}
            >
              {formData.additionalDescription ? "삭제" : "추가"}
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
              variant="destructive"
              data-testid="button-add-basic-accessories"
              onClick={() => {
                if (formData.basicAccessories && formData.basicAccessories.length > 0) {
                  handleChange("basicAccessories", []);
                }
              }}
            >
              {formData.basicAccessories && formData.basicAccessories.length > 0 ? "삭제" : "추가"}
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
              variant="destructive"
              data-testid="button-add-other-accessories"
              onClick={() => {
                if (formData.otherAccessories) {
                  handleChange("otherAccessories", "");
                }
              }}
            >
              {formData.otherAccessories ? "삭제" : "추가"}
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
              variant="destructive"
              data-testid="button-add-features"
              onClick={() => {
                if (formData.features) {
                  handleChange("features", "");
                }
              }}
            >
              {formData.features ? "삭제" : "추가"}
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
                  type="text"
                  placeholder="500000 또는 만원/ㅁㅇ, 천원/ㅊㅇ"
                  value={formData.originalPrice}
                  onChange={(e) => {
                    let value = e.target.value;
                    // ㅁㅇ 또는 ㅊㅇ이 포함되어 있으면 자동 변환
                    if (value.includes('ㅁㅇ')) {
                      value = value.replace(/ㅁㅇ/g, '만원');
                    }
                    if (value.includes('ㅊㅇ')) {
                      value = value.replace(/ㅊㅇ/g, '천원');
                    }
                    handleChange("originalPrice", value);
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  data-testid="button-add-original-price"
                  onClick={() => {
                    if (formData.originalPrice) {
                      handleChange("originalPrice", "");
                    }
                  }}
                >
                  {formData.originalPrice ? "삭제" : "추가"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">판매 희망가 (원)</Label>
              <div className="flex gap-2">
                <Input
                  id="sellingPrice"
                  data-testid="input-selling-price"
                  type="text"
                  placeholder="350000 또는 만원/ㅁㅇ, 천원/ㅊㅇ"
                  value={formData.sellingPrice}
                  onChange={(e) => {
                    let value = e.target.value;
                    // ㅁㅇ 또는 ㅊㅇ이 포함되어 있으면 자동 변환
                    if (value.includes('ㅁㅇ')) {
                      value = value.replace(/ㅁㅇ/g, '만원');
                    }
                    if (value.includes('ㅊㅇ')) {
                      value = value.replace(/ㅊㅇ/g, '천원');
                    }
                    handleChange("sellingPrice", value);
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  data-testid="button-add-selling-price"
                  onClick={() => {
                    if (formData.sellingPrice) {
                      handleChange("sellingPrice", "");
                    }
                  }}
                >
                  {formData.sellingPrice ? "삭제" : "추가"}
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
              variant="destructive"
              data-testid="button-add-transaction"
              onClick={() => {
                if (formData.transactionMethods && formData.transactionMethods.length > 0) {
                  handleChange("transactionMethods", []);
                } else {
                  handleChange("transactionMethods", transactionOptions);
                  handleAddAllInfo();
                }
              }}
              disabled={modifyContentMutation.isPending}
              className="w-full"
            >
              {modifyContentMutation.isPending 
                ? "수정 중..." 
                : (formData.transactionMethods && formData.transactionMethods.length > 0 ? "삭제" : "추가")}
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
              variant="destructive"
              data-testid="button-add-default-areas"
              onClick={() => {
                if (formData.directLocation) {
                  handleChange("directLocation", "");
                } else {
                  const defaultAreas = ["인천 서구", "계양", "부천", "강서", "목동"];
                  handleChange("directLocation", defaultAreas.join(", "));
                }
              }}
              className="w-full"
            >
              {formData.directLocation ? "삭제" : "추가"}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>전화번호 추가</Label>
          <RadioGroup
            value={formData.negotiable}
            onValueChange={(value) => handleChange("negotiable", value)}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="전화번호 010-6441-8743" id="phone-1" data-testid="radio-phone-1" />
              <Label htmlFor="phone-1" className="font-normal cursor-pointer">
                전화번호 010-6441-8743
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="전화번호 010-4056-1290" id="phone-2" data-testid="radio-phone-2" />
              <Label htmlFor="phone-2" className="font-normal cursor-pointer">
                전화번호 010-4056-1290
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>택배비</Label>
          <RadioGroup
            value={formData.deliveryFee}
            onValueChange={(value) => handleChange("deliveryFee", value)}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="택배비 포함" id="delivery-included" data-testid="radio-delivery-included" />
              <Label htmlFor="delivery-included" className="font-normal cursor-pointer">
                택배비 포함
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="택배비 4500원" id="delivery-4500" data-testid="radio-delivery-4500" />
              <Label htmlFor="delivery-4500" className="font-normal cursor-pointer">
                택배비 4500원
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="반값택배 2200원" id="delivery-2200" data-testid="radio-delivery-2200" />
              <Label htmlFor="delivery-2200" className="font-normal cursor-pointer">
                반값택배 2200원
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}