export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface AnalysisResult {
  analysis: string;
  analysisType?: 'basic' | 'detailed';
  petType?: string;
  error?: string;
}

export interface ChatResponse {
  response: string;
  error?: string;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface MedicalSigns {
  skin?: string[];
  eyes?: string[];
  posture?: string[];
  behavior?: string[];
  other?: string[];
}

export interface PetDisease {
  name: string;
  symptoms: string[];
  description: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  probability?: 'high' | 'medium' | 'low';
  matchedSigns?: string[];
}

export type UrgencyLevel = 'normal' | 'prompt' | 'emergency';

export interface AnalysisData {
  symptoms?: string[];
  possibleDiseases?: PetDisease[];
  recommendations?: string[];
  severity?: 'low' | 'medium' | 'high' | 'emergency';
  needsVet?: boolean;
  confidence?: number;
  rawAnalysis: string;
  
  // 상세 분석 결과를 위한 추가 필드
  analysisType?: 'basic' | 'detailed';
  petType?: string;
  keyFindings?: string[];
  medicalSigns?: MedicalSigns;
  differentialDiagnosis?: string[];
  urgencyLevel?: UrgencyLevel;
  annotatedImageData?: string; // 분석된 이미지에 주석을 추가한 데이터 URL
}

// 비디오 분석 관련 타입
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

export interface VideoAnalysisResponse {
  analysis: VideoAnalysisData;
  error?: string;
} 