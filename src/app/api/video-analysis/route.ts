import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { VideoAnalysisData } from '@/components/VideoAnalysisResult';

// API 키를 환경 변수에서 가져오거나 백엔드에서만 접근 가능하도록 보관
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDZLCJRMv2VDX4tB06ge8X2bX_GArxYL1s';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const video = formData.get('video') as File;
    const animalType = formData.get('animalType') as string || 'unknown';
    
    // 기본 프롬프트
    let prompt = `너는 반려동물 행동 분석 및 질병 탐지 AI 전문가야. 이 비디오에 있는 반려동물의 행동을 분석하고, 
비정상적인 움직임이나 행동 패턴을 찾아내 가능한 질병이나 건강 문제가 있다면 알려줘. 
움직임 패턴, 자세, 걸음걸이, 반응 속도, 일반적인 행동 등을 분석해줘. 
긴급한 수의사 진료가 필요한 행동이 있다면 그것도 강조해서 알려줘.

다음 형식으로 구체적인 행동 분석 결과를 JSON 형식으로 제공해줘:

\`\`\`json
{
  "animalType": "${animalType}",
  "behaviors": [
    {
      "timestamp": "비디오 타임스탬프 (예: 00:12)",
      "behavior": "관찰된 행동의 이름",
      "confidence": 신뢰도 (0.0-1.0 사이 숫자),
      "description": "해당 행동에 대한 상세 설명",
      "severity": "normal/attention/concern/serious 중 하나"
    }
  ],
  "summary": "전체 행동 패턴에 대한 요약",
  "possibleIssues": [
    "가능성 있는 건강 문제 1",
    "가능성 있는 건강 문제 2"
  ],
  "recommendations": [
    "권장 조치 1",
    "권장 조치 2"
  ],
  "overallAssessment": {
    "status": "healthy/minor_concern/needs_attention/vet_visit_recommended/emergency 중 하나",
    "description": "종합 평가에 대한 설명"
  }
}
\`\`\`

중요: 반드시 위 JSON 형식을 정확히 따라야 하며, JSON 이외의 텍스트는 포함하지 마세요.`;
    
    // 반려동물 유형에 따라 프롬프트 조정
    if (animalType !== 'unknown') {
      prompt = `너는 ${animalType} 행동 분석 및 질병 탐지 AI 전문가야. 이 비디오에 있는 ${animalType}의 행동을 분석하고, 
비정상적인 움직임이나 행동 패턴을 찾아내 가능한 질병이나 건강 문제가 있다면 알려줘. 
움직임 패턴, 자세, 걸음걸이, 반응 속도, 일반적인 행동 등을 분석해줘. 
긴급한 수의사 진료가 필요한 행동이 있다면 그것도 강조해서 알려줘.

다음 형식으로 구체적인 행동 분석 결과를 JSON 형식으로 제공해줘:

\`\`\`json
{
  "animalType": "${animalType}",
  "behaviors": [
    {
      "timestamp": "비디오 타임스탬프 (예: 00:12)",
      "behavior": "관찰된 행동의 이름",
      "confidence": 신뢰도 (0.0-1.0 사이 숫자),
      "description": "해당 행동에 대한 상세 설명",
      "severity": "normal/attention/concern/serious 중 하나"
    }
  ],
  "summary": "전체 행동 패턴에 대한 요약",
  "possibleIssues": [
    "가능성 있는 건강 문제 1",
    "가능성 있는 건강 문제 2"
  ],
  "recommendations": [
    "권장 조치 1",
    "권장 조치 2"
  ],
  "overallAssessment": {
    "status": "healthy/minor_concern/needs_attention/vet_visit_recommended/emergency 중 하나",
    "description": "종합 평가에 대한 설명"
  }
}
\`\`\`

중요: 반드시 위 JSON 형식을 정확히 따라야 하며, JSON 이외의 텍스트는 포함하지 마세요.`;
    }

    if (!video) {
      return NextResponse.json(
        { error: '비디오 파일이 필요합니다' },
        { status: 400 }
      );
    }

    // 비디오를 바이너리 데이터로 변환
    const videoData = await video.arrayBuffer();
    const videoBytes = new Uint8Array(videoData);

    // Gemini 1.5 Flash 모델 사용 (최신 모델)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 비디오 분석 요청
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: video.type,
          data: Buffer.from(videoBytes).toString('base64'),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // JSON 데이터 추출
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
    let analysisData: VideoAnalysisData;
    
    if (jsonMatch) {
      try {
        // JSON 파싱
        analysisData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (error) {
        console.error("JSON 파싱 오류:", error);
        // 파싱 실패 시 기본 데이터로 구성
        analysisData = {
          animalType,
          behaviors: [],
          summary: "비디오 분석 중 오류가 발생했습니다.",
          possibleIssues: [],
          recommendations: ["다시 시도해 주세요."],
          overallAssessment: {
            status: "healthy",
            description: "분석 데이터 처리 중 오류가 발생했습니다."
          }
        };
      }
    } else {
      // JSON 형식이 없는 경우 텍스트 응답을 처리
      analysisData = {
        animalType,
        behaviors: [{
          timestamp: "00:00",
          behavior: "분석 불가",
          confidence: 0.5,
          description: "제공된 비디오를 분석할 수 없습니다.",
          severity: "normal"
        }],
        summary: text.substring(0, 200) + "...",
        possibleIssues: [],
        recommendations: ["다른 비디오로 다시 시도해 주세요."],
        overallAssessment: {
          status: "healthy",
          description: "분석이 완료되었지만 구조화된 데이터를 생성할 수 없습니다."
        }
      };
    }

    return NextResponse.json({ analysis: analysisData });
  } catch (error: unknown) {
    console.error('비디오 분석 API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '비디오 분석 중 오류가 발생했습니다';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 