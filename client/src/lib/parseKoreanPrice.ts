
export function parseKoreanPrice(input: string): number | null {
  if (!input || input.trim() === '') {
    return null;
  }

  const trimmed = input.trim();

  // 이미 숫자인 경우 (쉼표 제거)
  const numericValue = Number(trimmed.replace(/,/g, ''));
  if (!isNaN(numericValue) && /^\d+$/.test(trimmed.replace(/,/g, ''))) {
    return numericValue;
  }

  // "만원", "천원" 특수 케이스
  if (trimmed === '만원') {
    return 10000;
  }
  if (trimmed === '천원') {
    return 1000;
  }

  // 아라비아 숫자 + 한글 단위 조합 처리 (예: "3천원", "50만원", "3천5백원")
  let text = trimmed.replace(/원$/, '');
  
  // 아라비아 숫자가 포함된 경우
  if (/\d/.test(text)) {
    let result = 0;
    
    // 억 단위 처리
    if (text.includes('억')) {
      const parts = text.split('억');
      const billions = parseInt(parts[0].replace(/[^\d]/g, '')) || 1;
      result += billions * 100000000;
      text = parts[1] || '';
    }
    
    // 만 단위 처리
    if (text.includes('만')) {
      const parts = text.split('만');
      const tenThousands = parseInt(parts[0].replace(/[^\d]/g, '')) || 1;
      result += tenThousands * 10000;
      text = parts[1] || '';
    }
    
    // 천 단위 처리
    if (text.includes('천')) {
      const parts = text.split('천');
      const thousands = parseInt(parts[0].replace(/[^\d]/g, '')) || 1;
      result += thousands * 1000;
      text = parts[1] || '';
    }
    
    // 백 단위 처리
    if (text.includes('백')) {
      const parts = text.split('백');
      const hundreds = parseInt(parts[0].replace(/[^\d]/g, '')) || 1;
      result += hundreds * 100;
      text = parts[1] || '';
    }
    
    // 십 단위 처리
    if (text.includes('십')) {
      const parts = text.split('십');
      const tens = parseInt(parts[0].replace(/[^\d]/g, '')) || 1;
      result += tens * 10;
      text = parts[1] || '';
    }
    
    // 남은 숫자 처리
    const remaining = parseInt(text.replace(/[^\d]/g, ''));
    if (!isNaN(remaining)) {
      result += remaining;
    }
    
    return result > 0 ? result : null;
  }

  // 한글 숫자 매핑 (기존 로직)
  const koreanNumbers: { [key: string]: number } = {
    '영': 0, '일': 1, '이': 2, '삼': 3, '사': 4,
    '오': 5, '육': 6, '칠': 7, '팔': 8, '구': 9
  };

  const units: { [key: string]: number } = {
    '십': 10,
    '백': 100,
    '천': 1000,
    '만': 10000,
    '억': 100000000
  };

  let result = 0;
  let currentNumber = 0;
  let currentUnit = 1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (koreanNumbers.hasOwnProperty(char)) {
      currentNumber = koreanNumbers[char];
    } else if (units.hasOwnProperty(char)) {
      const unit = units[char];
      
      if (char === '만' || char === '억') {
        if (currentNumber === 0) {
          currentNumber = 1;
        }
        result += currentNumber * currentUnit * unit;
        currentNumber = 0;
        currentUnit = 1;
      } else {
        if (currentNumber === 0) {
          currentNumber = 1;
        }
        currentUnit = unit;
        result += currentNumber * currentUnit;
        currentNumber = 0;
        currentUnit = 1;
      }
    }
  }

  if (currentNumber > 0) {
    result += currentNumber * currentUnit;
  }

  return result > 0 ? result : null;
}

export function formatPrice(input: string): string {
  if (!input || input.trim() === '') {
    return '';
  }

  const parsedPrice = parseKoreanPrice(input);
  
  if (parsedPrice !== null) {
    return `${parsedPrice.toLocaleString()}원`;
  }

  return input;
}
