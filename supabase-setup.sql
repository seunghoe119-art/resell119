-- Supabase 테이블 생성 스크립트
-- Supabase 대시보드에서 SQL Editor를 통해 실행하세요

-- 기존 테이블이 있다면 삭제 (주의: 데이터가 삭제됩니다!)
DROP TABLE IF EXISTS resell_posts;

-- posts 테이블 생성
CREATE TABLE resell_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  product_name TEXT NOT NULL,
  brand TEXT,
  purchase_date TEXT,
  usage_count INTEGER,
  condition TEXT,
  condition_note TEXT,
  base_items TEXT[],
  extra_items TEXT[],
  features TEXT[],
  purchase_price INTEGER,
  asking_price INTEGER,
  secret_purchase_price INTEGER,
  trade_types TEXT[],
  trade_area TEXT,
  nego TEXT,
  ai_draft TEXT,
  pending_draft TEXT,
  final_draft TEXT
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_resell_posts_created_at ON resell_posts(created_at DESC);
CREATE INDEX idx_resell_posts_product_name ON resell_posts(product_name);

-- Row Level Security (RLS) 활성화
ALTER TABLE resell_posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON resell_posts
  FOR SELECT USING (true);

-- 모든 사용자가 삽입 가능
CREATE POLICY "Enable insert access for all users" ON resell_posts
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 업데이트 가능
CREATE POLICY "Enable update access for all users" ON resell_posts
  FOR UPDATE USING (true);

-- 모든 사용자가 삭제 가능
CREATE POLICY "Enable delete access for all users" ON resell_posts
  FOR DELETE USING (true);
