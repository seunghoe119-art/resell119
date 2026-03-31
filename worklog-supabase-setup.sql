-- 업무일지 테이블 생성
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- ① 메인 업무일지 테이블
CREATE TABLE IF NOT EXISTS work_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date      TEXT        NOT NULL,
  author        TEXT        NOT NULL,
  department    TEXT        NOT NULL DEFAULT '',
  entries       JSONB       NOT NULL DEFAULT '[]',
  tomorrow_plan TEXT        NOT NULL DEFAULT '',
  free_memo     TEXT        NOT NULL DEFAULT '',
  secret        TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(log_date, author)
);

ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "work_logs_all" ON work_logs
  FOR ALL USING (true) WITH CHECK (true);


-- ② 더미 백업 테이블 (더미 팝업 > 백업 저장 버튼)
CREATE TABLE IF NOT EXISTS dummy_backups (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author     TEXT        NOT NULL,
  content    TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE dummy_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dummy_backups_all" ON dummy_backups
  FOR ALL USING (true) WITH CHECK (true);


-- ③ 참고 문헌(숨겨진 글) 백업 테이블 (의용소방대 법률 버튼)
CREATE TABLE IF NOT EXISTS secret_backups (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author     TEXT        NOT NULL,
  log_date   TEXT        NOT NULL,
  content    TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE secret_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "secret_backups_all" ON secret_backups
  FOR ALL USING (true) WITH CHECK (true);
