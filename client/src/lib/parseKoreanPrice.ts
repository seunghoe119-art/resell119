
export function parseKoreanPrice(input: string, exchangeRate: number = 1450): number | null {
  if (!input || input.trim() === '') {
    return null;
  }

  let trimmed = input.trim();

  // 원화가 괄호 밖에 있으면 원화 우선 (예: "100,000원 (약 $70)")
  const wonOutsideParenMatch = trimmed.match(/^([^(]*원)/);
  if (wonOutsideParenMatch) {
    // 괄호 밖에 원화가 있으므로 원화로 파싱
    trimmed = wonOutsideParenMatch[1].trim();
  } else {
    // 원화가 괄호 밖에 없으면 USD 패턴 체크
    // 패턴: "약 $70", "$100", "100 USD", "USD 약 100" 등
    const dollarPatterns = [
      /\$\s*(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i,           // $100, $ 약 70, $약 70
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*\$/i,                     // 100$
      /달러\s*(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i,         // 달러 100, 달러 약 70
      /(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)\s*달러/i,         // 100달러, 약 100달러
      /USD\s*(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i,          // USD 100, USD 약 70
      /(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)\s*USD/i,          // 100 USD, 약 100 USD
      /usd\s*(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i,          // usd 100, usd 약 70
      /(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)\s*usd/i,          // 100 usd, 약 100 usd
      /dollar\s*(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i,       // dollar 100, dollar 약 70
      /(?:약\s*)?(\d+(?:,\d+)*(?:\.\d+)?)\s*dollar/i,       // 100 dollar, 약 100 dollar
    ];

    for (const pattern of dollarPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const dollarAmount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(dollarAmount)) {
          return Math.round(dollarAmount * exchangeRate);
        }
      }
    }

    // USD 패턴도 없고 원화가 있으면 원화 파싱 (괄호 안 포함)
    if (trimmed.includes('원')) {
      // 전체 문자열에서 원화 금액 추출 (괄호 안 포함)
      const wonMatch = trimmed.match(/(\d[\d,]*(?:\.\d+)?(?:[만천백십억]+)?)\s*원/);
      if (wonMatch) {
        trimmed = wonMatch[0];  // "100,000원" 또는 "50만원" 형태로 추출
      }
    }
  }

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
