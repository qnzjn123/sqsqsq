'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, UploadStatus, AnalysisData, VideoAnalysisData } from '@/utils/types';
import ChatMessage from '@/components/ChatMessage';
import ImageUploader from '@/components/ImageUploader';
import VideoUploader from '@/components/VideoUploader';
import AnalysisResult from '@/components/AnalysisResult';
import VideoAnalysisResult from '@/components/VideoAnalysisResult';
import { analyzeResponse } from '@/utils/analyzer';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: '안녕하세요! 댕냥닥터 AI입니다. 반려동물의 사진이나 비디오를 업로드하거나, 증상에 대해 질문해주세요.',
      createdAt: new Date(),
    },
  ]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [videoUploadStatus, setVideoUploadStatus] = useState<UploadStatus>('idle');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [videoAnalysisData, setVideoAnalysisData] = useState<VideoAnalysisData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 메시지가 추가될 때마다 스크롤을 하단으로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: userMessage.role,
              content: userMessage.content,
            },
          ],
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const botMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.response,
          createdAt: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || '응답을 생성하는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('에러:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        createdAt: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (file: File, petType: string, analysisType: 'basic' | 'detailed') => {
    setUploadStatus('uploading');
    setAnalysisData(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('petType', petType);
      formData.append('analysisType', analysisType);
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus('success');
        
        // 개선된 분석 유틸리티 사용
        const analysisResult = analyzeResponse(
          data.analysis, 
          data.analysisType, 
          data.petType
        );
        setAnalysisData(analysisResult);
        
        // 분석 결과를 메시지로 추가
        const botMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.analysis,
          createdAt: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setUploadStatus('error');
        throw new Error(data.error || '이미지 분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('이미지 분석 오류:', error);
      setUploadStatus('error');
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '죄송합니다. 이미지를 분석하는 중 오류가 발생했습니다. 다른 이미지로 다시 시도해주세요.',
        createdAt: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleVideoUpload = async (file: File, animalType: string) => {
    setVideoUploadStatus('uploading');
    setVideoAnalysisData(null);
    
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('animalType', animalType);
      
      const response = await fetch('/api/video-analysis', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVideoUploadStatus('success');
        setVideoAnalysisData(data.analysis);
        
        // 분석 결과를 메시지로 추가
        const botMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `[비디오 분석 결과] ${data.analysis.summary}`,
          createdAt: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setVideoUploadStatus('error');
        throw new Error(data.error || '비디오 분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('비디오 분석 오류:', error);
      setVideoUploadStatus('error');
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '죄송합니다. 비디오를 분석하는 중 오류가 발생했습니다. 다른 비디오로 다시 시도해주세요.',
        createdAt: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-600 text-white p-3 sm:p-4 shadow-md">
        <div className="container mx-auto px-2 sm:px-4">
          <h1 className="text-lg sm:text-xl font-bold">댕냥닥터 - 반려동물 질병 진단 AI</h1>
          <p className="text-xs sm:text-sm text-blue-100">
            Google Gemini 1.5 기반 AI로 반려동물 건강 상태를 컴퓨터 비전으로 분석합니다
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 container mx-auto p-2 sm:p-4 flex flex-col md:flex-row gap-4">
        {/* 채팅 영역 */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 flex flex-col h-[50vh] md:h-auto">
          <div className="flex-1 overflow-y-auto mb-3 sm:mb-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="mt-auto">
            <div className="flex gap-1 sm:gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
                className="flex-1 px-2 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isProcessing ? "처리 중..." : "메시지를 입력하세요..."}
              />
              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                전송
              </button>
            </div>
          </form>
        </div>
        
        {/* 사이드바 - 이미지/비디오 업로드 및 분석 결과 */}
        <div className="w-full md:w-96 flex flex-col gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
            <div className="flex border-b mb-3 sm:mb-4">
              <button
                className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium ${activeTab === 'image' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('image')}
              >
                이미지 분석
              </button>
              <button
                className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium ${activeTab === 'video' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('video')}
              >
                행동 비디오 분석
              </button>
            </div>
            
            {activeTab === 'image' ? (
              <>
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">의학 영상 분석</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  반려동물의 사진을 업로드하면 AI가 컴퓨터 비전으로 분석하여 잠재적인 건강 문제를 감지합니다.
                </p>
                <ImageUploader onUpload={handleImageUpload} status={uploadStatus} />
              </>
            ) : (
              <>
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">행동 기반 질병 탐지</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  반려동물의 행동이 담긴 비디오를 업로드하면 AI가 움직임과 행동 패턴을 분석하여 잠재적인 건강 문제를 감지합니다.
                </p>
                <VideoUploader onUpload={handleVideoUpload} status={videoUploadStatus} />
              </>
            )}
          </div>
          
          {activeTab === 'image' && (analysisData || uploadStatus === 'uploading') && (
            <AnalysisResult data={analysisData} isLoading={uploadStatus === 'uploading'} />
          )}
          
          {activeTab === 'video' && (videoAnalysisData || videoUploadStatus === 'uploading') && (
            <VideoAnalysisResult data={videoAnalysisData} isLoading={videoUploadStatus === 'uploading'} />
          )}
        </div>
      </main>
      
      {/* 푸터 */}
      <footer className="bg-gray-100 p-3 sm:p-4 border-t border-gray-200 text-center text-gray-600 text-xs sm:text-sm">
        <p>댕냥닥터는 Google Gemini 1.5 Flash 모델을 사용하는 의학적 이미지 및 비디오 분석 시스템입니다. 분석 결과는 참고용이며 전문적인 수의학적 진단을 대체할 수 없습니다.</p>
      </footer>
    </div>
  );
}
