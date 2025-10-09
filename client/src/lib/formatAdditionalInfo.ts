import { formatPrice } from './parseKoreanPrice';

interface FormData {
  purchaseDate: string;
  usageCount: number;
  condition: string;
  conditionNote: string;
  baseItems: string | string[];
  extraItems: string | string[];
  features: string | string[];
  purchasePrice: number;
  askingPrice: number;
  tradeTypes: string | string[];
  tradeArea: string;
  nego: string;
}

// 날짜 파싱 함수 (202505 → 25년 5월)
function parseKoreanDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  
  // YYYYMM 형식 (202505)
  const yyyymmMatch = dateStr.match(/^(\d{4})(\d{2})$/);
  if (yyyymmMatch) {
    const year = yyyymmMatch[1].slice(2); // 마지막 2자리
    const month = parseInt(yyyymmMatch[2], 10);
    return `${year}년 ${month}월`;
  }
  
  // YYYY-MM 형식 (2025-05)
  const dashMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (dashMatch) {
    const year = dashMatch[1].slice(2);
    const month = parseInt(dashMatch[2], 10);
    return `${year}년 ${month}월`;
  }
  
  return dateStr;
}

// 문자열 또는 배열을 배열로 변환
function ensureArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export function formatAdditionalInfo(formData: FormData): string {
  let info = "";
  
  if (formData.purchaseDate) {
    info += `✔ 최초 구매일: ${parseKoreanDate(formData.purchaseDate)}\n`;
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
  
  const baseItemsArray = ensureArray(formData.baseItems);
  if (baseItemsArray.length > 0) {
    info += `✔ 기본 구성품: ${baseItemsArray.join(", ")}\n`;
  }
  
  const extraItemsArray = ensureArray(formData.extraItems);
  if (extraItemsArray.length > 0) {
    info += `✔ 별도 구성품: ${extraItemsArray.join(", ")}\n`;
  }
  
  const featuresArray = ensureArray(formData.features);
  if (featuresArray.length > 0) {
    info += `✔ 제품 특징:\n${featuresArray.join("\n")}\n`;
  }
  
  if (formData.purchasePrice) {
    info += `✔ 초기 구매가: ${formatPrice(formData.purchasePrice.toString())}\n`;
  }
  
  if (formData.askingPrice) {
    info += `✔ 판매 희망가: ${formatPrice(formData.askingPrice.toString())}\n`;
  }
  
  const tradeTypesArray = ensureArray(formData.tradeTypes);
  if (tradeTypesArray.length > 0) {
    info += `✔ 거래 방식: ${tradeTypesArray.join(", ")}\n`;
    
    // 택배거래만 선택된 경우 특별 멘트 추가
    if (tradeTypesArray.length === 1 && tradeTypesArray[0] === "택배거래") {
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
