import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// API 키를 환경 변수에서 가져오거나 백엔드에서만 접근 가능하도록 보관
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDZLCJRMv2VDX4tB06ge8X2bX_GArxYL1s';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const petType = formData.get('petType') as string || 'unknown';
    const analysisType = formData.get('analysisType') as 'basic' | 'detailed' || 'basic';
    
    // 기본 프롬프트
    let prompt = '너는 반려동물 질병 진단 전문가야. 이 사진에 있는 반려동물의 상태를 분석하고, 가능한 질병이나 건강 문제가 있다면 알려줘. 증상, 가능한 질병, 심각도, 권장 행동에 대해 설명해줘. 만약 긴급한 수의사 진료가 필요하다면 그것도 강조해서 알려줘.';
    
    // 반려동물 유형에 따라 프롬프트 조정
    if (petType !== 'unknown') {
      prompt = `너는 ${petType} 질병 진단 전문가야. 이 사진에 있는 ${petType}의 상태를 분석하고, 가능한 질병이나 건강 문제가 있다면 알려줘. 증상, 가능한 질병, 심각도, 권장 행동에 대해 설명해줘. 만약 긴급한 수의사 진료가 필요하다면 그것도 강조해서 알려줘.`;
    }
    
    // 상세 분석 요청인 경우 프롬프트 확장
    if (analysisType === 'detailed') {
      prompt += `\n\n다음 의학적 특징들을 상세히 분석해주세요:
1. 피부 상태 (발적, 발진, 탈모, 상처 등)
2. 눈 상태 (충혈, 분비물, 혼탁 등)
3. 체형 및 자세 (비정상적인 자세, 부종, 체중 변화 징후 등)
4. 행동 패턴 (통증, 불편함, 움직임 제한 등의 징후)
5. 비정상적인 증상의 위치와 형태를 정확히 설명

응답은 다음 형식으로 구조화해주세요:
- 주요 발견사항: [핵심 관찰 내용]
- 발견된 의학적 징후: [의학적 징후 목록]
- 가능성 높은 질병: [질병명 및 확률(높음/중간/낮음)]
- 감별진단: [고려해야 할 다른 가능성 있는 질병]
- 심각도 평가: [낮음/중간/높음/응급]
- 권장 조치: [권장되는 진료 및 관리 방법]
- 긴급도: [일반/빠른 진료 필요/응급]`;
    }

    if (!image) {
      return NextResponse.json(
        { error: '이미지가 필요합니다' },
        { status: 400 }
      );
    }

    // 이미지를 바이너리 데이터로 변환
    const imageData = await image.arrayBuffer();
    const imageBytes = new Uint8Array(imageData);

    // Gemini 1.5 Flash 모델 사용 (최신 모델)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 이미지 분석 요청
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: image.type,
          data: Buffer.from(imageBytes).toString('base64'),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      analysis: text,
      analysisType,
      petType
    });
  } catch (error: unknown) {
    console.error('Gemini API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '이미지 분석 중 오류가 발생했습니다';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 