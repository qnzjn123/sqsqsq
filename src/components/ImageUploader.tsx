'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { UploadStatus } from '@/utils/types';
import Image from 'next/image';

interface ImageUploaderProps {
  onUpload: (file: File, petType: string, analysisType: 'basic' | 'detailed') => void;
  status: UploadStatus;
}

export default function ImageUploader({ onUpload, status }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [petType, setPetType] = useState<string>('dog');
  const [analysisType, setAnalysisType] = useState<'basic' | 'detailed'>('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onUpload(file, petType, analysisType);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onUpload(file, petType, analysisType);
  };

  const handleAnalyze = () => {
    if (preview && fileInputRef.current?.files?.[0]) {
      onUpload(fileInputRef.current.files[0], petType, analysisType);
    }
  };

  return (
    <div className="w-full mb-4">
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">반려동물 유형</label>
          <select
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={status === 'uploading'}
          >
            <option value="dog">강아지</option>
            <option value="cat">고양이</option>
          </select>
        </div>
        
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">분석 모드</label>
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as 'basic' | 'detailed')}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={status === 'uploading'}
          >
            <option value="basic">기본 분석</option>
            <option value="detailed">상세 의학 분석</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {analysisType === 'detailed' ? 
              '상세 분석은 보다 정확한 의학적 특징 추출 및 감별진단을 제공합니다.' : 
              '기본 분석은 주요 증상과 간단한 질병 예측 정보를 제공합니다.'}
          </p>
        </div>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          status === 'uploading' ? 'border-yellow-400 bg-yellow-50' : 
          status === 'success' ? 'border-green-400 bg-green-50' : 
          status === 'error' ? 'border-red-400 bg-red-50' : 
          'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
        } transition-colors duration-200 ease-in-out cursor-pointer`}
        onClick={handleButtonClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="flex flex-col items-center">
            <div className="relative max-h-64 w-full h-64 mb-2 rounded-lg overflow-hidden">
              <Image 
                src={preview} 
                alt="미리보기" 
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
            <p className="text-sm text-gray-600">이미지를 변경하려면 클릭하거나 새 이미지를 드래그하세요</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <p className="text-base text-gray-700 mb-1">
              반려동물 사진을 클릭하여 업로드하거나 여기에 드래그하세요
            </p>
            <p className="text-sm text-gray-500">
              고해상도 이미지를 사용하면 더 정확한 분석 결과를 얻을 수 있습니다
            </p>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {preview && (
        <div className="mt-3">
          <button
            onClick={handleAnalyze}
            disabled={status === 'uploading' || !preview}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'uploading' ? '분석 중...' : '다시 분석하기'}
          </button>
        </div>
      )}
      
      {status === 'uploading' && (
        <div className="mt-2 text-center text-yellow-600">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          이미지 분석 중...
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-2 text-center text-red-600">
          이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.
        </div>
      )}
    </div>
  );
} 