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
  try {
    const response = await fetch('/api/generate-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI 초안 생성 중 오류가 발생했습니다.');
    }

    const data = await response.json();
    return data.draft;
  } catch (error: any) {
    throw new Error(error.message || 'AI 초안 생성 중 오류가 발생했습니다.');
  }
}

export async function transformTone(request: TransformToneRequest): Promise<string> {
  try {
    const response = await fetch('/api/transform-tone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '말투 변환 중 오류가 발생했습니다.');
    }

    const data = await response.json();
    return data.content;
  } catch (error: any) {
    throw new Error(error.message || '말투 변환 중 오류가 발생했습니다.');
  }
}
