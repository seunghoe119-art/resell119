import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const transactionOptions = ["직거래", "택배거래", "안전거래"];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">추가 정보</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">상태 정보</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">최초 구매일</Label>
            <Input
              id="purchaseDate"
              data-testid="input-purchase-date"
              type="text"
              inputMode="numeric"
              placeholder="예: 20240212 또는 202402"
              value={formData.purchaseDate}
              onChange={(e) => handleChange("purchaseDate", e.target.value)}
            />
            {formData.purchaseDate && parseDateText(formData.purchaseDate) && (
              <p className="text-sm text-muted-foreground" data-testid="text-parsed-purchase-date">
                {parseDateText(formData.purchaseDate)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageCount">배터리 사용횟수</Label>
            <Input
              id="usageCount"
              data-testid="input-usage-count"
              type="number"
              placeholder="예: 5"
              value={formData.usageCount}
              onChange={(e) => handleChange("usageCount", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalDescription">추가 상태 설명</Label>
          <Textarea
            id="additionalDescription"
            data-testid="textarea-additional-description"
            placeholder="제품의 상태를 자세히 설명해주세요"
            value={formData.additionalDescription}
            onChange={(e) => handleChange("additionalDescription", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">구성품</h3>

        <div className="space-y-2">
          <Label htmlFor="basicAccessories">기본 구성품</Label>
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherAccessories">기타 구성품</Label>
          <Input
            id="otherAccessories"
            data-testid="input-other-accessories"
            placeholder="예: 보호필름, 케이스"
            value={formData.otherAccessories}
            onChange={(e) => handleChange("otherAccessories", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="features">제품 특징</Label>
          <Textarea
            id="features"
            data-testid="textarea-features"
            placeholder="제품의 장점을 한 줄씩 입력해주세요"
            value={formData.features}
            onChange={(e) => handleChange("features", e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">판매 가격</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="originalPrice">초기 구매가 (원)</Label>
            <Input
              id="originalPrice"
              data-testid="input-original-price"
              type="number"
              placeholder="500000"
              value={formData.originalPrice}
              onChange={(e) => handleChange("originalPrice", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellingPrice">판매 희망가 (원)</Label>
            <Input
              id="sellingPrice"
              data-testid="input-selling-price"
              type="number"
              placeholder="350000"
              value={formData.sellingPrice}
              onChange={(e) => handleChange("sellingPrice", e.target.value)}
            />
          </div>
        </div>
      </div>

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
        </div>

        <div className="space-y-2">
          <Label htmlFor="directLocation">직거래 지역</Label>
          <Input
            id="directLocation"
            data-testid="input-direct-location"
            placeholder="예: 서울 강남구"
            value={formData.directLocation}
            onChange={(e) => handleChange("directLocation", e.target.value)}
          />
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