import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    // 텍스트에 사용할 폰트 로드
    const geistSans = await fetch(
      new URL('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap')
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#2563EB',
            color: 'white',
            fontFamily: '"Noto Sans KR"',
            padding: 50,
            textAlign: 'center',
          }}
        >
          {/* 상단 배경 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '60%',
              backgroundColor: '#DBEAFE',
              borderRadius: 20,
              zIndex: 0,
            }}
          />
          
          {/* 타이틀 */}
          <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20, zIndex: 1, textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' }}>
            댕냥닥터
          </div>
          
          {/* 서브타이틀 */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: '#1E40AF',
              backgroundColor: 'white',
              padding: '12px 24px',
              borderRadius: 8,
              marginTop: 20,
              zIndex: 1,
            }}
          >
            반려동물 질병 진단 AI
          </div>
          
          {/* 설명 */}
          <div
            style={{
              fontSize: 24,
              marginTop: 40,
              zIndex: 1,
            }}
          >
            Google Gemini 1.5 기반 AI로 건강 상태를 분석합니다
          </div>
          
          {/* 강아지와 고양이 아이콘 */}
          <div style={{ 
            display: 'flex', 
            margin: '20px 0',
            zIndex: 1,
          }}>
            <div style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 20, 
              backgroundColor: '#1E40AF', 
              marginRight: 40, 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 60,
            }}>
              🐶
            </div>
            <div style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 20, 
              backgroundColor: '#1E40AF', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 60,
            }}>
              🐱
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Noto Sans KR',
            data: geistSans,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    );
  } catch (e) {
    console.log(`${e instanceof Error ? e.message : '알 수 없는 오류'}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
} 