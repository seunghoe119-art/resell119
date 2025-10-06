import axios from 'axios';

export interface GenerateDraftInput {
  productName?: string;
  brand?: string;
  briefDescription?: string;
}

export async function generateListingDraft(input: GenerateDraftInput): Promise<string> {
  console.log("Starting draft generation for:", input.briefDescription);
  
  try {
    const systemPrompt = `당신은 중고 거래 게시글 작성 AI '바이브코딩'입니다. 사용자의 요청을 받으면 즉시 완벽한 판매글 초안을 생성하는 것이 당신의 임무입니다.

[작업 지침]
- 주어진 정보를 바탕으로 판매글을 작성하세요.
- 제품에 대해 알고 있는 일반적인 정보를 활용하되, 확실하지 않은 정보는 추측하거나 지어내지 마세요.
- 질문 금지: 어떤 경우에도 사용자에게 추가 정보를 요구하거나 되묻지 마세요. 주어진 정보만으로 글을 완성해야 합니다.

[판매글 작성 규칙]
- 모든 판매글 본문은 ✔ 기호를 사용하여 항목별로 정리합니다.
- Markdown 리스트(•, -, *) 또는 번호(1., 2.)는 사용하지 않습니다.
- 일반 게시판 스타일로 작성하며, 문단은 짧게 유지하고 가독성 있게 구성합니다.
- 문구는 중고거래 플랫폼(예: 번개장터, 중고나라, 헬로마켓 등)에 적합하도록 작성
- 제품에 흠집, 이상, 미세 결함이 있는 경우, 이를 솔직하게 밝히되 '성능에는 지장 없음', '사용에는 문제 없음', '감안하면 가격 메리트 있음' 등의 긍정적 쿠션 멘트를 함께 작성합니다.
- 문구는 300자~600자 사이로 유지

각 항목은 서브 타이틀 형식으로 구성:
✔ 제품 소개 및 주요 기능
✔ 제품의 특징 (특장점 강조)
✔ 구성품 리스트
✔ 보관 상태
✔ 거래 방식


거래 방식 (고정):
직거래(인천 작전동) 또는 목동, 그외지역 채팅주세요 / 택배 거래 가능, 네고는 죄송합니다ㅎㅎ 올려진 가격으로만 팝니다.

예약 관련 안내 (고정):
예약은 예약금 2만원에만 적용되며, 직거래시에도 다른분이나 중고나라 택배거래등 먼저 입금되면 예약이 먼저 확정되는점을 양해부탁드립니다`;


    const userPrompt = `다음 제품 정보를 바탕으로 중고 판매글을 작성해주세요:

${input.briefDescription || ''}

위 내용을 바탕으로 중고 판매 게시글을 즉시 작성해주세요.
확인 질문 없이 곧바로 결과만 출력해주세요.`;


    // Clean API key: remove all non-printable and non-ASCII characters
    const apiKey = (process.env.OPENAI_API_KEY || '')
      .replace(/[\r\n\t\f\v]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
    
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    const requestData = {
      model: "gpt-5-mini",
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

export async function modifyListingContent(existingContent: string, additionalInfo: string): Promise<string> {
  console.log("Starting content modification");
  
  try {
    const systemPrompt = `너는 이미 작성된 중고 판매글을 받아서, 새로운 정보를 자연스럽게 추가하고 다듬어주는 글쓰기 전문가야.

아래 '기존 판매글'의 내용과 톤을 유지하면서, '새로 추가할 정보'를 가장 적절한 위치에 자연스럽게 녹여서 전체 글을 수정해줘.

예를 들어:
- 추가 구성품 정보는 기존 '구성품' 항목에 합쳐주고
- 추가 상태 설명은 '보관 상태' 항목에 자연스럽게 녹여줘
- 거래방식이나 거래 장소도 자연스럽게 글에 녹여줘
- 가격 정보가 추가되면 적절한 위치에 반영해줘

기존 글의 구조와 ✔ 기호 사용 방식을 그대로 유지하면서, 새 정보를 자연스럽게 통합해줘.`;

    const userPrompt = `기존 판매글:
${existingContent}

새로 추가할 정보:
${additionalInfo}

위의 기존 판매글에 새로운 정보를 자연스럽게 추가하여 수정된 판매글을 작성해줘.`;

    // Clean API key: remove all non-printable and non-ASCII characters
    const apiKey = (process.env.OPENAI_API_KEY || '')
      .replace(/[\r\n\t\f\v]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
    
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    const requestData = {
      model: "gpt-5-mini",
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
      
      const newError: any = new Error("AI content modification failed");
      newError.status = status;
      newError.code = code;
      throw newError;
    }
    
    console.error("AI content modification error:", error.message);
    throw new Error("AI content modification failed");
  }
}
