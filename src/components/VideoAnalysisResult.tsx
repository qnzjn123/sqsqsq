import { useState } from 'react';

export interface BehaviorData {
  timestamp: string;
  behavior: string;
  confidence: number;
  description: string;
  severity?: 'normal' | 'attention' | 'concern' | 'serious';
}

export interface VideoAnalysisData {
  animalType: string;
  behaviors: BehaviorData[];
  summary: string;
  possibleIssues: string[];
  recommendations: string[];
  overallAssessment: {
    status: 'healthy' | 'minor_concern' | 'needs_attention' | 'vet_visit_recommended' | 'emergency';
    description: string;
  };
}

interface VideoAnalysisResultProps {
  data: VideoAnalysisData | null;
  isLoading: boolean;
}

export default function VideoAnalysisResult({ data, isLoading }: VideoAnalysisResultProps) {
  const [selectedBehavior, setSelectedBehavior] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">행동 분석 결과</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
          <div className="h-32 bg-gray-200 rounded mb-3"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getSeverityClass = (severity?: string) => {
    switch (severity) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-blue-100 text-blue-800';
      case 'concern': return 'bg-yellow-100 text-yellow-800';
      case 'serious': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'minor_concern': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vet_visit_recommended': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h2 className="text-lg font-semibold mb-2">행동 분석 결과</h2>
      
      <div className={`p-3 rounded-md mb-4 border ${getStatusClass(data.overallAssessment.status)}`}>
        <div className="font-medium mb-1">
          {data.overallAssessment.status === 'healthy' && '건강 상태 양호'}
          {data.overallAssessment.status === 'minor_concern' && '경미한 문제 가능성'}
          {data.overallAssessment.status === 'needs_attention' && '주의 필요'}
          {data.overallAssessment.status === 'vet_visit_recommended' && '수의사 상담 권장'}
          {data.overallAssessment.status === 'emergency' && '응급 상황'}
        </div>
        <p className="text-sm">{data.overallAssessment.description}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">종합 요약</h3>
        <p className="text-sm text-gray-700">{data.summary}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">탐지된 행동 패턴</h3>
        <ul className="space-y-2">
          {data.behaviors.map((behavior, index) => (
            <li 
              key={index} 
              className={`p-2 rounded-md border cursor-pointer transition-colors ${selectedBehavior === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setSelectedBehavior(selectedBehavior === index ? null : index)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{behavior.behavior}</span>
                  <span className="text-xs text-gray-500 ml-2">({behavior.timestamp})</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityClass(behavior.severity)}`}>
                  {behavior.severity === 'normal' && '정상'}
                  {behavior.severity === 'attention' && '주의'}
                  {behavior.severity === 'concern' && '우려'}
                  {behavior.severity === 'serious' && '심각'}
                  {!behavior.severity && '분류 없음'}
                </span>
              </div>
              
              {selectedBehavior === index && (
                <div className="mt-2 text-sm text-gray-700">
                  <p>{behavior.description}</p>
                  <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${behavior.confidence * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-0.5 text-gray-500">신뢰도: {Math.round(behavior.confidence * 100)}%</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {data.possibleIssues.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">잠재적 문제</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {data.possibleIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.recommendations.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">권장 사항</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {data.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 italic">
        * 이 분석 결과는 참고용이며, 전문적인 수의학적 진단을 대체할 수 없습니다.
      </div>
    </div>
  );
} 