import fs from 'fs/promises'; 
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

import dotenv from 'dotenv';
dotenv.config();

const botToken = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;
const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.DATABASE_ID;

async function getMessagesAfter(channelId, targetDate) {
  let allMessages = [];
  let lastMessageId = null;
  const targetTimestamp = targetDate.getTime();

  try {
    while (true) {
      // URL 생성 (lastMessageId가 있으면 before 파라미터 추가)
      const url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100${
        lastMessageId ? `&before=${lastMessageId}` : ''
      }`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`메시지 가져오는데 에러 발생 -> ${response.status} ${response.statusText}`);
      }

      const messages = await response.json();

      if (messages.length === 0) {
        break; // 더 이상 메시지가 없으면 반복 종료
      }

      // targetDate 이후의 메시지만 포함
      const filteredMessages = messages.filter((msg) => new Date(msg.timestamp).getTime() > targetTimestamp);
      allMessages = allMessages.concat(filteredMessages);

      // 만약 필터링된 메시지가 없거나, 가져온 메시지 중 targetDate 이전 메시지가 포함되었다면 종료
      if (filteredMessages.length < messages.length) {
        break;
      }

      lastMessageId = messages[messages.length - 1].id;
    }

    return allMessages;

  } catch (error) {
    console.error('메시지 불러오는데 에러 발생 -> ', error);
    return [];
  }
}

function processMessages(messages) {
  const userSessions = {}; // 사용자별로 여러 쌍의 시작-종료를 저장

  messages.reverse().forEach((msg) => {
    let user = msg.author.global_name || msg.author.username;
    const content = msg.content.trim();

    if (content.startsWith('시작')) {
      // 사용자가 처음 등장했을 경우 초기화
      if (!userSessions[user]) {
        userSessions[user] = [];
      }

      // 현재 진행 중인 세션이 없는 경우 새 세션 추가
      const currentSession = userSessions[user].find((session) => !session.end);
      if (!currentSession) {
        userSessions[user].push({ start: msg.timestamp, end: null });
      } else {
        // 진행 중인 세션이 있다면 기존 세션을 완료하고 새로운 세션 시작
        console.log(`User: ${user}, Start: ${currentSession.start}, End: ${msg.timestamp}`);
        updateNotion(user, currentSession.start, msg.timestamp);
        currentSession.end = msg.timestamp; // 기존 세션 종료
        userSessions[user].push({ start: msg.timestamp, end: null }); // 새로운 세션 시작
      }
    } else if (content.startsWith('종료')) {
      const currentSession = userSessions[user]?.find((session) => !session.end);
      if (currentSession) {
        currentSession.end = msg.timestamp;
        console.log(`User: ${user}, Start: ${currentSession.start}, End: ${currentSession.end}`);
        updateNotion(user, currentSession.start, currentSession.end);
      }
    }
  });

  // 남아 있는 진행 중인 세션 로그 출력 (필요 시 제거 가능)
  Object.entries(userSessions).forEach(([user, sessions]) => {
    sessions.forEach((session) => {
      if (!session.end) {
        console.log(`이름 : ${user}, 아직 종료 안된 세션이 존재 -> Start: ${session.start}`);
      }
    });
  });
}

// 노션에 데이터를 업데이트하는 함수
async function updateNotion(user, startTime, endTime) {
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [{ text: { content: user } }]
          },
          Start: {
            date: { start: startTime }
          },
          End: {
            date: { start: endTime }
          }
        }
      })
    });

    if (response.ok) {
      console.log(`Notion 업데이트 됨 -> ${user}: ${startTime} - ${endTime}`);
    } else {
      console.error('Notion 업데이트 실패 -> ', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Notion 업데이트 에러 발생 -> ', error);
  }
}

// 파일에서 날짜와 시간 읽기
async function readLastUpdate() {
  try {
    const data = await fs.readFile('updateTime.txt', 'utf8');
    const [date, time] = data.trim().split(' ');

    if (!date || !time) {
      throw new Error('날짜 또는 시간 형식이 잘못되었습니다. (예: 2025-03-12 09:00)');
    }

    const targetDate = new Date(`${date}T${time}:00Z`);
    targetDate.setHours(targetDate.getHours() - 9);

    if (isNaN(targetDate)) {
      throw new Error('유효하지 않은 날짜 형식입니다.');
    }

    return targetDate;

  } catch (error) {
    console.error('날짜 읽기 오류: ', error.message);
    process.exit(1);
  }
}

(async () => {
  const targetDate = await readLastUpdate();
  const messages = await getMessagesAfter(channelId, targetDate);

  console.log(`${targetDate} 이후로 ${messages.length}개의 데이터 추가됨`);
  processMessages(messages);
})();