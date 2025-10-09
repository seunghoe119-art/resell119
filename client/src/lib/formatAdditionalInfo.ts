import { formatPrice } from './parseKoreanPrice';

interface FormData {
  purchaseDate: string;
  usageCount: number;
  condition: string;
  conditionNote: string;
  baseItems: string[];
  extraItems: string[];
  features: string[];
  purchasePrice: number;
  askingPrice: number;
  tradeTypes: string[];
  tradeArea: string;
  nego: string;
}

export function formatAdditionalInfo(formData: FormData): string {
  let info = "";
  
  if (formData.purchaseDate) {
    info += `✔ 최초 구매일: ${formData.purchaseDate}\n`;
  }
  
  if (formData.usageCount) {
    info += `✔ 배터리 사용횟수: ${formData.usageCount}\n`;
  }
  
  if (formData.condition) {
    info += `✔ 상태: ${formData.condition}\n`;
  }
  
  if (formData.conditionNote) {
    info += `✔ 상태 설명: ${formData.conditionNote}\n`;
  }
  
  if (formData.baseItems?.length > 0) {
    info += `✔ 기본 구성품: ${formData.baseItems.join(", ")}\n`;
  }
  
  if (formData.extraItems?.length > 0) {
    info += `✔ 별도 구성품: ${formData.extraItems.join(", ")}\n`;
  }
  
  if (formData.features?.length > 0) {
    info += `✔ 제품 특징:\n${formData.features.join("\n")}\n`;
  }
  
  if (formData.purchasePrice) {
    info += `✔ 초기 구매가: ${formatPrice(formData.purchasePrice.toString())}\n`;
  }
  
  if (formData.askingPrice) {
    info += `✔ 판매 희망가: ${formatPrice(formData.askingPrice.toString())}\n`;
  }
  
  if (formData.tradeTypes?.length > 0) {
    info += `✔ 거래 방식: ${formData.tradeTypes.join(", ")}\n`;
    
    // 택배거래만 선택된 경우 특별 멘트 추가
    if (formData.tradeTypes.length === 1 && formData.tradeTypes[0] === "택배거래") {
      info += `(직거래 약속등을 잡을 시간이 없어 택배거래만 가능한점을 양해 부탁드립니다)\n`;
    }
  }
  
  if (formData.tradeArea) {
    info += `✔ 직거래 장소: ${formData.tradeArea}\n`;
  }
  
  if (formData.nego) {
    info += `✔ ${formData.nego}\n`;
  }
  
  return info || "입력한 추가 정보가 여기에 실시간으로 반영됩니다";
}
