
import React, { useState, useRef, useCallback } from 'react';
import { ImageFormat, SupportedImageMimeType } from '../types';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';

const ACCEPTED_FORMATS: SupportedImageMimeType[] = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];

const ImageConverter: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>(ImageFormat.PNG);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ACCEPTED_FORMATS.includes(file.type as SupportedImageMimeType)) {
        setError(`Unsupported file type: ${file.type}. Please upload a standard image file.`);
        return;
      }
      setError(null);
      setOriginalFile(file);
      setConvertedImageUrl(null);
      
      const previewUrl = URL.createObjectURL(file);
      setOriginalPreviewUrl(previewUrl);
    }
  };

  const handleConvert = useCallback(() => {
    if (!originalFile) return;

    setIsConverting(true);
    setError(null);
    setConvertedImageUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const mimeType = `image/${targetFormat}`;
          const quality = targetFormat === ImageFormat.JPEG ? 0.92 : undefined;
          const dataUrl = canvas.toDataURL(mimeType, quality);
          setConvertedImageUrl(dataUrl);
        } else {
          setError('Could not process the image. The canvas context is not available.');
        }
        setIsConverting(false);
      };
      img.onerror = () => {
        setError('The selected file could not be loaded as an image.');
        setIsConverting(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsConverting(false);
    };
    reader.readAsDataURL(originalFile);
  }, [originalFile, targetFormat]);

  const handleReset = () => {
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    setOriginalFile(null);
    setOriginalPreviewUrl(null);
    setConvertedImageUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const getFileName = (format: ImageFormat) => {
    if (!originalFile) return `download.${format}`;
    const nameWithoutExtension = originalFile.name.split('.').slice(0, -1).join('.');
    return `${nameWithoutExtension}.${format}`;
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!originalFile) {
    return (
      <div className="w-full max-w-2xl text-center">
        <div 
          onClick={handleUploadClick}
          className="relative block w-full rounded-lg border-2 border-dashed border-slate-700 p-12 text-center hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 cursor-pointer transition-colors"
        >
          <UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
          <span className="mt-2 block text-sm font-medium text-slate-400">
            Click to upload an image
          </span>
          <p className="text-xs text-slate-600 mt-1">PNG, JPG, WEBP, GIF, BMP</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_FORMATS.join(',')}
          onChange={handleFileChange}
        />
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl p-4 sm:p-6 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Image Panel */}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-slate-300 mb-3">Original</h2>
          <div className="flex-grow bg-slate-900 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
            <img src={originalPreviewUrl!} alt="Original preview" className="max-w-full max-h-96 object-contain rounded-md" />
          </div>
          <div className="text-sm text-slate-400 mt-3 flex justify-between">
            <span>{originalFile.name}</span>
            <span>{Math.round(originalFile.size / 1024)} KB</span>
          </div>
        </div>

        {/* Converted Image Panel */}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-slate-300 mb-3">Converted</h2>
          <div className="flex-grow bg-slate-900 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
            {isConverting ? (
              <div className="flex flex-col items-center text-slate-400">
                <div className="w-8 h-8 border-4 border-t-cyan-400 border-slate-600 rounded-full animate-spin"></div>
                <p className="mt-3">Converting...</p>
              </div>
            ) : convertedImageUrl ? (
              <img src={convertedImageUrl} alt="Converted preview" className="max-w-full max-h-96 object-contain rounded-md" />
            ) : (
              <div className="text-center text-slate-500">
                <p>Select a format and click convert.</p>
              </div>
            )}
          </div>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <div className="mt-3">
             <div className="flex items-center space-x-4">
              <label htmlFor="format" className="text-slate-400">Format:</label>
              <select
                id="format"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                disabled={isConverting}
              >
                {Object.values(ImageFormat).map(format => (
                  <option key={format} value={format}>{format.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleReset}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
        >
          Upload New Image
        </button>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full sm:w-auto flex-1 text-base font-semibold text-white bg-blue-600 rounded-lg px-6 py-3 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {isConverting ? 'Working...' : 'Convert'}
          </button>
          {convertedImageUrl && (
            <a
              href={convertedImageUrl}
              download={getFileName(targetFormat)}
              className="inline-flex items-center justify-center p-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              title="Download Converted Image"
            >
              <DownloadIcon className="h-6 w-6" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
