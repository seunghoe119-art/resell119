import type { VercelRequest, VercelResponse } from '@vercel/node';

interface DraftRequest {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' });
  }

  try {
    const request: DraftRequest = req.body;

    if (!request.productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        return res.status(429).json({ error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' });
      } else if (response.status === 401) {
        return res.status(401).json({ error: 'API 키가 올바르지 않습니다.' });
      }
      return res.status(response.status).json({ error: errorData.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();
    const draft = data.choices[0]?.message?.content;

    if (!draft) {
      return res.status(500).json({ error: 'AI 응답에서 내용을 찾을 수 없습니다.' });
    }

    return res.status(200).json({ draft: draft.trim() });
  } catch (error: any) {
    console.error('Generate draft error:', error);
    return res.status(500).json({ error: error.message || 'AI 초안 생성 중 오류가 발생했습니다.' });
  }
}
