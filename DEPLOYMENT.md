# 배포 가이드

## Vercel 배포 (권장)

### 개요

이 프로젝트는 Vercel에 배포할 수 있도록 구성되어 있습니다. 프론트엔드는 정적 파일로 빌드되고, OpenAI API 호출은 Vercel 서버리스 함수를 통해 안전하게 처리됩니다.

### 배포 단계

#### 1. GitHub 저장소 준비

1. GitHub에 저장소 생성
2. 로컬 프로젝트를 GitHub에 푸시:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/사용자명/저장소명.git
   git branch -M main
   git push -u origin main
   ```

#### 2. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. Import 클릭

#### 3. 환경변수 설정 (중요!)

Vercel 프로젝트 Settings → Environment Variables 에서 다음 변수들을 추가:

**필수 환경변수:**

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 (서버 측) | `sk-...` |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | `eyJ...` |

**주의사항:**
- `OPENAI_API_KEY`는 서버리스 함수에서 사용되므로 `VITE_` 접두사 없이 설정합니다
- Supabase 관련 키는 클라이언트에서 사용되므로 `VITE_` 접두사가 필요합니다

#### 4. 배포

환경변수 설정 후 "Deploy" 버튼을 클릭하면 자동으로 배포됩니다.

배포가 완료되면 `https://프로젝트명.vercel.app`에서 접속 가능합니다.

### 프로젝트 구조

```
├── api/                      # Vercel 서버리스 함수
│   ├── generate-draft.ts     # AI 초안 생성 API
│   └── transform-tone.ts     # 말투 변환 API
├── client/                   # 프론트엔드 소스
│   └── src/
├── vercel.json              # Vercel 설정
└── vite.config.vercel.ts    # Vercel용 Vite 설정
```

### 문제 해결

#### 빌드 실패

- Vercel 대시보드의 "Deployments" 탭에서 로그 확인
- 환경변수가 올바르게 설정되었는지 확인

#### API 호출 실패

- 브라우저 개발자 도구에서 네트워크 탭 확인
- Vercel Functions 로그에서 에러 확인
- `OPENAI_API_KEY`가 올바르게 설정되었는지 확인

#### 404 에러

- `vercel.json`의 rewrites 설정 확인
- SPA 라우팅이 올바르게 처리되는지 확인

---

## GitHub Pages 배포 (대안)

### 개요

이 프로젝트는 Supabase를 데이터베이스로, OpenAI를 AI 서비스로 사용하여 **정적 호스팅**만으로 GitHub Pages에 배포할 수 있습니다.

**주의:** GitHub Pages 배포 시 OpenAI API 키가 클라이언트에 노출됩니다. 보안이 중요한 경우 Vercel 배포를 권장합니다.

### 배포 단계

#### 1. GitHub 저장소 준비

1. GitHub에 저장소 생성
2. 로컬 프로젝트를 GitHub에 푸시:
   ```bash
   git remote add origin https://github.com/사용자명/저장소명.git
   git branch -M main
   git push -u origin main
   ```

#### 2. GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions 에서 다음 시크릿 추가:

- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon public key  
- `VITE_OPENAI_API_KEY`: OpenAI API 키

#### 3. GitHub Pages 활성화

1. 저장소 Settings → Pages
2. Source를 **GitHub Actions**로 설정
3. 저장

#### 4. 배포

코드를 `main` 브랜치에 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

배포가 완료되면 `https://사용자명.github.io/저장소명/`에서 접속 가능합니다.

### 주의사항

#### 빌드 스크립트

현재 `package.json`에 `build:static` 스크립트가 필요합니다:

```json
{
  "scripts": {
    "build:static": "vite build"
  }
}
```

위 스크립트를 `package.json`에 수동으로 추가해주세요.

#### 환경변수

- 모든 환경변수는 `VITE_` 접두사가 필요합니다
- GitHub Actions Secrets에 저장하면 빌드 시 자동으로 주입됩니다
- 프론트엔드 코드에서 `import.meta.env.VITE_변수명`으로 접근

#### Supabase RLS (Row Level Security)

Supabase의 RLS 정책이 제대로 설정되어 있는지 확인하세요. 
`supabase-setup.sql` 파일에 정의된 정책을 Supabase SQL Editor에서 실행했는지 확인하세요.

### 문제 해결

#### 빌드 실패

- GitHub Actions 탭에서 로그 확인
- Secrets가 올바르게 설정되었는지 확인
- `build:static` 스크립트가 `package.json`에 있는지 확인

#### 배포 후 404 에러

- GitHub Pages 설정에서 Source가 **GitHub Actions**로 설정되어 있는지 확인
- `vite.config.ts`의 `base` 설정 확인 (현재는 `/`로 설정됨)
- 저장소 이름이 경로에 포함되어야 한다면 `base: '/저장소명/'`으로 변경

#### API 호출 실패

- 브라우저 콘솔에서 환경변수 확인
- Supabase RLS 정책 확인
- OpenAI API 키 유효성 확인
