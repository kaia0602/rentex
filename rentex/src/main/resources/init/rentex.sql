-- 💣 기존 데이터 삭제 방지 (원하면 DELETE 문 주석 해제 가능)
-- DELETE FROM rental;
-- DELETE FROM item;
-- DELETE FROM user;
-- DELETE FROM partner;
-- DELETE FROM category;

-- 0. 카테고리
INSERT IGNORE INTO category (id, name) VALUES (1, '카메라'), (2, '드론'), (3, '삼각대');

-- 1. 모든 사용자(일반, 파트너, 관리자)의 기본 정보를 USER 테이블에 먼저 삽입합니다.
-- 비밀번호는 모두 'password123'을 암호화한 값입니다.
INSERT IGNORE INTO user (id, email, password, name, nickname, role, created_at, updated_at)
VALUES
    (1, 'user1@rentex.com', '$2a$10$Dow1dZegFfNyQ2Q8qYMK8u9B9m8cPQgE1zLOKMGdCjHh5QiNvxtlW', '홍길동', '길동이', 'USER', NOW(), NOW()),
    (2, 'partner1@rentex.com', '$2a$10$Dow1dZegFfNyQ2Q8qYMK8u9B9m8cPQgE1zLOKMGdCjHh5QiNvxtlW', '박파트너', '렌탈왕', 'PARTNER', NOW(), NOW()),
    (3, 'admin@rentex.com', '$2a$10$Dow1dZegFfNyQ2Q8qYMK8u9B9m8cPQgE1zLOKMGdCjHh5QiNvxtlW', '관리자', '운영자', 'ADMIN', NOW(), NOW());


-- 2. PARTNER 사용자의 ID를 사용하여 PARTNER 테이블에 추가 정보를 삽입합니다.
INSERT IGNORE INTO partner (id, business_no, contact_email, contact_phone) VALUES
(2, '123-45-67890', 'partner1@rentex.com', '02-1234-5678'),
(4, '987-65-43210', 'partner2@rentex.com', '031-9876-5432');


-- 3. ADMIN 사용자의 ID를 사용하여 ADMIN 테이블에 추가 정보를 삽입합니다.
INSERT IGNORE INTO admin (id, admin_role) VALUES
(3, 'SUPER_ADMIN');


-- 4. 장비 정보를 삽입합니다. (partner_id가 위 partner 테이블에 존재하는 ID와 일치해야 합니다.)
INSERT IGNORE INTO item (id, name, description, stock_quantity, status, partner_id, created_at, updated_at) VALUES
(1, 'DSLR 카메라', '고화질 카메라입니다.', 10, 'AVAILABLE', 2, NOW(), NOW()),
(2, '4K 드론', '촬영용 드론입니다.', 5, 'AVAILABLE', 2, NOW(), NOW()),
(3, '삼각대', '튼튼한 삼각대입니다.', 20, 'UNAVAILABLE', 4, NOW(), NOW());