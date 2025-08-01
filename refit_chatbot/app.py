from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

#gpt랑 통신
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langchain.agents.agent_types import AgentType
from langchain_experimental.agents import create_pandas_dataframe_agent

# ApexCharts용 JSON 데이터 생성에 필요한 라이브러리
import json

import os, io, subprocess, sys
from datetime import datetime
import requests
import re

import db
from prompts.intent_analysis import INTENT_ANALYSIS_PROMPT
from prompts.response_templates import RESPONSE_TEMPLATES

app = FastAPI()

os.environ['OPENAI_API_KEY'] = 'GPT_API_KEY' 

# CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.post('/chat')
async def chat(request:Request):
    data = await request.json()
    user_message = data.get('message')
    response = (user_message)
    #print(response)
    return {'response': response}


def chat_to_gpt(input_text):

    #모델에 대한 옵션
    #창의적인 답변(0.7) : temperature는 0~1로 세팅
    chat_model = ChatOpenAI(temperature=0.7)

    prompt = '''
    너는 Refit 의류 판매 및 기부 플랫폼의 챗봇 상담사야.

    RefitDB에 있는 정보만 사용하고, 없는 내용은 "확인된 정보가 없습니다"라고 안내해줘.  
    DB 구조나 필드명은 절대 사용자에게 보여주지 마.  
    욕설이나 무관한 질문에는 "해당 정보는 답변드릴 수 없습니다"라고 응답해.

    답변은 항상 친절하고 명확하게.  
    2~3문단 이내로, 첫 문장은 요약, 다음은 상세 설명.  
    항상 줄바꿈으로 보기 좋게 정리해줘.
    '''

    message = [
        HumanMessage(input_text),
        SystemMessage(prompt)
    ]

    response = chat_model.invoke(message)
    print(response)
    return response.content


def chat_with_db(input_text):
    chat_model = ChatOpenAI(temperature=0.7)
    my_db_list = db.search_db()

    prompt = f'''
        이 질문 {input_text}을 해결하기 위해 어떤 db리스트를 참조해야 할까?
        내가 가진 db 리스트는 {my_db_list}에 존재해. 
        어떤 db table을 참조해야 할지, 이름만 반환해줘. 예시 : finance
    '''
    message = [
        HumanMessage(input_text),
        SystemMessage(prompt)
    ]

    response = chat_model.invoke(message)
    # 테이블 이름에서 따옴표와 공백 제거
    table_name = str(response.content).strip().strip("'\"")
    db_info = db.show_data(table_name)
    print(response)

    prompt = f'''
    너는 Refit 플랫폼의 고객상담 챗봇이야.

    Refit은 지속가능한 패션을 위한 의류 거래 플랫폼입니다.
    - 중고 의류 판매/구매 서비스 제공

    고객 질문에 친절하고 정확하게 답변하세요.
    확인되지 않은 정보는 "정확한 정보 확인 후 안내드리겠습니다"라고 답변하세요.

    답변은 2-3문장으로 간결하게 작성하세요.
    '''

    message = [
        HumanMessage(input_text),
        SystemMessage(prompt)
    ]

    response = chat_model.invoke(message)
    #print(response.content, type(response.content))
    return response.content


@app.post('/voice')
async def voice(text:Request):
    data = await text.json()
    user_message = data.get('text')
    response = chat_with_db(user_message)
    print("=========", response)
    return {'response': response}


# 상품명, 사이즈, 수량 추출 함수
def extract_product_info(message):
    """사용자 메시지에서 상품명, 사이즈, 수량을 추출합니다."""
    chat_model = ChatOpenAI(temperature=0.1)
    
    prompt = '''
    사용자의 메시지에서 상품명, 사이즈, 수량을 추출해주세요.
    
    추출 규칙:
    1. 상품명: 
       - 하이픈(-)이 포함된 상품명은 그대로 유지 (예: "프린팅 티셔츠-블랙")
       - 브랜드명 + 제품명 (예: "나이키 에어맥스", "아디다스 운동화")
       - 복합 상품명도 그대로 유지 (예: "카라리스 반팔 니트")
       - 색상이 포함된 경우도 상품명에 포함 (예: "블랙 티셔츠")
    
    2. 사이즈: S, M, L, XL, XXL 중 하나 (기본값: L)
    
    3. 수량: 
       - 숫자 + 단위 (개, 장, 벌, 벌) (기본값: 1)
       - "2개", "3장", "1벌" 등 정확히 추출
       - 수량이 명시되지 않으면 1로 설정
    
    응답 형식:
    {
        "product_name": "추출된 상품명 (하이픈 포함 가능)",
        "size": "추출된 사이즈 또는 L",
        "quantity": 추출된 수량 또는 1
    }
    
    예시:
    - "나이키 에어맥스 장바구니에 담아줘" → {"product_name": "나이키 에어맥스", "size": "L", "quantity": 1}
    - "프린팅 티셔츠-블랙 M사이즈 2개 장바구니에 담아줘" → {"product_name": "프린팅 티셔츠-블랙", "size": "M", "quantity": 2}
    - "카라리스 반팔 니트 L사이즈 장바구니에 담아줘" → {"product_name": "카라리스 반팔 니트", "size": "L", "quantity": 1}
    - "블랙 티셔츠 3개 담아줘" → {"product_name": "블랙 티셔츠", "size": "L", "quantity": 3}
    - "캐쥬얼 티셔트-블랙 2장" → {"product_name": "캐쥬얼 티셔트-블랙", "size": "L", "quantity": 2}
    '''
    
    message_obj = [
        HumanMessage(message),
        SystemMessage(prompt)
    ]
    
    response = chat_model.invoke(message_obj)
    try:
        result = json.loads(response.content)
        print(f"상품 정보 추출 결과: {result}")  # 디버깅 로그 추가
        return result
    except:
        # JSON 파싱 실패 시 기본값 반환
        print(f"JSON 파싱 실패. 원본 응답: {response.content}")  # 디버깅 로그 추가
        return {"product_name": "", "size": "L", "quantity": 1}


# 상품 검색 함수
def search_product(product_name):
    """백엔드 API를 통해 상품을 검색합니다."""
    try:
        print(f"검색 시작: '{product_name}'")
        
        # 1. 원본 키워드로 검색
        search_url = "http://localhost:8080/api/search/products"
        params = {
            "keyword": product_name,
            "page": 0,
            "size": 10
        }
        
        response = requests.get(search_url, params=params)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            print(f"원본 키워드 검색 결과: {len(products)}개 상품")
            
            if products:
                # 정확도가 높은 상품을 우선 선택
                best_match = find_best_match(product_name, products)
                if best_match:
                    print(f"✅ 최적 매칭 상품: {best_match.get('productName', 'N/A')}")
                    return [best_match]
                return products[:1]  # 첫 번째 상품 반환
        
        # 2. 하이픈 제거 후 검색 (하이픈이 포함된 경우)
        if '-' in product_name:
            clean_name = product_name.replace('-', ' ').strip()
            print(f"하이픈 제거 후 검색: '{clean_name}'")
            
            params["keyword"] = clean_name
            response = requests.get(search_url, params=params)
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", [])
                print(f"하이픈 제거 검색 결과: {len(products)}개 상품")
                
                if products:
                    best_match = find_best_match(clean_name, products)
                    if best_match:
                        print(f"✅ 최적 매칭 상품: {best_match.get('productName', 'N/A')}")
                        return [best_match]
                    return products[:1]
        
        # 3. 키워드 분리 후 검색 (복합 상품명인 경우)
        keywords = product_name.split()
        if len(keywords) > 2:  # 3개 이상의 단어로 구성된 경우
            # 주요 키워드들로 검색 시도
            search_keywords = [
                ' '.join(keywords[:2]),  # 앞 2개 단어
                ' '.join(keywords[-2:]),  # 뒤 2개 단어
                keywords[0] + ' ' + keywords[-1],  # 첫번째 + 마지막
            ]
            
            for search_keyword in search_keywords:
                print(f"키워드 분리 검색: '{search_keyword}'")
                params["keyword"] = search_keyword
                response = requests.get(search_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    products = data.get("products", [])
                    print(f"키워드 분리 검색 결과: {len(products)}개 상품")
                    
                    if products:
                        best_match = find_best_match(search_keyword, products)
                        if best_match:
                            print(f"✅ 최적 매칭 상품: {best_match.get('productName', 'N/A')}")
                            return [best_match]
                        return products[:1]
        
        # 4. 부분 매칭 검색 (마지막 시도)
        if len(keywords) > 1:
            # 가장 긴 단어로 검색
            longest_keyword = max(keywords, key=len)
            print(f"부분 매칭 검색: '{longest_keyword}'")
            
            params["keyword"] = longest_keyword
            response = requests.get(search_url, params=params)
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", [])
                print(f"부분 매칭 검색 결과: {len(products)}개 상품")
                
                if products:
                    best_match = find_best_match(longest_keyword, products)
                    if best_match:
                        print(f"✅ 최적 매칭 상품: {best_match.get('productName', 'N/A')}")
                        return [best_match]
                    return products[:1]
        
        print(f"검색 실패: '{product_name}'에 대한 결과 없음")
        return []
    
    except Exception as e:
        print(f"상품 검색 중 오류: {e}")
        return []

def find_best_match(search_keyword, products):
    """검색 키워드와 가장 잘 매칭되는 상품을 찾습니다."""
    if not products:
        return None
    
    best_match = None
    best_score = 0
    
    search_lower = search_keyword.lower()
    
    for product in products:
        product_name = product.get('productName', '').lower()
        score = 0
        
        # 정확한 매칭
        if product_name == search_lower:
            score += 100
        # 시작 부분 매칭
        elif product_name.startswith(search_lower):
            score += 50
        # 포함 매칭
        elif search_lower in product_name:
            score += 30
        # 단어 단위 매칭
        else:
            search_words = set(search_lower.split())
            product_words = set(product_name.split())
            common_words = search_words.intersection(product_words)
            score += len(common_words) * 10
        
        # 하이픈 처리 (하이픈 제거 후 비교)
        if '-' in search_lower:
            clean_search = search_lower.replace('-', ' ')
            if clean_search in product_name:
                score += 20
        
        if score > best_score:
            best_score = score
            best_match = product
    
    print(f"최고 점수: {best_score} (상품: {best_match.get('productName', 'N/A') if best_match else 'None'})")
    return best_match if best_score > 0 else None


# 상품 옵션 조회 함수
def get_product_options(product_id):
    """상품의 옵션(사이즈) 정보를 조회합니다."""
    try:
        product_url = f"http://localhost:8080/api/products/{product_id}"
        response = requests.get(product_url)
        if response.status_code == 200:
            data = response.json()
            return data.get("options", [])
        else:
            return []
    except Exception as e:
        print(f"상품 옵션 조회 중 오류: {e}")
        return []


# 장바구니 추가 함수
def add_to_cart(product_id, option_id, quantity, access_token):
    """장바구니에 상품을 추가합니다."""
    try:
        cart_url = "http://localhost:8080/api/cart/add"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        data = {
            "productId": product_id,
            "optionId": option_id,
            "quantity": quantity,
            "cartItemId": None
        }
        
        response = requests.post(cart_url, json=data, headers=headers)
        return response.status_code == 200, response.json() if response.status_code == 200 else None
    except Exception as e:
        print(f"장바구니 추가 중 오류: {e}")
        return False, None


# 챗봇 장바구니 추가 처리 함수
def handle_cart_add_request(message, access_token):
    """챗봇에서 장바구니 추가 요청을 처리합니다."""
    
    print(f"=== 장바구니 추가 요청 처리 시작 ===")
    print(f"사용자 메시지: {message}")
    print(f"로그인 상태: {'로그인됨' if access_token else '로그인 안됨'}")
    
    # 1. 상품 정보 추출
    product_info = extract_product_info(message)
    product_name = product_info.get("product_name", "")
    size = product_info.get("size", "L")
    quantity = product_info.get("quantity", 1)
    
    print(f"추출된 정보: 상품명='{product_name}', 사이즈='{size}', 수량={quantity}")
    
    if not product_name:
        print("❌ 상품명 추출 실패")
        return "상품명을 찾을 수 없습니다. 다시 말씀해 주세요."
    
    # 2. 상품 검색
    search_results = search_product(product_name)
    
    if not search_results:
        print(f"❌ 상품 검색 실패: '{product_name}'")
        return f"'{product_name}' 상품을 찾을 수 없습니다. 다른 상품명으로 다시 말씀해 주세요."
    
    print(f"✅ 검색된 상품 수: {len(search_results)}개")
    for i, product in enumerate(search_results[:3]):  # 상위 3개만 출력
        print(f"  {i+1}. {product.get('productName', 'N/A')} (ID: {product.get('productId', 'N/A')})")
    
    if len(search_results) > 1:
        # 여러 상품이 검색된 경우
        product_names = [p.get("productName", "") for p in search_results[:3]]
        print(f"⚠️ 여러 상품 검색됨: {product_names}")
        return f"여러 상품이 검색되었습니다: {', '.join(product_names)}\n더 구체적으로 말씀해 주세요."
    
    # 3. 상품 선택 (첫 번째 결과)
    selected_product = search_results[0]
    product_id = selected_product.get("productId")
    product_name_actual = selected_product.get("productName", "")
    
    print(f"✅ 선택된 상품: {product_name_actual} (ID: {product_id})")
    
    # 4. 상품 옵션 조회
    options = get_product_options(product_id)
    print(f"✅ 상품 옵션 수: {len(options)}개")
    for option in options:
        print(f"  - 사이즈: {option.get('size', 'N/A')}, 재고: {option.get('stock', 0)}")
    
    # 5. 요청 사이즈 찾기
    target_option = None
    for option in options:
        if option.get("size") == size and option.get("stock", 0) > 0:
            target_option = option
            break
    
    # 6. 요청 사이즈가 없으면 기본 사이즈(L) 찾기
    if not target_option:
        print(f"⚠️ 요청 사이즈 '{size}' 없음, 기본 사이즈(L) 시도")
        for option in options:
            if option.get("size") == "L" and option.get("stock", 0) > 0:
                target_option = option
                size = "L"  # 사이즈를 L로 변경
                break
    
    # 7. 사용 가능한 옵션이 없는 경우
    if not target_option:
        available_sizes = [opt.get("size") for opt in options if opt.get("stock", 0) > 0]
        print(f"❌ 사용 가능한 사이즈 없음. 사용 가능: {available_sizes}")
        if available_sizes:
            return f"'{size}' 사이즈는 현재 품절입니다. 사용 가능한 사이즈: {', '.join(available_sizes)}"
        else:
            return f"'{product_name_actual}' 상품은 현재 모든 사이즈가 품절입니다."
    
    print(f"✅ 선택된 옵션: 사이즈={target_option.get('size')}, 재고={target_option.get('stock')}")
    
    # 8. 재고 확인
    if target_option.get("stock", 0) < quantity:
        max_quantity = target_option.get("stock", 0)
        print(f"❌ 재고 부족: 요청={quantity}, 재고={max_quantity}")
        return f"현재 재고가 부족합니다. 최대 {max_quantity}개까지 담을 수 있습니다."
    
    # 9. 장바구니 추가
    if not access_token:
        print("❌ 로그인 필요")
        return "로그인이 필요한 서비스입니다. 먼저 로그인 후 이용해 주세요."
    
    print(f"🛒 장바구니 추가 시도: 상품ID={product_id}, 옵션ID={target_option.get('id')}, 수량={quantity}")
    success, result = add_to_cart(product_id, target_option.get("id"), quantity, access_token)
    
    if success:
        print(f"✅ 장바구니 추가 성공!")
        return f"'{product_name_actual}' {size}사이즈 {quantity}개가 장바구니에 담겼습니다! 🛒"
    else:
        print(f"❌ 장바구니 추가 실패: {result}")
        return "장바구니 담기에 실패했습니다. 다시 시도해 주세요."


@app.post('/filter')
async def filtering(request: Request):
    data = await request.json()
    user_message = data.get('message')  # ✅ 이 줄이 반드시 있어야 함
    is_logged_in = data.get('isLoggedIn', False)  # 로그인 상태 받기
    access_token = data.get('accessToken', None)  # 액세스 토큰 받기
    member_cookie = data.get('memberCookie', None)  # 멤버 쿠키 받기
    
    # 장바구니 구매 요청인지 먼저 확인 (더 구체적인 키워드가 우선)
    cart_purchase_keywords = [
        '장바구니에 있는 상품 구매', '장바구니 상품 구매', '장바구니 구매',
        '장바구니 상품 카드로 구매', '장바구니 상품 적립금으로 구매',
        '장바구니 카드로 구매', '장바구니 적립금으로 구매'
    ]
    is_cart_purchase = any(keyword in user_message for keyword in cart_purchase_keywords)
    
    # 장바구니 담기 요청인지 확인 (구매가 아닌 경우만)
    cart_keywords = ["장바구니", "담기", "담아줘", "추가", "넣어줘"]
    is_cart_request = any(keyword in user_message for keyword in cart_keywords) and not is_cart_purchase
    
    if is_cart_purchase:
        # 로그인 상태 확인
        if not is_logged_in:
            navigation_info = {
                'show_button': True,
                'button_text': '로그인 페이지로 이동',
                'button_url': '/member/login',
                'login_required': True
            }
            return {
                'response': "로그인이 필요한 서비스입니다. 먼저 로그인해주세요.",
                'navigation': navigation_info
            }
        
        # 결제 방식 감지
        payment_method = detect_payment_method(user_message)
        
        print(f"장바구니 구매 요청 감지: {user_message}")
        print(f"감지된 결제 방식: {payment_method}")
        
        if payment_method == "card":
            response = "장바구니 상품을 카드로 구매하시겠습니까? 결제 페이지로 이동합니다."
        elif payment_method == "point":
            response = "장바구니 상품을 적립금으로 구매하시겠습니까? 적립금 결제 페이지로 이동합니다."
        else:
            response = "장바구니 상품을 구매하시겠습니까? 결제 페이지로 이동합니다."
        
        # 네비게이션 정보 생성
        navigation_info = detect_navigation_keywords(user_message, response, is_logged_in, access_token, member_cookie)
        
        print(f"생성된 네비게이션 정보: {navigation_info}")
        
        return {
            'response': response,
            'navigation': navigation_info
        }
    
    if is_cart_request:
        # 장바구니 담기 처리
        response = handle_cart_add_request(user_message, access_token if is_logged_in else None)
        return {
            'response': response,
            'navigation': None
        }
    
    # 추천 관련 키워드 먼저 확인 (로그인 및 신체정보 필요)
    recommend_keywords = [
        '추천', '추천 페이지', '추천 상품', '개인 추천', '맞춤 추천',
        '체형', '체형에 맞는', '내 체형', '키에 맞는', '몸무게에 맞는',
        '신체', '신체에 맞는', '사이즈', '사이즈에 맞는', '맞는 옷',
        '어울리는', '어울리는 옷', '체형별', '신체별', '개인별'
    ]
    is_recommend_request = any(keyword in user_message for keyword in recommend_keywords)
    
    if is_recommend_request:
        # 추천 페이지 접근 조건 확인
        recommend_check = check_recommend_page_access(user_message, access_token, member_cookie)
        
        navigation_info = {
            'show_button': True,
            'button_text': '메인 페이지로 이동' if not recommend_check["can_access"] else '추천 페이지로 이동',
            'button_url': recommend_check["redirect_to"],
            'login_required': False
        }
        
        return {
            'response': recommend_check["message"],
            'navigation': navigation_info
        }
    
    # 질문에 따라 적절한 테이블 자동 선택
    intent = analyze_user_intent(user_message)
    table = select_relevant_table(user_message, intent)
    
    print(f"필터링 - 의도: {intent}, 선택된 테이블: {table}")

    df = db.show_data(table)

    
    
    # DataFrame이 None이면 기본 테이블 사용
    if df is None or len(df) == 0:
        print("선택된 테이블에 데이터가 없어 products 테이블을 사용합니다.")
        df = db.show_data('products')



        

    llm = ChatOpenAI()

    # 의도에 따라 적절한 프롬프트 선택
    selected_prompt = RESPONSE_TEMPLATES.get(intent, RESPONSE_TEMPLATES['general_inquiry'])
    
    agent = create_pandas_dataframe_agent(
            ChatOpenAI(temperature=0.5, model='gpt-4o-mini'),
            df,
            verbose=True,
            agent_type="openai-tools", 
            allow_dangerous_code=True,
            prefix=selected_prompt
            )

    response = agent.invoke({'input': user_message})
    print(response)
    
    # 로그 파일에 질문과 답변 저장
    log_chat(user_message, response['output'], intent, table)
    
    # 페이지 이동 키워드 감지 (로그인 상태와 액세스 토큰 전달)
    navigation_info = detect_navigation_keywords(user_message, response['output'], is_logged_in, access_token, member_cookie)
    
    return {
        'response': response['output'],
        'navigation': navigation_info
    }


@app.post('/graph')
async def generate_graph(request:Request):
    data = await request.json()
    question = data.get('message', "")
    
    print(f"그래프 요청 받음: {question}")
    
    # 1단계: 그래프 생성 가능한 질문인지 의도 분석
    try:
        is_graph_request = is_graph_generation_request(question)
        print(f"그래프 요청 여부: {is_graph_request}")
        
        if not is_graph_request:
            return JSONResponse(
                status_code=400,
                content={"message": "그래프 생성과 관련없는 질문입니다. 데이터 분석이나 통계 관련 질문을 해주세요."}
            )
    except Exception as e:
        print(f"그래프 요청 분석 중 오류: {e}")
        # 오류 발생 시 기본적으로 진행 (안전장치)
        pass
    
    # 2단계: DB 데이터와 관련있는지 검증
    try:
        is_db_related = is_related_to_database(question)
        print(f"DB 관련성 여부: {is_db_related}")
        
        if not is_db_related:
            return JSONResponse(
                status_code=400,
                content={"message": "데이터베이스에 저장된 정보와 관련없는 질문입니다. 상품, 브랜드, 카테고리 등에 대한 질문을 해주세요."}
            )
    except Exception as e:
        print(f"DB 관련성 분석 중 오류: {e}")
        # 오류 발생 시 기본적으로 진행 (안전장치)
        pass
    
    my_db_list = db.search_db()
    
    # 테이블 구조 정보 가져오기
    table_descriptions = {}
    for table_name in my_db_list:
        # 이 부분은 db.py에 테이블 구조를 문자열로 반환하는 함수가 있다고 가정합니다.
        # 예: def describe_table_for_prompt(table_name): ...
        # 지금은 간단한 예시로 컬럼만 가져옵니다.
        df_temp = db.show_data(table_name)
        if df_temp is not None:
            table_descriptions[table_name] = ", ".join(df_temp.columns)

    chat_model = ChatOpenAI(temperature=0.7, model='gpt-4o-mini')

    prompt = f'''
        사용자 질문: "{question}"
        
        데이터베이스 스키마:
        {table_descriptions}

        위 사용자 질문에 답변하고 그래프를 생성하는 데 필요한 데이터를 추출하는 단일 SQL 쿼리를 작성해주세요.
        - SQL 쿼리만 응답하고, 다른 설명이나 텍스트는 포함하지 마세요.
        - 쿼리는 항상 유효해야 하며, 데이터베이스 스키마를 참조하세요.
        - 상품 관련 데이터를 조회할 때는 상품 ID(p.id 또는 product_id)를 마지막 컬럼으로 포함해주세요.
        - 그래프에는 상품명이나 브랜드명 등 사용자 친화적인 정보를 표시하고, ID는 내부 처리용으로만 사용합니다.
        
        ## 중요: 상품명 우선 표시 규칙
        - "가장 비싼 상품", "평점 높은 상품", "인기 상품" 등 개별 상품을 요청하는 경우 반드시 상품명(p.name)을 첫 번째 컬럼으로 선택하세요.
        - "브랜드별", "카테고리별" 등 그룹 분석을 요청하는 경우에만 브랜드명이나 카테고리명을 첫 번째 컬럼으로 선택하세요.
        
        - 예시: "가장 비싼 상품 3개" -> SELECT p.name, p.price, p.id FROM products p ORDER BY p.price DESC LIMIT 3;
        - 예시: "평점 높은 상품 5개" -> SELECT p.name, r.rating, p.id FROM products p JOIN reviews r ON p.id = r.product_id ORDER BY r.rating DESC LIMIT 5;
        - 예시: "브랜드별 상품 개수" -> SELECT b.name, COUNT(p.id), p.id FROM products p JOIN brands b ON p.brand_id = b.id GROUP BY b.name, p.id;
        - 예시: "상품별 가격" -> SELECT p.name, p.price, p.id FROM products p;
        - 쿼리 마지막에 세미콜론(;)을 붙이지 마세요.

        ## 보안 규칙
        - 개인정보 컬럼(email, phone, address, password, token, api_key 등)은 절대 SELECT하지 마세요.
        - 개인 식별 정보(id, user_id, member_id 등)는 그래프 생성에 필요하지 않으면 제외하세요.
        - 보안 관련 컬럼은 절대 포함하지 마세요.
        - 만약 개인정보 컬럼만 있는 경우 "개인정보 보호를 위해 해당 데이터는 표시할 수 없습니다"라고 응답하세요.
        '''

    message = [
        HumanMessage(question),
        SystemMessage(prompt)
    ]

    response = chat_model.invoke(message)
    sql_query = str(response.content).strip().strip("'\"`")
    
    # 생성된 쿼리가 비어있거나 이상하면 중단
    if not sql_query.lower().startswith("select"):
        return JSONResponse(
            status_code=400,
            content={"message": "그래프 생성에 적합한 데이터를 찾지 못했습니다."}
        )
    
    print("데이터베이스에서 데이터 조회 중...")
    db_info = db.get_data_from_query(sql_query)
    print(f"조회된 데이터 행 수: {len(db_info) if db_info is not None else 0}")

    # 데이터가 없는 경우, 그래프 생성 중단 및 메시지 반환
    if db_info is None or db_info.empty:
        print("데이터가 없어 그래프를 생성할 수 없습니다.")
        return JSONResponse(
            status_code=404,
            content={"message": "관련 데이터가 없어 그래프를 생성할 수 없습니다."}
        )

    # ApexCharts용 JSON 데이터 생성
    chart_data = convert_to_apexcharts_format(db_info, question)
    
    # JSON 데이터 로그 출력
    print("생성된 차트 데이터:", json.dumps(chart_data, ensure_ascii=False, indent=2))
    
    return JSONResponse(content=chart_data)

def convert_to_apexcharts_format(dataframe, question):
    """
    데이터프레임을 ApexCharts용 JSON 형식으로 변환
    """
    try:
        # 데이터프레임을 딕셔너리로 변환
        data_dict = dataframe.to_dict('records')
        
        # 컬럼명 가져오기
        columns = list(dataframe.columns)
        
        # 기본 차트 설정
        chart_config = {
            "series": [],
            "categories": [],
            "title": f"데이터 분석 결과",
            "xAxisTitle": "",
            "yAxisTitle": "",
            "chartType": "bar",  # 기본값
            "question": question  # 원본 질문 추가
        }
        
        # 데이터가 2개 컬럼인 경우 (x축, y축)
        if len(columns) == 2:
            x_col = columns[0]
            y_col = columns[1]
            
            # ID 컬럼이 있는지 확인하고 제외
            if 'id' in columns or 'product_id' in columns or 'productId' in columns or 'p_id' in columns:
                # ID 컬럼을 제외하고 실제 데이터 컬럼만 사용
                data_columns = [col for col in columns if col not in ['id', 'product_id', 'productId', 'p_id']]
                if len(data_columns) >= 2:
                    x_col = data_columns[0]
                    y_col = data_columns[1]
            
            # 카테고리 (x축) - 상품명 우선 표시
            categories = []
            product_ids = []
            
            for row in data_dict:
                # 상품명이 있는 경우 우선 사용
                if 'name' in row and x_col == 'name':
                    category_name = str(row[x_col])
                else:
                    category_name = str(row[x_col])
                categories.append(category_name)
                
                # 상품 ID가 있는 경우 추출 (id, product_id, productId 등)
                product_id = None
                if 'id' in row:
                    product_id = row['id']
                elif 'product_id' in row:
                    product_id = row['product_id']
                elif 'productId' in row:
                    product_id = row['productId']
                elif 'product_id' in row:
                    product_id = row['product_id']
                elif 'p_id' in row:
                    product_id = row['p_id']
                
                # 디버깅용 로그
                if product_id is None:
                    print(f"상품 ID를 찾을 수 없음. 사용 가능한 키: {list(row.keys())}")
                else:
                    print(f"상품 ID 추출 성공: {product_id}")
                
                product_ids.append(product_id)
            
            # 데이터 (y축)
            data = []
            for row in data_dict:
                value = row[y_col]
                # 숫자가 아닌 경우 0으로 처리
                if isinstance(value, (int, float)):
                    data.append(value)
                else:
                    data.append(0)
            
            chart_config["categories"] = categories
            chart_config["productIds"] = product_ids  # 상품 ID 추가
            chart_config["series"] = [{
                "name": y_col,
                "data": data
            }]
            chart_config["xAxisTitle"] = x_col
            chart_config["yAxisTitle"] = y_col
            
            # 데이터 타입에 따라 차트 타입 결정
            if all(isinstance(x, str) for x in categories):
                chart_config["chartType"] = "bar"
            else:
                chart_config["chartType"] = "line"
        
        # 데이터가 1개 컬럼인 경우 (값만)
        elif len(columns) == 1:
            # ID 컬럼인지 확인
            if columns[0] in ['id', 'product_id', 'productId', 'p_id']:
                # ID 컬럼만 있는 경우 기본값 사용
                col = "값"
                data = [1, 2, 3, 4, 5]  # 기본 데이터
                product_ids = [None, None, None, None, None]
            else:
                col = columns[0]
                data = []
                product_ids = []
            
            for i, row in enumerate(data_dict):
                value = row[col]
                if isinstance(value, (int, float)):
                    data.append(value)
                else:
                    data.append(0)
                
                # 상품 ID 추출 시도
                product_id = None
                if 'id' in row:
                    product_id = row['id']
                elif 'product_id' in row:
                    product_id = row['product_id']
                elif 'productId' in row:
                    product_id = row['productId']
                elif 'p_id' in row:
                    product_id = row['p_id']
                
                # 디버깅용 로그
                if product_id is None:
                    print(f"상품 ID를 찾을 수 없음. 사용 가능한 키: {list(row.keys())}")
                else:
                    print(f"상품 ID 추출 성공: {product_id}")
                
                product_ids.append(product_id)
            
            chart_config["categories"] = [f"항목 {i+1}" for i in range(len(data))]
            chart_config["productIds"] = product_ids  # 상품 ID 추가
            chart_config["series"] = [{
                "name": col,
                "data": data
            }]
            chart_config["xAxisTitle"] = "항목"
            chart_config["yAxisTitle"] = col
            chart_config["chartType"] = "bar"
            
            # 차트 제목과 축 제목을 질문에 따라 동적으로 설정
            chart_config = set_chart_titles(chart_config, question, "항목", col)
        
        # 데이터가 3개 이상 컬럼인 경우 (첫 번째를 카테고리로, 나머지를 시리즈로)
        else:
            # ID 컬럼을 제외하고 실제 데이터 컬럼만 사용
            data_columns = [col for col in columns if col not in ['id', 'product_id', 'productId', 'p_id']]
            if len(data_columns) >= 2:
                x_col = data_columns[0]
                series_columns = data_columns[1:]
            else:
                x_col = columns[0]
                series_columns = columns[1:]
            
            categories = []
            product_ids = []
            
            for row in data_dict:
                category_name = str(row[x_col])
                categories.append(category_name)
                
                # 상품 ID 추출 시도
                product_id = None
                if 'id' in row:
                    product_id = row['id']
                elif 'product_id' in row:
                    product_id = row['product_id']
                elif 'productId' in row:
                    product_id = row['productId']
                elif 'p_id' in row:
                    product_id = row['p_id']
                
                # 디버깅용 로그
                if product_id is None:
                    print(f"상품 ID를 찾을 수 없음. 사용 가능한 키: {list(row.keys())}")
                else:
                    print(f"상품 ID 추출 성공: {product_id}")
                
                product_ids.append(product_id)
            
            series = []
            for col in series_columns:
                data = []
                for row in data_dict:
                    value = row[col]
                    if isinstance(value, (int, float)):
                        data.append(value)
                    else:
                        data.append(0)
                
                series.append({
                    "name": col,
                    "data": data
                })
            
            chart_config["categories"] = categories
            chart_config["productIds"] = product_ids  # 상품 ID 추가
            chart_config["series"] = series
            chart_config["xAxisTitle"] = x_col
            chart_config["yAxisTitle"] = "값"
            chart_config["chartType"] = "bar"
        
        # 질문에 따라 차트 타입 조정
        if "선" in question or "트렌드" in question or "변화" in question:
            chart_config["chartType"] = "line"
        elif "비율" in question or "분포" in question:
            chart_config["chartType"] = "pie"
        
        # 차트 제목과 축 제목을 질문에 따라 동적으로 설정
        # 3개 이상 컬럼인 경우 y_col이 정의되지 않으므로 기본값 사용
        y_col_default = series_columns[0] if series_columns else "값"
        chart_config = set_chart_titles(chart_config, question, x_col, y_col_default)
        
        return chart_config
        
    except Exception as e:
        print(f"JSON 변환 중 오류: {e}")
        return {
            "error": "데이터 변환 중 오류가 발생했습니다.",
            "series": [],
            "categories": [],
            "title": "오류",
            "xAxisTitle": "",
            "yAxisTitle": "",
            "chartType": "bar"
        }


def set_chart_titles(chart_config, question, x_col, y_col):
    """질문과 컬럼 정보에 따라 차트 제목과 축 제목을 설정"""
    
    # 질문에서 키워드 추출
    question_lower = question.lower()
    
    # 차트 제목 설정
    if "가장 비싼" in question:
        chart_config["title"] = "가장 비싼 상품 순위"
    elif "가장 싼" in question or "가장 저렴한" in question:
        chart_config["title"] = "가장 저렴한 상품 순위"
    elif "평점 높은" in question or "평점이 높은" in question:
        chart_config["title"] = "평점 높은 상품 순위"
    elif "평점 낮은" in question or "평점이 낮은" in question:
        chart_config["title"] = "평점 낮은 상품 순위"
    elif "인기" in question:
        chart_config["title"] = "인기 상품 순위"
    elif "리뷰" in question and ("많은" in question or "적은" in question):
        if "많은" in question:
            chart_config["title"] = "리뷰가 많은 상품 순위"
        else:
            chart_config["title"] = "리뷰가 적은 상품 순위"
    elif "브랜드별" in question:
        chart_config["title"] = "브랜드별 상품 분석"
    elif "카테고리별" in question:
        chart_config["title"] = "카테고리별 상품 분석"
    elif "가격대별" in question or "가격별" in question:
        chart_config["title"] = "가격대별 상품 분포"
    else:
        chart_config["title"] = "상품 데이터 분석"
    
    # X축 제목 설정
    if x_col == "name":
        chart_config["xAxisTitle"] = "상품명"
    elif x_col == "brand_name" or "브랜드" in x_col:
        chart_config["xAxisTitle"] = "브랜드"
    elif x_col == "category_name" or "카테고리" in x_col:
        chart_config["xAxisTitle"] = "카테고리"
    elif "price" in x_col:
        chart_config["xAxisTitle"] = "가격"
    elif "rating" in x_col:
        chart_config["xAxisTitle"] = "평점"
    else:
        chart_config["xAxisTitle"] = x_col
    
    # Y축 제목 설정
    if y_col == "price":
        chart_config["yAxisTitle"] = "가격 (원)"
    elif y_col == "rating":
        chart_config["yAxisTitle"] = "평점"
    elif "count" in y_col or "개수" in y_col:
        chart_config["yAxisTitle"] = "개수"
    elif "평균" in y_col or "average" in y_col:
        chart_config["yAxisTitle"] = "평균값"
    elif "합계" in y_col or "sum" in y_col:
        chart_config["yAxisTitle"] = "합계"
    else:
        chart_config["yAxisTitle"] = y_col
    
    return chart_config

# 새로운 프롬프트 분리 함수들
def analyze_user_intent(input_text):
    chat_model = ChatOpenAI(temperature=0.3)
    
    message = [
        HumanMessage(input_text),
        SystemMessage(INTENT_ANALYSIS_PROMPT)
    ]
    
    response = chat_model.invoke(message)
    return str(response.content).strip()

def detect_payment_method(user_message):
    """사용자 메시지에서 결제 방식을 감지합니다."""
    # 카드 결제 키워드
    card_keywords = ["카드", "카드로", "카드 결제", "신용카드", "체크카드", "카드로 구매", "카드로 결제"]
    
    # 적립금 결제 키워드
    point_keywords = ["적립금", "적립금으로", "포인트", "포인트로", "적립금으로 구매", "포인트로 구매", "적립금으로 결제", "포인트로 결제"]
    
    print(f"결제 방식 감지 중: {user_message}")
    
    # 카드 결제 감지
    for keyword in card_keywords:
        if keyword in user_message:
            print(f"카드 결제 키워드 감지: {keyword}")
            return "card"
    
    # 적립금 결제 감지
    for keyword in point_keywords:
        if keyword in user_message:
            print(f"적립금 결제 키워드 감지: {keyword}")
            return "point"
    
    print("결제 방식이 명시되지 않음 - 기본값 반환")
    # 기본값 (결제 방식이 명시되지 않은 경우)
    return "default"

def is_graph_generation_request(question):
    """그래프 생성이 가능한 질문인지 판단하는 함수"""
    try:
        chat_model = ChatOpenAI(temperature=0.1)
        
        prompt = '''
        다음 질문이 그래프나 차트 생성과 관련된 요청인지 판단해주세요.
        
        그래프 생성 관련 키워드 (포함되면 YES):
        - "그래프", "차트", "통계", "분석", "비교", "분포", "추이", "트렌드"
        - "개수", "개", "수량", "평균", "합계", "최대", "최소"
        - "별로", "기준으로", "분류", "카테고리", "브랜드별", "가격별"
        - "보여줘", "시각화", "표시", "나타내", "그려줘", "만들어줘"
        - "골라서", "선택해서", "추천해서" + "보여줘/만들어줘"
        - "N개", "몇개", "개수" + "보여줘/만들어줘"
        - "인기", "인기순", "인기있는", "많은", "적은" + "보여줘/만들어줘"
        - "가장 비싼", "가장 싼", "평점 높은", "평점 낮은" + "보여줘/만들어줘"
        
        그래프 생성과 관련없는 키워드 (이런 질문만 NO):
        - "어떻게 주문하나요?", "구매 방법 알려줘" (거래 방법)
        - "로그인은 어떻게 하나요?", "회원가입 방법" (계정 관련)
        - "고객센터 연락처 알려줘", "문의 방법" (고객지원)
        - "사이트 소개해줘", "서비스 설명" (일반 정보)
        - "오늘 날씨는 어때?", "최신 뉴스 알려줘" (외부 정보)
        
        예시:
        - "가장 비싼 상품 3개 골라서 만들어줘" → YES (데이터 분석 + 시각화)
        - "평점 높은 상품 5개 보여줘" → YES (데이터 분석 + 시각화)
        - "리뷰가 많은 제품 5개 골라서 만들어줘" → YES (데이터 분석 + 시각화)
        - "브랜드별 상품 개수 보여줘" → YES (통계 + 시각화)
        - "가격대별 분포 분석해줘" → YES (분석 + 시각화)
        - "어떻게 주문하나요?" → NO (거래 방법)
        - "로그인 방법 알려줘" → NO (계정 관련)
        
        응답은 "YES" 또는 "NO"로만 해주세요.
        '''
        
        message = [
            HumanMessage(question),
            SystemMessage(prompt)
        ]
        
        response = chat_model.invoke(message)
        result = str(response.content).strip().upper()
        print(f"그래프 요청 분석 결과: {result}")
        
        # 응답이 예상과 다르면 기본적으로 True 반환 (안전장치)
        if result not in ["YES", "NO"]:
            print(f"예상치 못한 응답: {result}, 기본값 True 반환")
            return True
            
        return result == "YES"
        
    except Exception as e:
        print(f"그래프 요청 분석 중 오류 발생: {e}")
        # 오류 발생 시 기본적으로 True 반환 (안전장치)
        return True


def is_related_to_database(question):
    """질문이 데이터베이스 정보와 관련있는지 판단하는 함수"""
    try:
        chat_model = ChatOpenAI(temperature=0.1)
        
        prompt = '''
        다음 질문이 데이터베이스에 저장된 정보와 관련있는지 판단해주세요.
        
        데이터베이스 관련 키워드:
        - "상품", "제품", "의류", "옷", "브랜드", "카테고리"
        - "가격", "원", "만원", "비용", "금액", "비싼", "싼"
        - "평점", "리뷰", "후기", "별점"
        - "재고", "수량", "개수", "개"
        - "판매", "인기", "인기순", "최신", "신상"
        - "가장 비싼", "가장 싼", "평점 높은", "평점 낮은"
        
        데이터베이스와 관련없는 키워드:
        - "날씨", "기온", "날씨 정보" (외부 정보)
        - "뉴스", "뉴스 정보", "최신 뉴스" (외부 정보)
        - "주식", "주가", "금융" (외부 정보)
        - "운세", "점성술", "사주" (외부 정보)
        - "요리법", "레시피", "음식" (외부 정보)
        - "여행", "관광", "호텔" (외부 정보)
        - "영화", "드라마", "연예인" (외부 정보)
        
        예시:
        - "가장 비싼 상품 3개" → YES (상품 가격 관련)
        - "평점 높은 상품 5개" → YES (상품 평점 관련)
        - "브랜드별 상품 개수" → YES (상품, 브랜드 관련)
        - "오늘 날씨는 어때?" → NO (외부 정보)
        
        응답은 "YES" 또는 "NO"로만 해주세요.
        '''
        
        message = [
            HumanMessage(question),
            SystemMessage(prompt)
        ]
        
        response = chat_model.invoke(message)
        result = str(response.content).strip().upper()
        print(f"DB 관련성 분석 결과: {result}")
        
        # 응답이 예상과 다르면 기본적으로 True 반환 (안전장치)
        if result not in ["YES", "NO"]:
            print(f"예상치 못한 응답: {result}, 기본값 True 반환")
            return True
            
        return result == "YES"
        
    except Exception as e:
        print(f"DB 관련성 분석 중 오류 발생: {e}")
        # 오류 발생 시 기본적으로 True 반환 (안전장치)
        return True

def select_relevant_table(input_text, intent):
    """의도에 따라 관련 테이블 선택"""
    chat_model = ChatOpenAI(temperature=0.5)
    my_db_list = db.search_db()
    
    intent_table_mapping = {
        # 기존 의도 확장
        'product_info': ['products', 'product_options', 'product_images', 'product_thumbnails', 'brands', 'categories', 'categories_sub'],
        'order_status': ['orders', 'order_items', 'payments', 'carts', 'cart_items', 'products', 'product_options'],
        'customer_service': ['products', 'brands', 'reviews', 'review_images', 'review_likes', 'boards', 'comments', 'replies', 'member'],
        'technical_support': ['products', 'product_images', 'member', 'member_point', 'member_roles'],
        'site_introduction': ['products', 'categories', 'brands', 'donation_products', 'member', 'reviews'],
        'general_inquiry': ['products', 'categories', 'brands'],
        
        # 새로운 의도 추가
        'donation_info': ['donation_products', 'donation_options', 'donation_images', 'member', 'member_point'],
        'review_info': ['reviews', 'review_images', 'review_likes', 'products', 'member'],
        'member_info': ['member', 'member_point', 'member_roles', 'carts', 'orders'],
        'board_info': ['boards', 'board_images', 'comments', 'replies', 'member']
    }
    
    relevant_tables = intent_table_mapping.get(intent, my_db_list)
    
    prompt = f'''
        사용자 질문: {input_text}
        분석된 의도: {intent}
        관련 가능한 테이블: {relevant_tables}
        전체 DB 테이블: {my_db_list}
        
        위 질문을 해결하기 위해 가장 적합한 테이블을 선택해주세요.
        테이블 이름만 반환해주세요. 예시: products
    '''
    
    message = [
        HumanMessage(input_text),
        SystemMessage(prompt)
    ]
    
    response = chat_model.invoke(message)
    return str(response.content).strip()


def generate_contextual_response(input_text, table_name, intent):
    chat_model = ChatOpenAI(temperature=0.7)
    
    # 테이블 데이터 조회
    db_info = db.show_data(table_name)
    
    base_prompt = RESPONSE_TEMPLATES.get(intent, RESPONSE_TEMPLATES['general_inquiry'])
    
    # site_introduction 의도인 경우 특별 처리
    if intent == 'site_introduction':
        prompt = f'''
        {base_prompt}
        
        사용자 질문: {input_text}
        
        위 질문에 대해 Refit 플랫폼에 대한 명확하고 친절한 소개를 제공해주세요.
        DB 정보는 참고용으로만 사용하고, 사이트 소개에 집중해주세요.
        
        반드시 Refit이 "지속가능한 패션을 위한 중고 의류 거래 플랫폼"이라는 점을 강조해주세요.
        환경 보호와 의류 재활용에 대한 내용도 포함해주세요.

        답변은 친절하고 자연스럽게, 사용자 입장에서 이해하기 쉽게 해줘.  
        내용이 길어질 땐 줄바꿈으로 가독성 있게 정리해줘.
        
        만약 욕을 하거나 상품과 관련없는 정보를 물어보면
        '해당 정보는 답변드릴 수 없습니다' 라고 회신해.
        '''
    else:
        prompt = f'''
        {base_prompt}
        
        참고할 DB 정보: {db_info}

        만약 욕을 하거나 상품과 관련없는 정보를 물어보면
        '해당 정보는 답변드릴 수 없습니다' 라고 회신해.
        '''
    
    message = [
        HumanMessage(input_text),
        SystemMessage(prompt)
    ]
    
    response = chat_model.invoke(message)
    return str(response.content).strip()


def check_login_required(user_message):
    """로그인이 필요한 기능인지 확인"""
    login_required_keywords = [
        '구매', '상품 구매', '결제', '장바구니 담기', '상품 담기',
        '기부', '기부하기', '리뷰 쓰기', '후기 작성',
        '마이페이지', '주문내역', '적립금', '포인트 확인'
    ]
    
    for keyword in login_required_keywords:
        if keyword in user_message:
            return True
    return False

def check_recommend_page_access(user_message, access_token=None, member_cookie=None):
    """
    추천 페이지 접근 조건을 확인하고 적절한 응답을 생성합니다.
    """
    # 로그인 상태 확인
    if not access_token:
        return {
            "can_access": False,
            "message": "추천 페이지는 로그인이 필요한 서비스입니다. 먼저 로그인해주세요.",
            "redirect_to": "/main"
        }
    
    # 쿠키에서 신체정보 확인
    if not member_cookie or not member_cookie.get("member"):
        return {
            "can_access": False,
            "message": "로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
            "redirect_to": "/main"
        }
    
    member_info = member_cookie.get("member", {})
    height = member_info.get("height", 0)
    weight = member_info.get("weight", 0)
    
    # 신체정보 확인 (키와 몸무게가 모두 0보다 큰지 확인)
    if height <= 0 or weight <= 0:
        return {
            "can_access": False,
            "message": "추천 서비스를 이용하려면 신체정보(키, 몸무게)를 입력해주세요. 회원정보 수정 페이지에서 입력하실 수 있습니다.",
            "redirect_to": "/member/modify"
        }
    
    # 모든 조건 만족
    return {
        "can_access": True,
        "message": "사용자 체형에 맞는 상품을 추천해드리겠습니다. 추천 페이지로 이동합니다.",
        "redirect_to": "/main/recommend"
    }

def detect_navigation_keywords(user_message, bot_response, is_logged_in=False, access_token=None, member_cookie=None):
    """페이지 이동 키워드를 감지하여 버튼 정보를 반환"""
    navigation_info = {
        'show_button': False,
        'button_text': '',
        'button_url': '',
        'login_required': False
    }
    
    # 로그인 필요 여부 확인
    login_required = check_login_required(user_message)
    navigation_info['login_required'] = login_required and not is_logged_in
    
    # 로그인이 필요한 질문인데 로그인하지 않은 경우
    if login_required and not is_logged_in:
        navigation_info['show_button'] = True
        navigation_info['button_text'] = '로그인 페이지로 이동'
        navigation_info['button_url'] = '/member/login'
        # 응답 메시지 수정
        bot_response = "로그인이 필요한 서비스입니다. 먼저 로그인해주세요."
        return navigation_info
    
    # 결제 방식 감지
    payment_method = detect_payment_method(user_message)
    
    # 장바구니 구매 관련 키워드 감지
    cart_purchase_keywords = [
        '장바구니에 있는 상품 구매', '장바구니 상품 구매', '장바구니 구매',
        '장바구니 상품 카드로 구매', '장바구니 상품 적립금으로 구매',
        '장바구니 카드로 구매', '장바구니 적립금으로 구매'
    ]
    
    # 장바구니 구매 요청인지 확인
    is_cart_purchase = any(keyword in user_message for keyword in cart_purchase_keywords)
    
    if is_cart_purchase:
        navigation_info['show_button'] = True
        
        if payment_method == "card":
            navigation_info['button_text'] = '장바구니 전체 선택 후 카드 결제'
            navigation_info['button_url'] = '/cart?selectAll=true&goToPayment=true&paymentMethod=card'
        elif payment_method == "point":
            navigation_info['button_text'] = '장바구니 전체 선택 후 적립금 결제'
            navigation_info['button_url'] = '/cart?selectAll=true&goToPayment=true&paymentMethod=point'
        else:
            # 결제 방식이 명시되지 않은 경우 기본값
            navigation_info['button_text'] = '장바구니 전체 선택 후 구매'
            navigation_info['button_url'] = '/cart?selectAll=true&goToPayment=true'
        
        return navigation_info
    
    # 일반 키워드 매핑
    navigation_keywords = {
        '구매': {'text': '구매 페이지로 이동', 'url': '/order/payment'},
        '장바구니': {'text': '장바구니로 이동', 'url': '/cart'},
        '마이페이지': {'text': '마이페이지로 이동', 'url': '/member/mypage'},
        '주문내역': {'text': '주문내역으로 이동', 'url': '/order/order-list'},
        '상품 상세': {'text': '상품 상세보기', 'url': '/product/1'},
        '브랜드 상품': {'text': '브랜드 상품 보기', 'url': '/main/brand'},
        '브랜드': {'text': '브랜드 페이지로 이동', 'url': '/main/brand'},
        'NEW': {'text': 'NEW 페이지로 이동', 'url': '/main/new'},
        '랭킹': {'text': '랭킹 페이지로 이동', 'url': '/main/ranking'},
        '세일': {'text': '세일 페이지로 이동', 'url': '/main/sale'},
        '나눔': {'text': '나눔 페이지로 이동', 'url': '/sharing'},
        '커뮤니티': {'text': '커뮤니티로 이동', 'url': '/boards'}
    }
    
    # 추천 페이지 키워드 감지 (특별 처리)
    recommend_keywords = [
        '추천', '추천 페이지', '추천 상품', '개인 추천', '맞춤 추천',
        '체형', '체형에 맞는', '내 체형', '키에 맞는', '몸무게에 맞는',
        '신체', '신체에 맞는', '사이즈', '사이즈에 맞는', '맞는 옷',
        '어울리는', '어울리는 옷', '체형별', '신체별', '개인별'
    ]
    is_recommend_request = any(keyword in user_message for keyword in recommend_keywords)
    
    if is_recommend_request:
        # 추천 페이지 접근 조건 확인
        recommend_check = check_recommend_page_access(user_message, access_token, member_cookie)
        
        if recommend_check["can_access"]:
            navigation_info['show_button'] = True
            navigation_info['button_text'] = '추천 페이지로 이동'
            navigation_info['button_url'] = recommend_check["redirect_to"]
        else:
            # 조건을 만족하지 않으면 메시지만 표시하고 메인으로 리다이렉트
            navigation_info['show_button'] = True
            navigation_info['button_text'] = '메인 페이지로 이동'
            navigation_info['button_url'] = recommend_check["redirect_to"]
            # 응답 메시지도 수정
            bot_response = recommend_check["message"]
        
        return navigation_info
    
    # 상품 추천 키워드 감지
    recommendation_keywords = {
        '평점 높은': {'text': '상품 상세보기', 'url': '/product/1'},
        '가장 싼': {'text': '상품 상세보기', 'url': '/product/1'},
        '인기 상품': {'text': '상품 상세보기', 'url': '/product/1'},
        '브랜드 추천': {'text': '브랜드 상품 보기', 'url': '/main/brand'}
    }
    
    # 상품 추천 키워드 먼저 확인
    for keyword, info in recommendation_keywords.items():
        if keyword in user_message:
            navigation_info['show_button'] = True
            navigation_info['button_text'] = info['text']
            navigation_info['button_url'] = info['url']
            break
    
    # 일반 네비게이션 키워드 확인
    if not navigation_info['show_button']:
        for keyword, info in navigation_keywords.items():
            if keyword in user_message:
                navigation_info['show_button'] = True
                navigation_info['button_text'] = info['text']
                navigation_info['button_url'] = info['url']
                break
    
    return navigation_info

def log_chat(user_message, bot_response, intent, table):
    """채팅 로그를 파일에 저장하는 함수"""
    try:
        # 로그 파일 경로 설정
        log_dir = "chat_logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # 오늘 날짜로 파일명 생성
        today = datetime.now().strftime("%Y-%m-%d")
        log_file = os.path.join(log_dir, f"chat_log_{today}.txt")
        
        # 현재 시간
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # 로그 내용 구성
        log_entry = f"""
=== 채팅 로그 ===
시간: {current_time}
의도: {intent}
테이블: {table}

사용자 질문:
{user_message}

봇 답변:
{bot_response}

{'='*50}
"""
        
        # 파일에 로그 추가 (UTF-8 인코딩 사용)
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry)
            
        print(f"채팅 로그가 {log_file}에 저장되었습니다.")
        
    except Exception as e:
        print(f"로그 저장 중 오류 발생: {e}")
