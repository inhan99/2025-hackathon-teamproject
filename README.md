# Refit - 지속가능한 패션 플랫폼

Refit은 중고 의류 판매 및 기부 플랫폼으로, 지속가능한 패션을 위한 의류 거래 서비스를 제공합니다.


## 🏗️ 프로젝트 구조

```
refit/
├── refit_backend/     # Spring Boot 백엔드
├── refit_front/       # React 프론트엔드
└── refit_chatbot/     # Python 챗봇 서버
```

### 개발 기간
6월 30일 (월) ~ 7월 25일(금)

### 팀원

<table>
  <tr>
    <td align="center"><a href="https://github.com/inhan99"><img src="https://avatars.githubusercontent.com/inhan99" width="100px;" alt=""/><br /><sub><b>inhan99</b></sub></a></td>
    <td align="center"><a href="https://github.com/KessokuMAS"><img src="https://avatars.githubusercontent.com/KessokuMAS" width="100px;" alt=""/><br /><sub><b>KessokuMAS</b></sub></a></td>
    <td align="center"><a href="https://github.com/chanO4135"><img src="https://avatars.githubusercontent.com/chanO4135" width="100px;" alt=""/><br /><sub><b>chanO4135</b></sub></a></td>
     <td align="center"><a href="https://github.com/bannana-key"><img src="https://avatars.githubusercontent.com/bannana-key" width="100px;" alt=""/><br /><sub><b>bannana-key</b></sub></a></td>
  </tr>
</table>

- 팀장 : 고인한
  
- 팀원 : 고윤호, 김찬영, 송승찬

----
## 📁 주요 기능

### 사용자 기능

#### <a id="chatbot-feature"></a>챗봇 기능
- 음성 기반 주문 도움
- 그래프 기반 실시간 차트

#### <a id="login-feature"></a>로그인 기능
- 회원가입/로그인 (일반, 카카오 소셜 로그인)

#### <a id="order-feature"></a>상품 주문 기능
- 상품 검색 및 필터링
- 장바구니 추가 및 주문

#### <a id="cart-feature"></a>장바구니 기능
- 장바구니에 상품 추가
- 장바구니 상품 관리

#### <a id="cart-feature"></a>상품 리뷰 기능
- 장바구니에 상품 추가
- 장바구니 상품 관리

#### <a id="size-based-recommendation"></a>사용자 신체사이즈 기반 추천
- 사용자 신체 정보 기반 추천 시스템

#### <a id="donation-product-registration"></a>나눔 상품 등록
- 나눔 상품 등록 및 관리

#### <a id="community-feature"></a>커뮤니티 기능
- 커뮤니티 게시판



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
### 개발환경
- 언어
  
   <img src="https://img.shields.io/badge/java-007396?style=for-the-badge&logo=java&logoColor=white"> 
- 개발 도구
  
    <img src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=spring&logoColor=white"> <img src="https://img.shields.io/badge/springsecurity-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white"> <br/><img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black">  <img src="https://img.shields.io/badge/redux-764ABC?style=for-the-badge&logo=redux&logoColor=black">  <img src="https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white"> <br/>
<img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white"> <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> <br/> <img src="https://img.shields.io/badge/aws-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white"> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">

- IDE
  
   <img src="https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white">
- OS
  
   <img src="https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white">
- Sever : AWS

---

## ERD
<img width="1024" height="787" alt="image" src="https://github.com/user-attachments/assets/1a602e1c-8ea7-47ae-8a1a-c356ed041723" />

---

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
