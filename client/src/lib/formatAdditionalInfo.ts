import { formatPrice } from './parseKoreanPrice';

interface FormData {
  purchaseDate: string;
  usageCount: string;
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

export function formatAdditionalInfo(formData: FormData): string {
  let info = "";
  
  if (formData.purchaseDate) {
    info += `✔ 최초 구매일: ${formData.purchaseDate}\n`;
  }
  
  if (formData.usageCount) {
    info += `✔ 배터리 사용횟수: ${formData.usageCount}\n`;
  }
  
  if (formData.additionalDescription) {
    info += `✔ 상태 설명: ${formData.additionalDescription}\n`;
  }
  
  if (formData.basicAccessories?.length > 0) {
    info += `✔ 기본 구성품: ${formData.basicAccessories.join(", ")}\n`;
  }
  
  if (formData.otherAccessories) {
    info += `✔ 별도 구성품: ${formData.otherAccessories}\n`;
  }
  
  if (formData.features) {
    info += `✔ 제품 특징:\n${formData.features}\n`;
  }
  
  if (formData.originalPrice) {
    info += `✔ 초기 구매가: ${formatPrice(formData.originalPrice)}\n`;
  }
  
  if (formData.sellingPrice) {
    info += `✔ 판매 희망가: ${formatPrice(formData.sellingPrice)}\n`;
  }
  
  if (formData.transactionMethods?.length > 0) {
    info += `✔ 거래 방식: ${formData.transactionMethods.join(", ")}\n`;
    
    // 택배거래만 선택된 경우 특별 멘트 추가
    if (formData.transactionMethods.length === 1 && formData.transactionMethods[0] === "택배거래") {
      info += `(직거래 약속등을 잡을 시간이 없어 택배거래만 가능한점을 양해 부탁드립니다)\n`;
    }
  }
  
  if (formData.directLocation) {
    info += `✔ 직거래 장소: ${formData.directLocation}\n`;
  }
  
  if (formData.negotiable) {
    info += `✔ 네고 여부: ${formData.negotiable}\n`;
  }
  
  return info || "입력한 추가 정보가 여기에 실시간으로 반영됩니다";
}
