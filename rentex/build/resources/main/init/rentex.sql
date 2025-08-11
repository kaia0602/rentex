-- 💣 기존 데이터 삭제 방지 (원하면 DELETE 문 주석 해제 가능)
-- DELETE FROM rental;
-- DELETE FROM item;
-- DELETE FROM user;
-- DELETE FROM partner;
-- DELETE FROM category;

-- 0. 카테고리

ALTER TABLE category AUTO_INCREMENT = 1;
ALTER TABLE category ADD UNIQUE (name);

ALTER TABLE sub_category AUTO_INCREMENT = 1;
ALTER TABLE sub_category ADD UNIQUE (category_id, name);

INSERT IGNORE INTO category (name) VALUES
                                ('촬영/미디어'), ('캠핑/레저'), ('행사/전시/무대'), ('가전/생활/사무'), ('기타/기타장비');

INSERT IGNORE INTO sub_category (category_id, name) VALUES
                                                 (1, '카메라'), (1, '렌즈'), (1, '삼각대'), (1, '짐벌'), (1, '조명'), (1, '마이크'), (1, '드론'), (1, '오디오 레코더'), (1, '모니터'),
                                                 (2, '텐트'), (2, '캠핑의자/테이블'), (2, '침낭/매트'), (2, '버너/그릴'), (2, '전기쿨러'), (2, '랜턴'), (2, '캠핑박스'), (2, '야외조리도구'),
                                                 (3, '음향 시스템'), (3, '조명 시스템'), (3, '배너/입간판'), (3, '의자/테이블'), (3, '텐트/부스'), (3, '무대 구조물'), (3, '전시 패널'),
                                                 (4, '노트북'), (4, '모니터'), (4, '청소기'), (4, '빔프로젝터'), (4, '에어컨/냉장고'), (4, '프린터'), (4, '의자/책상'),
                                                 (5, '공구세트'), (5, '디지털계측기'), (5, '보호장비'), (5, '차량용 보조배터리'), (5, '기타');

-- 1. 파트너
INSERT IGNORE INTO partner (id, name, business_no, contact_email, contact_phone, created_at)
VALUES
    (1, '렌텍스테크', '123-45-67890', 'tech@rentex.com', '02-1234-5678', NOW()),
    (2, '에이치렌탈', '987-65-43210', 'hrental@rentex.com', '031-9876-5432', NOW());

-- 2. 사용자
INSERT IGNORE INTO user (id, email, password, name, nickname, role, created_at, updated_at)
VALUES
    (1, 'user1@rentex.com', '$2a$10$Dow1dZegFfNyQ2Q8qYMK8u9B9m8cPQgE1zLOKMGdCjHh5QiNvxtlW', '홍길동', '길동이', 'USER', NOW(), NOW()),
    (2, 'partner1@rentex.com', '$2a$10$Dow1dZegFfNyQ2Q8qYMK8u9B9m8cPQgE1zLOKMGdCjHh5QiNvxtlW', '박파트너', '렌탈왕', 'PARTNER', NOW(), NOW()),
    (3, 'admin@rentex.com', '$2a$10$Dow1dZegFfNyQ2Q8qYMK8u9B9m8cPQgE1zLOKMGdCjHh5QiNvxtlW', '관리자', '운영자', 'ADMIN', NOW(), NOW());

-- 3. 장비
INSERT IGNORE INTO item (id, name, description, stock_quantity, status, partner_id, created_at, updated_at, category_id, sub_category_id)
VALUES
    (1, 'DSLR 카메라', '고화질 카메라입니다.', 10, 'AVAILABLE', 1, NOW(), NOW(), 1, 7),
    (2, '4K 드론', '촬영용 드론입니다.', 5, 'AVAILABLE', 1, NOW(), NOW(), 1, 1),
    (3, '삼각대', '튼튼한 삼각대입니다.', 20, 'UNAVAILABLE', 2, NOW(), NOW(),1 ,1);
