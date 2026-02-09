-- Add address column to events table
-- 場所と住所を分離するための変更

ALTER TABLE events ADD COLUMN address TEXT;

-- 既存データの移行: locationの内容をaddressにコピー（住所が入っている可能性があるため）
-- UPDATE events SET address = location WHERE address IS NULL;

COMMENT ON COLUMN events.location IS '場所名（施設名）';
COMMENT ON COLUMN events.address IS '住所（詳細な住所）';
