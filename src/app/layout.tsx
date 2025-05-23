import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 배포된 도메인으로 변경하세요
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://pet-doctor-ai.vercel.app';

export const metadata: Metadata = {
  title: "댕냥닥터 - 반려동물 질병 진단 AI",
  description: "반려동물의 건강 상태를 AI로 분석하는 댕냥닥터입니다",
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: [
      { url: '/favicon.svg' }
    ]
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: '댕냥닥터 - 반려동물 질병 진단 AI',
    description: '반려동물의 건강 상태를 AI로 분석하는 댕냥닥터입니다',
    url: BASE_URL,
    siteName: '댕냥닥터',
    images: [
      {
        url: `${BASE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: '댕냥닥터 - 반려동물 질병 진단 AI',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '댕냥닥터 - 반려동물 질병 진단 AI',
    description: '반려동물의 건강 상태를 AI로 분석하는 댕냥닥터입니다',
    images: [`${BASE_URL}/api/og`],
    creator: '@pet_doctor_ai',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        
        {/* 필수 미리보기 메타 태그 */}
        <meta property="og:image" content={`${BASE_URL}/api/og`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={BASE_URL} />
        
        {/* 카카오톡 미리보기 최적화 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${BASE_URL}/api/og`} />
        
        {/* 페이스북 미리보기 최적화 */}
        <meta property="fb:app_id" content="페이스북 앱 ID" />
        
        {/* 기타 메타 태그 */}
        <meta name="naver-site-verification" content="네이버 사이트 인증 코드" />
        <meta name="msapplication-TileImage" content={`${BASE_URL}/api/og`} />
        <meta name="msapplication-TileColor" content="#2563EB" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
