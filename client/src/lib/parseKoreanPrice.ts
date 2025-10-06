export function parseKoreanPrice(input: string): number | null {
  if (!input || input.trim() === '') {
    return null;
  }

  const trimmed = input.trim();

  // 이미 숫자인 경우
  const numericValue = Number(trimmed.replace(/,/g, ''));
  if (!isNaN(numericValue)) {
    return numericValue;
  }

  // "만원", "천원" 특수 케이스
  if (trimmed === '만원') {
    return 10000;
  }
  if (trimmed === '천원') {
    return 1000;
  }

  // 한글 숫자 매핑
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

  // "원" 제거
  let text = trimmed.replace(/원$/, '');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (koreanNumbers.hasOwnProperty(char)) {
      currentNumber = koreanNumbers[char];
    } else if (units.hasOwnProperty(char)) {
      const unit = units[char];
      
      if (char === '만' || char === '억') {
        // 만, 억은 큰 단위이므로 현재까지 계산한 값에 곱함
        if (currentNumber === 0) {
          currentNumber = 1;
        }
        result += currentNumber * currentUnit * unit;
        currentNumber = 0;
        currentUnit = 1;
      } else {
        // 십, 백, 천
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

  // 남은 숫자 처리
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

  // 파싱 실패 시 원본 반환
  return input;
}
