import { AnalysisData, MedicalSigns, PetDisease, UrgencyLevel } from './types';

/**
 * AI 응답에서 증상 관련 텍스트를 추출합니다
 */
export function extractSymptoms(text: string): string[] {
  const symptoms: string[] = [];
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  
  // 증상 관련 키워드
  const symptomKeywords = ['증상', '상태', '관찰', '발견된 의학적 징후', '징후', '발견사항'];
  
  paragraphs.forEach(paragraph => {
    if (symptomKeywords.some(keyword => paragraph.toLowerCase().includes(keyword))) {
      // 콜론을 기준으로 분리하고 콜론 뒤의 내용을 추출
      const parts = paragraph.split(':');
      if (parts.length > 1) {
        // 쉼표나 점으로 나눠 개별 항목으로 분리
        const items = parts[1].split(/[,\.;]/);
        items.forEach(item => {
          const trimmed = item.trim();
          if (trimmed.length > 0) {
            symptoms.push(trimmed);
          }
        });
      }
    }
  });
  
  return symptoms.length > 0 ? symptoms : paragraphs.slice(0, 2).map(p => p.trim());
}

/**
 * AI 응답에서 권장사항을 추출합니다
 */
export function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  
  // 권장사항 관련 키워드
  const recommendationKeywords = ['권장', '조언', '해야 할', '필요', '조치', '관리', '권장 조치'];
  
  paragraphs.forEach(paragraph => {
    if (recommendationKeywords.some(keyword => paragraph.toLowerCase().includes(keyword))) {
      const parts = paragraph.split(':');
      if (parts.length > 1) {
        const items = parts[1].split(/[,\.;]/);
        items.forEach(item => {
          const trimmed = item.trim();
          if (trimmed.length > 0) {
            recommendations.push(trimmed);
          }
        });
      }
    }
  });
  
  return recommendations;
}

/**
 * AI 응답에서 심각도를 결정합니다
 */
export function determineSeverity(text: string): 'low' | 'medium' | 'high' | 'emergency' {
  // 각 심각도 수준에 대한 키워드 정의
  const lowKeywords = ['경미', '가벼운', '약간', '낮음', '심각하지 않', '정상'];
  const mediumKeywords = ['중간', '보통', '관찰', '주의'];
  const highKeywords = ['심각', '위험', '즉시', '필요', '치료'];
  const emergencyKeywords = ['응급', '긴급', '즉각', '생명', '위험'];
  
  // 구조화된 응답에서 심각도 평가 항목을 직접 찾음
  const severityMatch = text.match(/심각도\s*평가\s*:\s*(\S+)/i);
  if (severityMatch && severityMatch[1]) {
    const severityText = severityMatch[1].toLowerCase().trim();
    if (severityText.includes('응급')) return 'emergency';
    if (severityText.includes('높음')) return 'high';
    if (severityText.includes('중간')) return 'medium';
    if (severityText.includes('낮음')) return 'low';
  }
  
  // 구조화되지 않은 응답의 경우 키워드 기반 분석
  const textLower = text.toLowerCase();
  
  if (emergencyKeywords.some(keyword => textLower.includes(keyword))) {
    return 'emergency';
  } else if (highKeywords.some(keyword => textLower.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => textLower.includes(keyword))) {
    return 'medium';
  } else if (lowKeywords.some(keyword => textLower.includes(keyword))) {
    return 'low';
  } else {
    return 'medium'; // 기본값은 중간으로 설정
  }
}

/**
 * AI 응답에서 수의사 방문 필요 여부를 결정합니다
 */
export function needsVetVisit(text: string): boolean {
  const vetKeywords = ['수의사', '병원', '진료', '방문', '의학적', '전문가', '진단'];
  const textLower = text.toLowerCase();
  
  return vetKeywords.some(keyword => textLower.includes(keyword));
}

/**
 * AI 응답에서 가능한 질병을 추출합니다
 */
export function extractPossibleDiseases(text: string): PetDisease[] {
  const diseases: PetDisease[] = [];
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  
  // 질병 관련 키워드
  const diseaseKeywords = ['질병', '질환', '병', '진단', '가능성', '가능성 높은 질병'];
  
  // 구조화된 응답에서 질병 직접 파싱 시도
  const diseaseMatches = [...text.matchAll(/가능성.*높은.*질병\s*:\s*([^\n]+)/g)];
  if (diseaseMatches.length > 0) {
    diseaseMatches.forEach(match => {
      if (match[1]) {
        const diseasesText = match[1].trim();
        const entries = diseasesText.split(/,|;/);
        
        entries.forEach(entry => {
          const probabilityMatch = entry.match(/(.+)\s*\((.+)\)/);
          if (probabilityMatch) {
            const diseaseName = probabilityMatch[1].trim();
            const probability = probabilityMatch[2].includes('높') ? 'high' : 
                               probabilityMatch[2].includes('중') ? 'medium' : 'low';
            
            const severity = determineSeverity(entry);
            
            diseases.push({
              name: diseaseName,
              symptoms: [],
              description: entry,
              severity,
              recommendations: [],
              probability
            });
          } else {
            diseases.push({
              name: entry.trim(),
              symptoms: [],
              description: entry,
              severity: determineSeverity(entry),
              recommendations: []
            });
          }
        });
      }
    });
  }
  
  // 감별진단 항목 처리
  const diffDiagnosisMatches = [...text.matchAll(/감별진단\s*:\s*([^\n]+)/g)];
  if (diffDiagnosisMatches.length > 0) {
    diffDiagnosisMatches.forEach(match => {
      if (match[1]) {
        const diagnosesText = match[1].trim();
        const entries = diagnosesText.split(/,|;/);
        
        entries.forEach(entry => {
          const trimmed = entry.trim();
          if (trimmed && !diseases.some(d => d.name === trimmed)) {
            diseases.push({
              name: trimmed,
              symptoms: [],
              description: '감별진단으로 고려됨',
              severity: 'medium',
              recommendations: [],
              probability: 'low'
            });
          }
        });
      }
    });
  }
  
  // 일반 텍스트에서 질병 정보 추출
  if (diseases.length === 0) {
    // 질병 관련 문단 찾기
    const diseaseParagraphs = paragraphs.filter(p => 
      diseaseKeywords.some(keyword => p.toLowerCase().includes(keyword))
    );
    
    if (diseaseParagraphs.length > 0) {
      // 간단한 파싱 예시 (실제로는 더 복잡한 파싱 로직이 필요할 수 있음)
      diseaseParagraphs.forEach(paragraph => {
        // 질병명 추출 시도
        const match = paragraph.match(/(?:질병|질환|병명|진단):?\s*([^\.,:;\n]+)/);
        if (match && match[1]) {
          const diseaseName = match[1].trim();
          
          // 심각도 결정
          let severity: 'low' | 'medium' | 'high' | 'emergency' = 'medium';
          if (paragraph.includes('경미') || paragraph.includes('가벼운')) {
            severity = 'low';
          } else if (paragraph.includes('심각') || paragraph.includes('위험')) {
            severity = 'high';
          } else if (paragraph.includes('응급') || paragraph.includes('긴급')) {
            severity = 'emergency';
          }
          
          diseases.push({
            name: diseaseName,
            symptoms: extractSymptoms(paragraph),
            description: paragraph,
            severity,
            recommendations: extractRecommendations(paragraph),
          });
        }
      });
    }
  }
  
  return diseases;
}

/**
 * 키 발견사항 추출
 */
export function extractKeyFindings(text: string): string[] {
  const findings: string[] = [];
  const keyFindingsMatch = text.match(/주요\s*발견사항\s*:\s*([^\n]+)/);
  
  if (keyFindingsMatch && keyFindingsMatch[1]) {
    const findingsText = keyFindingsMatch[1].trim();
    const items = findingsText.split(/[,\.;]/);
    items.forEach(item => {
      const trimmed = item.trim();
      if (trimmed) findings.push(trimmed);
    });
  }
  
  return findings;
}

/**
 * 의학적 징후 추출
 */
export function extractMedicalSigns(text: string): MedicalSigns {
  const medicalSigns: MedicalSigns = {
    skin: [],
    eyes: [],
    posture: [],
    behavior: [],
    other: []
  };
  
  const signsMatch = text.match(/발견된\s*의학적\s*징후\s*:\s*([^]*?)(?=\n\s*-|\n\s*$)/);
  if (signsMatch && signsMatch[1]) {
    const signsText = signsMatch[1].trim();
    const signsList = signsText.split(/\n|,|;/).map(item => item.trim()).filter(Boolean);
    
    signsList.forEach(sign => {
      if (/피부|발진|탈모|상처|발적/.test(sign)) {
        medicalSigns.skin?.push(sign);
      } else if (/눈|충혈|분비물|혼탁/.test(sign)) {
        medicalSigns.eyes?.push(sign);
      } else if (/자세|부종|체중|자세|몸통|다리|관절/.test(sign)) {
        medicalSigns.posture?.push(sign);
      } else if (/행동|통증|불편|움직임|기침|호흡/.test(sign)) {
        medicalSigns.behavior?.push(sign);
      } else {
        medicalSigns.other?.push(sign);
      }
    });
  } else {
    // 구조화되지 않은 텍스트에서 증상 추출 시도
    const symptoms = extractSymptoms(text);
    symptoms.forEach(symptom => {
      if (/피부|발진|탈모|상처|발적/.test(symptom)) {
        medicalSigns.skin?.push(symptom);
      } else if (/눈|충혈|분비물|혼탁/.test(symptom)) {
        medicalSigns.eyes?.push(symptom);
      } else if (/자세|부종|체중|자세|몸통|다리|관절/.test(symptom)) {
        medicalSigns.posture?.push(symptom);
      } else if (/행동|통증|불편|움직임|기침|호흡/.test(symptom)) {
        medicalSigns.behavior?.push(symptom);
      } else {
        medicalSigns.other?.push(symptom);
      }
    });
  }
  
  return medicalSigns;
}

/**
 * 감별진단 추출
 */
export function extractDifferentialDiagnosis(text: string): string[] {
  const differential: string[] = [];
  const diffMatch = text.match(/감별진단\s*:\s*([^\n]+)/);
  
  if (diffMatch && diffMatch[1]) {
    const diffText = diffMatch[1].trim();
    const items = diffText.split(/[,\.;]/);
    items.forEach(item => {
      const trimmed = item.trim();
      if (trimmed) differential.push(trimmed);
    });
  }
  
  return differential;
}

/**
 * 긴급도 추출
 */
export function extractUrgencyLevel(text: string): UrgencyLevel {
  const urgencyMatch = text.match(/긴급도\s*:\s*(\S+)/i);
  
  if (urgencyMatch && urgencyMatch[1]) {
    const urgencyText = urgencyMatch[1].toLowerCase().trim();
    if (urgencyText.includes('응급')) return 'emergency';
    if (urgencyText.includes('빠른') || urgencyText.includes('즉시')) return 'prompt';
  }
  
  // 키워드 기반 분석
  if (/응급|즉각|생명|위험|긴급/.test(text)) {
    return 'emergency';
  } else if (/빠른|즉시|조속히|지체없이|신속/.test(text)) {
    return 'prompt';
  }
  
  return 'normal';
}

/**
 * AI 응답을 구조화된 분석 데이터로 변환합니다
 */
export function analyzeResponse(text: string, analysisType?: 'basic' | 'detailed', petType?: string): AnalysisData {
  // 기본 분석 데이터
  const analysisData: AnalysisData = {
    symptoms: extractSymptoms(text),
    possibleDiseases: extractPossibleDiseases(text),
    recommendations: extractRecommendations(text),
    severity: determineSeverity(text),
    needsVet: needsVetVisit(text),
    confidence: determineConfidence(text),
    rawAnalysis: text,
    analysisType: analysisType || 'basic',
    petType
  };
  
  // 상세 분석 모드인 경우 추가 데이터 처리
  if (analysisType === 'detailed') {
    analysisData.keyFindings = extractKeyFindings(text);
    analysisData.medicalSigns = extractMedicalSigns(text);
    analysisData.differentialDiagnosis = extractDifferentialDiagnosis(text);
    analysisData.urgencyLevel = extractUrgencyLevel(text);
  }
  
  return analysisData;
}

/**
 * AI의 응답 신뢰도를 추정합니다
 */
function determineConfidence(text: string): number {
  // 불확실성 관련 키워드
  const uncertaintyKeywords = ['가능성', '추정', '추측', '~일 수도', '일 수도', '수 있습니다', '일 수 있', '불확실'];
  
  let confidence = 0.8; // 기본 신뢰도
  
  // 불확실성 표현이 많을수록 신뢰도 감소
  const textLower = text.toLowerCase();
  const uncertaintyCount = uncertaintyKeywords.reduce((count, keyword) => {
    const regex = new RegExp(keyword, 'g');
    const matches = textLower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  // 불확실성 표현에 따라 신뢰도 조정
  confidence -= uncertaintyCount * 0.05;
  
  // 최소/최대 신뢰도 범위 제한
  return Math.max(0.3, Math.min(0.95, confidence));
} 