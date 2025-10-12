import { parseKoreanPrice } from './parseKoreanPrice';

export interface ExtractedPrice {
  cleanedDescription: string;
  price: number | null;
}

export function extractPriceFromDescription(description: string): ExtractedPrice {
  if (!description) {
    return { cleanedDescription: description, price: null };
  }

  // "00"으로 시작하는 가격 패턴 찾기
  // 패턴: 00 + (숫자/한글숫자/텍스트 가격)
  // 예: "오즈모모바일 팝니다 00십삼만원", "오즈모모바일팝니다00130000", "오즈모모바일팝니다 0085달러"
  
  // 한글 숫자 포함: 영일이삼사오육칠팔구십백천만억조
  const pricePattern = /00([0-9\s\,\.만천백십억조원달러유로엔파운드영일이삼사오육칠팔구]+)/i;
  const match = description.match(pricePattern);

  if (!match) {
    return { cleanedDescription: description, price: null };
  }

  const priceText = match[1].trim();
  const fullMatch = match[0];

  // 가격 파싱
  const parsedPrice = parseKoreanPrice(priceText);

  // "00가격" 부분을 제거한 설명문
  const cleanedDescription = description.replace(fullMatch, '').trim();

  return {
    cleanedDescription,
    price: parsedPrice,
  };
}
