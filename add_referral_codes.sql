-- profiles テーブルに紹介コード (referral_code) を追加

-- 1. 既存ユーザーにランダムな4桁のコードを生成して割り当てる関数
create or replace function generate_referral_code()
returns text as $$
declare
    chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 誤認しやすい I, O, 0, 1 を除外した 32文字
    new_code text;
    is_unique bool;
begin
    loop
        new_code := '';
        for i in 1..4 loop
            new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        end loop;
        
        -- 重複がないか確認
        select not exists (select 1 from profiles where referral_code = new_code) into is_unique;
        if is_unique then
            return new_code;
        end if;
    end loop;
end;
$$ language plpgsql;

-- 2. カラム追加（デフォルト値として関数を設定）
alter table profiles
add column if not exists referral_code text default generate_referral_code();

-- 3. ユニーク制約用のインデックス
create unique index if not exists idx_profiles_referral_code_unique 
on profiles(referral_code);

-- 4. 既存ユーザー（すでにあるレコード）にコードを割り当てる（もしnullなら）
update profiles
set referral_code = generate_referral_code()
where referral_code is null;

-- 5. カラムにコメント追加
comment on column profiles.referral_code is 'URL短縮用の紹介コード（例: A7B2）';

