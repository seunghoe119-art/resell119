import axios from 'axios';

export interface GenerateDraftInput {
  productName?: string;
  brand?: string;
  briefDescription?: string;
}

export async function generateListingDraft(input: GenerateDraftInput): Promise<string> {
  console.log("Starting draft generation for:", input.briefDescription);
  
  try {
    const systemPrompt = `Context(맥락):
목표 (Goal): 중고 전자기기(예: 드론, 카메라, 태블릿 등)를 판매하고자 하는 사람들을 위해 제품 소개 문구를 자동으로 생성합니다. 이 문구는 중고거래 플랫폼에 올릴 수 있는 소개글 형식으로 구성되어야 하며, 판매자의 신뢰도를 높이고 구매자에게 제품 정보를 빠르게 전달할 수 있도록 도와줍니다.

Instructions (지침):
- 모든 판매글 본문은 ✔ 기호를 사용하여 항목별로 정리합니다.
- Markdown 리스트(•, -, *) 또는 번호(1., 2.)는 사용하지 않습니다.
- 일반 게시판 스타일로 작성하며, 문단은 짧게 유지하고 가독성 있게 구성합니다.
- 사용자가 입력한 제품명과 간략한 설명을 바탕으로 중고 판매용 문구를 생성할 것
- 문구는 중고거래 플랫폼(예: 번개장터, 중고나라, 헬로마켓 등)에 적합하도록 작성
- 제품에 흠집, 이상, 미세 결함이 있는 경우, 이를 솔직하게 밝히되 '성능에는 지장 없음', '사용에는 문제 없음', '감안하면 가격 메리트 있음' 등의 긍정적 쿠션 멘트를 함께 작성합니다.
- 구성품 정보가 없으면 예시 문구 사용, 제공 시 정확히 반영.

각 항목은 서브 타이틀 형식으로 구성:
✔ 제품 소개 및 주요 기능
✔ 제품의 특징 (특장점 강조)
✔ 구성품 리스트
✔ 보관 상태
✔ 배터리 사이클
✔ 거래 방식

Constraints(제약사항):
- 제품 미입력 시 문구 생성 금지
- 문구는 300자~600자 사이로 유지
- 단락 구분은 보기 쉽게
- 배터리 정보 입력 없을 시 "사이클 관련 언급 없음, 상태 양호함" 작성
- 항상 한국어로 답변

거래 방식 (고정):
직거래(인천 작전동) 또는 목동, 그외지역 채팅주세요 / 택배 거래 가능, 네고는 죄송합니다ㅎㅎ 올려진 가격으로만 팝니다.`;

    const userPrompt = `다음 제품 정보를 바탕으로 중고 판매글을 작성해주세요:

${input.briefDescription || ''}

위 내용을 바탕으로 중고 판매 게시글을 작성해주세요. 제품의 한국 발매가도 검색해서 포함해주세요.`;

    // Clean API key: remove all non-printable and non-ASCII characters
    const apiKey = (process.env.OPENAI_API_KEY || '')
      .replace(/[\r\n\t\f\v]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
    
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    const requestData = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    };

    const response = await axios.post("https://api.openai.com/v1/chat/completions", requestData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      timeout: 30000,
    });

    const result = response.data.choices[0].message.content || "";
    return result;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const code = error.code;
      console.error(`OpenAI API error: status=${status}, code=${code}`);
      
      const newError: any = new Error("AI draft generation failed");
      newError.status = status;
      newError.code = code;
      throw newError;
    }
    
    console.error("AI draft generation error:", error.message);
    throw new Error("AI draft generation failed");
  }
}
