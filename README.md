# Refit - 지속가능한 패션 플랫폼

Refit은 중고 의류 판매 및 기부 플랫폼으로, 지속가능한 패션을 위한 의류 거래 서비스를 제공합니다.

## 🏗️ 프로젝트 구조

```
refit/
├── refit_backend/     # Spring Boot 백엔드
├── refit_front/       # React 프론트엔드
└── refit_chatbot/     # Python 챗봇 서버
```

## 🚀 실행 방법

### 📋 사전 준비

#### 1. 데이터베이스 설정 (MySQL Workbench)

```sql
-- 데이터베이스 생성
CREATE DATABASE refitdb;

-- 사용자 생성 및 권한 부여
CREATE USER 'refitdbuser'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON refitdb.* TO 'refitdbuser'@'localhost';
USE refitdb;
```

#### 2. 환경 변수 설정

각 프로젝트의 환경 변수를 설정해주세요:

**백엔드 (application.properties)**

```properties
spring.datasource.url=${DB_URL:jdbc:mariadb://localhost:3306/refitdb}
spring.datasource.username=${DB_USERNAME:refitdbuser}
spring.datasource.password=${DB_PASSWORD:1234}
```

**프론트엔드**

```javascript
// src/api/kakaoApi.js
const rest_api_key = `KAKAO_REST_API_KEY`;

// src/pages/order/LocationPage.js
const KAKAO_MAP_KEY = "KAKAO_MAP_KEY";
```

**챗봇**

```python
# app.py
os.environ['OPENAI_API_KEY'] = 'GPT_API_KEY'
```

### 🔧 서버 실행

#### 백엔드 서버 (Spring Boot)

1. **VSCode에서 실행**

   - `refit_backend/src/main/java/com/refitbackend/RefitBackendApplication.java` 실행
   - 또는 터미널에서: `./gradlew bootRun`

2. **테스트 실행**
   - `refit_backend/src/test/java/com/refitbackend/repository/ProductRepositoryTests.java` 실행

#### 프론트엔드 서버 (React)

**처음 실행시:**

```bash
# 터미널에서 Git Bash 사용
cd refit_front
npm install
yarn start
```

**이후 실행시:**

```bash
cd refit_front
yarn start
```

#### 챗봇 서버 (Python)

**처음 실행시:**

```powershell
# PowerShell에서 실행
cd refit_chatbot

# 실행 정책 설정
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 가상환경 생성 및 활성화
python -m venv .venv
.venv\Scripts\activate

# 의존성 설치 (.venv) 확인 후
pip install -r requirements.txt

# 서버 시작
uvicorn app:app --reload
```

**이후 실행시:**

```powershell
cd refit_chatbot
.venv\Scripts\activate
# (.venv) 확인 후
uvicorn app:app --reload
```

## 🌐 접속 주소

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080
- **챗봇 API**: http://localhost:8000

## 🛠️ 기술 스택

### 백엔드

- **Spring Boot 3.3.13**
- **Spring Security**
- **Spring Data JPA**
- **MariaDB**
- **JWT**
- **Google Cloud Vision API**

### 프론트엔드

- **React 18.2.0**
- **Redux Toolkit**
- **React Router DOM**
- **Axios**
- **Tailwind CSS**
- **Kakao Maps API**

### 챗봇

- **Python**
- **FastAPI**
- **OpenAI API**
- **LangChain**
- **MariaDB**

## 📁 주요 기능

### 사용자 기능

- 회원가입/로그인 (일반, 카카오 소셜 로그인)
- 상품 검색 및 필터링
- 장바구니 및 주문
- 리뷰 작성
- 커뮤니티 게시판

### 관리자 기능

- 상품 관리
- 주문 관리
- 수혜자 신청 관리

### 챗봇 기능

- 상품 추천
- 주문 도움
- 실시간 상담

## 🔐 환경 변수

프로젝트 실행 전 다음 환경 변수를 설정해주세요:

```bash
# 데이터베이스
DB_URL=jdbc:mariadb://localhost:3306/refitdb
DB_USERNAME=refitdbuser
DB_PASSWORD=1234

# JWT
JWT_SECRET=your_jwt_secret_key

# 포트원 결제
PORTONE_API_KEY=your_portone_api_key
PORTONE_API_SECRET=your_portone_api_secret

# 구글 클라우드
GOOGLE_PROJECT_ID=your_google_project_id
GOOGLE_CREDENTIALS_PATH=path/to/google-vision-key.json

# 카카오 API
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_MAP_KEY=your_kakao_map_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
