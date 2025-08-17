pm # RENTEX

Spring Boot + React 기반 렌탈 관리 시스템  
> 백엔드와 프론트엔드를 하나의 저장소에서 통합 관리하는 **모노레포 구조**입니다.

---

## 📁 프로젝트 구조

```
📦 rentex              # 백엔드 (Spring Boot)
📦 rentex-frontend     # 프론트엔드 (React + Vite)
.gitignore             # 백+프론트 통합 .gitignore
README.md              # 프로젝트 정보 및 실행 가이드
```

---

## 🚀 실행 방법

### ✅ 백엔드 (Spring Boot)

```bash
cd rentex
./gradlew bootRun
```

> DB 설정은 `application.yml`에서 확인 (MariaDB)

---

### ✅ 프론트엔드 (React + Vite)

```bash
cd rentex-frontend
npm install
npm run dev
```

> 실행 후: http://localhost:3000

---

## 🌱 브랜치 전략

- `main`: 통합 브랜치 (배포/기준)
- `feature/*`: 기능별 개발 브랜치
  - `feature/user-auth`
  - `feature/rental-flow`
  - `feature/penalty-payment` 등

---

## 🛠 기술 스택

| 구분 | 내용 |
|------|------|
| Backend | Java 17, Spring Boot, JPA, MariaDB |
| Frontend | React, Vite, TypeScript |
| Infra | AWS EC2, RDS, GitHub Actions |
| 기타 | JWT, OAuth2, Scheduler 등 |

---

## 👥 팀 구성

| 이름 | 역할 |
|------|------|
| 승민 | 회원가입 / 로그인 / 마이페이지 |
| 민혁 | 장비 / 파트너 / 관리자 기능 |
| 영빈 | 대여 흐름 / 상태 전이 / 이력 관리 |
| 소현 | 연체 / 벌점 / 정산 / 패널티 처리 |