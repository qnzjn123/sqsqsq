'use client';

import { AnalysisData } from '@/utils/types';
import { useState } from 'react';

interface AnalysisResultProps {
  data: AnalysisData | null;
  isLoading: boolean;
}

export default function AnalysisResult({ data, isLoading }: AnalysisResultProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'diseases'>('overview');
  
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }
  
  if (!data) return null;
  
  const severityColor = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800',
  };

  const urgencyColor = {
    normal: 'bg-blue-100 text-blue-800',
    prompt: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800',
  };

  // 신뢰도를 퍼센트로 변환
  const confidencePercent = data.confidence ? Math.round(data.confidence * 100) : null;

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">분석 결과</h3>
          <div className="flex gap-2">
            {data.severity && (
              <span 
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColor[data.severity]}`}
              >
                {data.severity === 'low' && '낮은 심각도'}
                {data.severity === 'medium' && '중간 심각도'}
                {data.severity === 'high' && '높은 심각도'}
                {data.severity === 'emergency' && '응급 상황'}
              </span>
            )}
            {data.analysisType === 'detailed' && data.urgencyLevel && (
              <span 
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColor[data.urgencyLevel]}`}
              >
                {data.urgencyLevel === 'normal' && '정기 진료'}
                {data.urgencyLevel === 'prompt' && '빠른 진료 필요'}
                {data.urgencyLevel === 'emergency' && '응급 진료 필요'}
              </span>
            )}
          </div>
        </div>
        
        {data.needsVet && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <strong>수의사 진료가 필요합니다!</strong> 가능한 빨리 동물병원을 방문하세요.
          </div>
        )}
        
        {data.petType && data.petType !== 'unknown' && (
          <p className="text-sm text-gray-600 mb-2">분석된 반려동물: {data.petType === 'dog' ? '강아지' : 
                                                  data.petType === 'cat' ? '고양이' : 
                                                  data.petType === 'bird' ? '새' :
                                                  data.petType === 'rabbit' ? '토끼' :
                                                  data.petType === 'hamster' ? '햄스터' :
                                                  data.petType === 'reptile' ? '파충류' : data.petType}</p>
        )}
        
        {confidencePercent && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">AI 분석 신뢰도</span>
              <span className="text-sm font-medium text-gray-700">{confidencePercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  confidencePercent >= 80 ? 'bg-green-600' : 
                  confidencePercent >= 60 ? 'bg-yellow-400' : 'bg-red-500'
                }`} 
                style={{ width: `${confidencePercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              이 수치는 AI의 응답 확실성을 예측한 값으로, 실제 정확도를 나타내지 않을 수 있습니다.
            </p>
          </div>
        )}
      </div>
      
      {/* 상세 분석 모드 탭 내비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            개요
          </button>
          {data.analysisType === 'detailed' && (
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'medical'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              의학적 징후
            </button>
          )}
          <button
            onClick={() => setActiveTab('diseases')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'diseases'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            가능한 질병
          </button>
        </nav>
      </div>
      
      <div className="p-4">
        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div>
            {data.keyFindings && data.keyFindings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">주요 발견사항</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {data.keyFindings.map((finding, index) => (
                    <li key={index} className="text-gray-700">{finding}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(!data.keyFindings || data.keyFindings.length === 0) && data.symptoms && data.symptoms.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">관찰된 증상</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {data.symptoms.map((symptom, index) => (
                    <li key={index} className="text-gray-700">{symptom}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.recommendations && data.recommendations.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">권장 사항</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {data.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* 의학적 징후 탭 */}
        {activeTab === 'medical' && data.medicalSigns && (
          <div>
            <h4 className="font-medium text-gray-800 mb-3">상세 의학적 징후</h4>
            
            {data.medicalSigns.skin && data.medicalSigns.skin.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">피부 상태</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {data.medicalSigns.skin.map((sign, index) => (
                    <li key={index} className="text-gray-700 text-sm">{sign}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.medicalSigns.eyes && data.medicalSigns.eyes.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">눈 상태</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {data.medicalSigns.eyes.map((sign, index) => (
                    <li key={index} className="text-gray-700 text-sm">{sign}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.medicalSigns.posture && data.medicalSigns.posture.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">체형 및 자세</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {data.medicalSigns.posture.map((sign, index) => (
                    <li key={index} className="text-gray-700 text-sm">{sign}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.medicalSigns.behavior && data.medicalSigns.behavior.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">행동 패턴</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {data.medicalSigns.behavior.map((sign, index) => (
                    <li key={index} className="text-gray-700 text-sm">{sign}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.medicalSigns.other && data.medicalSigns.other.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">기타 징후</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {data.medicalSigns.other.map((sign, index) => (
                    <li key={index} className="text-gray-700 text-sm">{sign}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.differentialDiagnosis && data.differentialDiagnosis.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h5 className="text-sm font-medium text-gray-700 mb-1">감별진단</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {data.differentialDiagnosis.map((diagnosis, index) => (
                    <li key={index} className="text-gray-700 text-sm">{diagnosis}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* 가능한 질병 탭 */}
        {activeTab === 'diseases' && (
          <div>
            {data.possibleDiseases && data.possibleDiseases.length > 0 ? (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">가능성 있는 질병</h4>
                <div className="space-y-3">
                  {data.possibleDiseases.map((disease, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-gray-800">{disease.name}</h5>
                        {disease.probability && (
                          <span 
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              disease.probability === 'high' ? 'bg-red-100 text-red-800' : 
                              disease.probability === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {disease.probability === 'high' ? '높은 확률' : 
                             disease.probability === 'medium' ? '중간 확률' : '낮은 확률'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{disease.description}</p>
                      
                      {disease.symptoms && disease.symptoms.length > 0 && (
                        <div className="mt-2">
                          <h6 className="text-xs font-medium text-gray-700">관련 증상:</h6>
                          <ul className="list-disc pl-5 mt-1 text-xs text-gray-600">
                            {disease.symptoms.map((symptom, idx) => (
                              <li key={idx}>{symptom}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {disease.recommendations && disease.recommendations.length > 0 && (
                        <div className="mt-2">
                          <h6 className="text-xs font-medium text-gray-700">권장 조치:</h6>
                          <ul className="list-disc pl-5 mt-1 text-xs text-gray-600">
                            {disease.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-600 py-4">
                분석된 질병 정보가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {showRaw ? '상세 분석 결과 숨기기' : '상세 분석 결과 보기'}
        </button>
        
        {showRaw && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
            {data.rawAnalysis}
          </div>
        )}
      </div>
    </div>
  );
} 