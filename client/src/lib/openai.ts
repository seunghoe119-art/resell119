import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

export interface DraftRequest {
  productName: string;
  brand?: string;
  purchaseDate?: string;
  usageCount?: number;
  condition?: string;
  conditionNote?: string;
  baseItems?: string[];
  extraItems?: string[];
  features?: string[];
  purchasePrice?: number;
  askingPrice?: number;
  tradeTypes?: string[];
  tradeArea?: string;
  nego?: string;
}

export interface TransformToneRequest {
  content: string;
  tone: '직장인' | '학생' | '간단한' | '용건만';
}

export async function generateListingDraft(request: DraftRequest): Promise<string> {
  const toneInstructions = {
    default: '친근하고 정중한 말투로 작성해주세요. 존댓말을 사용하되 너무 딱딱하지 않게 작성해주세요.',
  };

  const systemPrompt = `당신은 중고거래 판매글을 작성하는 전문가입니다. 
사용자가 제공한 제품 정보를 바탕으로 매력적이고 신뢰할 수 있는 판매글을 작성해주세요.
${toneInstructions.default}

다음 형식을 따라주세요:
- 제품명과 브랜드를 명시
- 구매 시기와 사용 횟수 언급
- 제품 상태를 구체적으로 설명
- 구성품 목록 (기본 구성품과 추가 구성품 구분)
- 가격 정보 (정가 대비 할인율 언급 가능)
- 거래 방식과 장소
- 가격 협의 가능 여부

판매글은 자연스럽고 읽기 편하게 작성하되, 과장되지 않게 작성해주세요.`;

  const userMessage = `다음 제품 정보로 판매글을 작성해주세요:

제품명: ${request.productName}
${request.brand ? `브랜드: ${request.brand}` : ''}
${request.purchaseDate ? `구매 시기: ${request.purchaseDate}` : ''}
${request.usageCount !== undefined ? `사용 횟수: ${request.usageCount}회` : ''}
${request.condition ? `제품 상태: ${request.condition}` : ''}
${request.conditionNote ? `상태 상세: ${request.conditionNote}` : ''}
${request.baseItems?.length ? `기본 구성품: ${request.baseItems.join(', ')}` : ''}
${request.extraItems?.length ? `추가 구성품: ${request.extraItems.join(', ')}` : ''}
${request.features?.length ? `특징/장점: ${request.features.join(', ')}` : ''}
${request.purchasePrice ? `구매가: ${request.purchasePrice.toLocaleString()}원` : ''}
${request.askingPrice ? `판매가: ${request.askingPrice.toLocaleString()}원` : ''}
${request.tradeTypes?.length ? `거래 방식: ${request.tradeTypes.join(', ')}` : ''}
${request.tradeArea ? `거래 장소: ${request.tradeArea}` : ''}
${request.nego ? `가격 협의: ${request.nego}` : ''}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const draft = response.data.choices[0]?.message?.content;
    if (!draft) {
      throw new Error('AI 응답에서 내용을 찾을 수 없습니다.');
    }

    return draft.trim();
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 429) {
        throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      } else if (status === 401) {
        throw new Error('API 키가 올바르지 않습니다.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      }
    }
    throw new Error(error.message || 'AI 초안 생성 중 오류가 발생했습니다.');
  }
}

export async function transformTone(request: TransformToneRequest): Promise<string> {
  const toneInstructions = {
    '직장인': '직장인 말투로 작성해주세요. 간결하고 전문적이며 예의 바른 표현을 사용하되, 너무 딱딱하지 않게 작성해주세요.',
    '학생': '학생 말투로 작성해주세요. 친근하고 가벼운 표현을 사용하되, 신뢰를 잃지 않도록 작성해주세요.',
    '간단한': '최대한 간단하고 요약된 형식으로 작성해주세요. 핵심 정보만 포함하고 불필요한 설명은 제거해주세요.',
    '용건만': '용건만 간단히 전달하는 형식으로 작성해주세요. 최소한의 정보만 포함하고 인사말이나 부가 설명 없이 작성해주세요.',
  };

  const systemPrompt = `당신은 중고거래 판매글의 말투를 변환하는 전문가입니다.
원본 판매글의 내용과 정보는 그대로 유지하되, 말투와 표현 방식만 변경해주세요.
${toneInstructions[request.tone]}

중요: 원본에 포함된 URL은 반드시 그대로 유지해주세요. URL을 변경하거나 삭제하지 마세요.`;

  const userMessage = `다음 판매글을 "${request.tone}" 말투로 변환해주세요:

${request.content}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const transformed = response.data.choices[0]?.message?.content;
    if (!transformed) {
      throw new Error('AI 응답에서 내용을 찾을 수 없습니다.');
    }

    return transformed.trim();
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 429) {
        throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      } else if (status === 401) {
        throw new Error('API 키가 올바르지 않습니다.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      }
    }
    throw new Error(error.message || '말투 변환 중 오류가 발생했습니다.');
  }
}
