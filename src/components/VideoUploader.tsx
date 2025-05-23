import { useState, useRef } from 'react';

interface VideoUploaderProps {
  onUpload: (file: File, animalType: string) => Promise<void>;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

export default function VideoUploader({ onUpload, status }: VideoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [animalType, setAnimalType] = useState<string>('강아지');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 비디오 파일 포맷 검증
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('지원되는 비디오 형식: MP4, WebM, QuickTime');
      return;
    }

    // 파일 크기 제한 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('파일 크기는 최대 50MB로 제한됩니다.');
      return;
    }

    setSelectedFile(file);
    
    // 비디오 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, animalType);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          반려동물 유형
        </label>
        <select
          value={animalType}
          onChange={(e) => setAnimalType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={status === 'uploading'}
        >
          <option value="강아지">강아지</option>
          <option value="고양이">고양이</option>
        </select>
      </div>

      {previewUrl ? (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비디오 미리보기
          </label>
          <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
            <video 
              src={previewUrl} 
              className="w-full h-full object-contain" 
              controls
            />
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-md p-6 mb-3 text-center cursor-pointer hover:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
            </svg>
            <p>비디오 파일을 드래그하거나 클릭하여 업로드하세요</p>
            <p className="text-xs mt-1">(최대 50MB, MP4/WebM/QuickTime)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFileChange}
            disabled={status === 'uploading'}
          />
        </div>
      )}

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || status === 'uploading'}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'uploading' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              분석 중...
            </span>
          ) : (
            '행동 분석하기'
          )}
        </button>

        <button
          type="button"
          onClick={resetUpload}
          disabled={!selectedFile || status === 'uploading'}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          취소
        </button>
      </div>
    </div>
  );
} 