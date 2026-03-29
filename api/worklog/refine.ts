import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "내용이 비어있습니다." });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API 키가 설정되지 않았습니다." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `당신은 업무일지 작성을 도와주는 AI 어시스턴트입니다. 
사용자가 입력한 업무 내용을 다음 기준으로 다듬어 주세요:
- 문장의 길이는 많이 요약하지 않음. 문장 완성도 향상
- 명확한 업무 일지 문체로 변환
- 언제, 어디서, 왜, 누가, 무엇을, 어떻게 6하원칙으로 잘 정리할 것
- 한국어로 작성
- 결과는 정리된 텍스트만 반환 (설명 없이)
- 너무 과격한 표현 등은 객관적으로 나열할 것
- 남들이 봤을 때 징징거리거나 억울해 보이지 않게 작성하되, 객관적으로 상황을 기술할 것. 인격적·인성적으로 지적하는 상황에 대해서는 그것이 문제임을 명확히 짚어줄 것`,
          },
          {
            role: "user",
            content: `다음 업무 내용을 업무일지 문체로 깔끔하게 정리해줘:\n\n${content}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "AI 요청 실패" });
    }

    const data = await response.json();
    const refined = data.choices[0]?.message?.content?.trim() ?? "";
    return res.json({ refined });
  } catch (err) {
    console.error("worklog refine error:", err);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
}
