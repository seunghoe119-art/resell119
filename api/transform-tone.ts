import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TransformToneRequest {
  content: string;
  tone: '직장인' | '학생' | '간단한' | '용건만';
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
    const request: TransformToneRequest = req.body;

    if (!request.content || !request.tone) {
      return res.status(400).json({ error: 'Content and tone are required' });
    }

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
    const transformed = data.choices[0]?.message?.content;

    if (!transformed) {
      return res.status(500).json({ error: 'AI 응답에서 내용을 찾을 수 없습니다.' });
    }

    return res.status(200).json({ content: transformed.trim() });
  } catch (error: any) {
    console.error('Transform tone error:', error);
    return res.status(500).json({ error: error.message || '말투 변환 중 오류가 발생했습니다.' });
  }
}
