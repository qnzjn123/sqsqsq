import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// API 키를 환경 변수에서 가져오거나 백엔드에서만 접근 가능하도록 보관
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDZLCJRMv2VDX4tB06ge8X2bX_GArxYL1s';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '유효한 메시지가 필요합니다' },
        { status: 400 }
      );
    }

    // Gemini 1.5 Flash 모델 사용 (최신 모델)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // 사용자 메시지와 AI 응답을 분리하여 처리
    const userMessages: string[] = [];
    const aiResponses: string[] = [];
    
    // 첫 번째 메시지가 반드시 'user' 역할이어야 함
    const processedMessages = [...messages];
    
    // 메시지 역할 확인 및 변환
    processedMessages.forEach(msg => {
      if (msg.role === 'user') {
        userMessages.push(msg.content);
      } else if (msg.role === 'assistant') {
        aiResponses.push(msg.content);
      }
    });
    
    // 대화가 AI 메시지로 시작하면, 빈 사용자 메시지를 추가
    if (processedMessages.length > 0 && processedMessages[0].role === 'assistant') {
      userMessages.unshift("안녕하세요");
    }
    
    // 항상 userMessages.length는 aiResponses.length보다 1개 더 많거나 같아야 함
    const latestMessage = processedMessages[processedMessages.length - 1];
    
    try {
      let response;
      
      if (processedMessages.length === 1 && latestMessage.role === 'user') {
        // 단일 메시지인 경우 직접 생성
        const result = await model.generateContent(latestMessage.content);
        response = await result.response;
      } else {
        // 채팅 히스토리가 있는 경우
        // 사용자 메시지와 AI 응답을 번갈아가며 채팅 히스토리 구성
        const chatHistory = [];
        
        // 최소한 하나의 사용자 메시지가 있어야 함
        if (userMessages.length === 0) {
          userMessages.push("안녕하세요");
        }
        
        // 채팅 히스토리 구성 (사용자 메시지로 시작)
        for (let i = 0; i < Math.min(userMessages.length - 1, aiResponses.length); i++) {
          chatHistory.push({
            role: 'user',
            parts: [{ text: userMessages[i] }]
          });
          
          chatHistory.push({
            role: 'model',
            parts: [{ text: aiResponses[i] }]
          });
        }
        
        // 마지막 사용자 메시지 처리
        const lastUserContent = latestMessage.role === 'user' 
          ? latestMessage.content 
          : userMessages[userMessages.length - 1];
        
        // 채팅 시작
        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        });
        
        // 마지막 메시지 전송
        const result = await chat.sendMessage(lastUserContent);
        response = await result.response;
      }
      
      const text = response.text();
      return NextResponse.json({ response: text });
    } catch (error) {
      console.error('채팅 요청 오류:', error);
      throw error;
    }
  } catch (error: unknown) {
    console.error('Gemini API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '챗봇 응답 생성 중 오류가 발생했습니다';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 