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
      model: "gpt-4o-mini",
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
      timeout: 60000,
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
      model: "gpt-4o-mini",
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
      timeout: 60000,
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

export interface GenerateTitlesInput {
  productName?: string;
  brand?: string;
  condition?: string;
  features?: string;
  aiDraft?: string;
}

export interface TransformToneInput {
  content: string;
  toneType: string;
}

export async function transformTone(input: TransformToneInput): Promise<string> {
  console.log("Starting tone transformation with type:", input.toneType);
  
  try {
    const tonePrompts: { [key: string]: string } = {
      professional: `격식있고 전문적인 직장인의 말투로 변환해줘. 
존댓말을 사용하고, 정중하고 세련된 표현을 사용해. 
하지만 너무 딱딱하지 않게 적당히 부드럽게 작성해줘.`,
      
      student: `친근하고 캐주얼한 학생의 말투로 변환해줘. 
반말을 사용하고, 편안하고 친근한 표현을 사용해. 
이모티콘이나 유행어는 사용하지 말고, 자연스럽게 작성해줘.`,
      
      simple: `핵심 정보만 간결하게 전달하는 말투로 변환해줘.
불필요한 설명이나 부연 설명을 모두 제거하고, 필수 정보만 남겨.
짧고 명확하게 작성해줘.`,
      
      brief: `용건만 간단히 전달하는 말투로 변환해줘.
인사말, 추가 설명, 감정 표현 등을 모두 제거하고,
사실과 정보만 나열해줘. 최대한 짧게 작성해줘.`
    };
    
    const tonePrompt = tonePrompts[input.toneType] || tonePrompts.simple;
    
    const systemPrompt = `당신은 중고 거래 판매글의 말투를 변환하는 AI입니다.

중요한 규칙:
1. 말투만 변경하고, 핵심 정보(제품명, 가격, 상태, 구성품 등)는 절대 변경하거나 삭제하지 마세요.
2. 홈페이지 주소나 URL이 있으면 그대로 유지하세요.
3. ✔ 기호를 사용한 항목 구조는 그대로 유지하세요.
4. 제품의 특징이나 상태 정보는 모두 보존하세요.
5. 숫자, 날짜, 모델명 등은 원본 그대로 유지하세요.

${tonePrompt}`;

    const userPrompt = `다음 판매글을 지정된 말투로 변환해줘:

${input.content}

위 내용의 말투를 변환해서 출력해줘.`;

    const apiKey = (process.env.OPENAI_API_KEY || '')
      .replace(/[\r\n\t\f\v]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
    
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    const requestData = {
      model: "gpt-4o-mini",
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
      timeout: 60000,
    });

    const result = response.data.choices[0].message.content || "";
    return result;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const code = error.code;
      console.error(`OpenAI API error: status=${status}, code=${code}`);
      
      const newError: any = new Error("AI tone transformation failed");
      newError.status = status;
      newError.code = code;
      throw newError;
    }
    
    console.error("AI tone transformation error:", error.message);
    throw new Error("AI tone transformation failed");
  }
}

export async function generateTitles(input: GenerateTitlesInput): Promise<string[]> {
  console.log("Starting title generation");
  
  try {
    const systemPrompt = `짧고 임팩트 있는 제목을 뽑는 것이 목표입니다.

Context:  
- 사용자가 입력한 제품명, 상태, 구성품, 특징을 기반으로 제목을 생성합니다.  
- 중고거래 플랫폼(예: 번개장터, 당근, 중고나라 등)에 올릴 때 클릭을 유도할 만한 문체로 작성해야 합니다.  
- 브랜드명, 모델명, 상태(예: 새것같음, 미개봉, A급 등), 주요 키워드(예: 구성품풀세트, 가격대비최상) 등을 포함합니다.  
- 제목은 35자 이내로 concise하게 작성합니다.  

제목 구성 패턴:
[브랜드/기기명] + [세대 또는 모델명] + [상태 강조 (A급/미개봉 등)] + [강조 포인트 (풀박/급처/구성품 등)] + [구매 유도 문구 (시세↓/빠른 거래 등)]

예시:
- 갤럭시 Z 플립4 · 상태A급 · 구성품풀세트 · 시세↓ 빠른판매
- Z플립4 · 박스풀구성 · 생활기스 無 · 급처합니다
- 갤럭시 Z플립4 256GB · 외관깨끗 · 직거래 환영
- 삼성 Z플립 중고 · 미개봉급 컨디션 · 저렴히 팝니다

내부 알고리즘 기준:
- 기기명 & 브랜드명은 무조건 포함 → 검색 최우선
- 모델 세대(예: 플립3/플립4) → 시세 구분에 핵심
- 상태 강조 키워드 → 클릭 유도 ("상태A급", "생활기스 無" 등)
- 급처/시세↓/빠른판매 → 구매욕 유발 문구 삽입
- 구성품 강조 → '가성비' 매력 상승
- 불필요한 문장부호, 과도한 이모티콘은 쓰지 않습니다.

제약사항:
- 제목에 가격을 적지 않습니다.
- 정확히 3개의 제목을 생성합니다.
- 각 제목은 클릭 유도형, 깔끔한 정보형, 감성형으로 각각 다르게 작성합니다.
- 중간점(·) 기호를 사용하지 않습니다. 대신 쉼표(,), 띄어쓰기, 또는 다른 구분자를 사용합니다.`;

    const userPrompt = `다음 정보를 바탕으로 중고판매글 제목을 3개 제안해줘.

제품 정보:
${input.productName ? `제품명: ${input.productName}\n` : ''}${input.brand ? `브랜드: ${input.brand}\n` : ''}${input.condition ? `상태: ${input.condition}\n` : ''}${input.features ? `특징: ${input.features}\n` : ''}${input.aiDraft ? `\n판매글 내용:\n${input.aiDraft}\n` : ''}

각 제목은 줄바꿈으로 구분하여 출력해줘. 번호나 다른 표시 없이 제목만 출력해줘.`;

    const apiKey = (process.env.OPENAI_API_KEY || '')
      .replace(/[\r\n\t\f\v]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
    
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    const requestData = {
      model: "gpt-4o-mini",
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
      timeout: 60000,
    });

    const result = response.data.choices[0].message.content || "";
    const titles = result.split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.length <= 50)
      .slice(0, 3);
    
    return titles;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const code = error.code;
      console.error(`OpenAI API error: status=${status}, code=${code}`);
      
      const newError: any = new Error("AI title generation failed");
      newError.status = status;
      newError.code = code;
      throw newError;
    }
    
    console.error("AI title generation error:", error.message);
    throw new Error("AI title generation failed");
  }
}
