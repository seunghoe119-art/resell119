-- 업무일지 테이블 생성
-- Supabase 대시보드 > SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date TEXT NOT NULL,
  author TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  entries JSONB NOT NULL DEFAULT '[]',
  tomorrow_plan TEXT NOT NULL DEFAULT '',
  free_memo TEXT NOT NULL DEFAULT '',
  secret TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(log_date, author)
);

ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "work_logs_all" ON work_logs
  FOR ALL USING (true) WITH CHECK (true);
