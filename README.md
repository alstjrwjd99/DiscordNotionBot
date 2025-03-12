# DiscordNotionBot
디스코드 채팅 ( 시작, 종료 )를 통해 스터디 시간을 자동으로 Notion Database에 인증하는 프로그램입니다.

<img width="334" alt="image" src="https://github.com/user-attachments/assets/7945f8f5-e2bb-402b-8048-1f7edfe177ca" />


## ✅ 사용 방법

### 디스코드에서의 명령어
- 시작 : 스터디 시작 시간 기록
- 종료 : 스터디 종료 시간 기록

<img width="632" alt="image" src="https://github.com/user-attachments/assets/7e5f7208-8cd6-4d8d-8a5e-d76f102e2cbb" />

### Notion Database 업데이트
- 사용자별 스터디 시작/종료 시간이 자동으로 기록됩니다.

<img width="930" alt="image" src="https://github.com/user-attachments/assets/d3e15dc1-5dc1-4c19-ad08-5316c1b9b3ed" />

## ✅ 설정 방법

### 1. 프로젝트 클론

```
git clone https://github.com/alstjrwjd99/DiscordNotionBot.git
```

### 2. 환경 변수 설정 (.env 파일)

동일한 폴더 내에 .env 파일을 생성하고 다음 값을 추가하세요. ( 맨 하단 API key 발급 받는 방법 참조 )

```
BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
CHANNEL_ID=YOUR_DISCORD_CHANNEL_ID
NOTION_TOKEN=YOUR_NOTION_INTEGRATION_TOKEN
DATABASE_ID=YOUR_NOTION_DATABASE_ID
```

### 3. updateTime.txt 파일에 가져올 시작 시간 기재

updateTime.txt내에 가져오고 싶은 시작 시간 ( 한국 시간 )을 다음 형식으로 입력하세요.
```
2025-03-12 09:00
```

## 실행 방법

1. 의존성 설치
```
npm install
```

2. 프로그램 실행
```
npm start
```

### 개발 환경
node : v23.0.0
npm : 10.9.0

## ✅ API Key 발급 방법 

### Discord Bot Token (BOT_TOKEN)

디스코드 봇을 생성하고 토큰을 발급받는 방법입니다.
1.	Discord Developer Portal 에 접속합니다.
2.	New Application 버튼을 클릭한 후 봇의 이름을 입력하고 생성합니다.
3.	좌측 메뉴에서 Bot 탭을 선택한 후 Add Bot을 클릭합니다.
4.	Reset Token을 클릭해 Bot Token을 생성하고 복사합니다.
5.	.env 파일의 BOT_TOKEN에 붙여넣기 합니다.

### Discord Channel ID (CHANNEL_ID)

디스코드 채널 ID를 얻는 방법입니다.
1.	디스코드에서 사용자 설정 (⚙️) → 고급 → 개발자 모드를 활성화합니다.
2.	채널 이름에서 우클릭 → ID 복사 를 선택합니다.
3.	.env 파일의 CHANNEL_ID에 붙여넣기 합니다.

### Notion Integration Token (NOTION_TOKEN)

Notion과 연동하기 위한 통합 토큰을 발급받는 방법입니다.
1.	Notion Developers 페이지로 이동합니다.
2.	New Integration을 클릭한 후 이름을 입력합니다.
3.	Workspace 선택 → Submit을 클릭합니다.
4.	생성된 Integration의 Secret Key를 복사합니다.
5.	.env 파일의 NOTION_TOKEN에 붙여넣기 합니다.

### Notion Database ID (DATABASE_ID)

Notion의 Database ID를 얻는 방법입니다.
1.	Notion에서 데이터베이스를 생성합니다.
2.	데이터베이스 페이지에서 주소(URL)에서 / 뒤의 Database ID를 복사합니다.
