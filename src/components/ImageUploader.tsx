"use client";
import React, { useState, DragEvent } from 'react';
// 从route.ts导入已定义的类型规范和验证schema
import { UploadResponse } from '../app/api/coze/uploadFile/route';
import { Button } from 'react-bootstrap';
import { usePictureStore } from '@/store/pictureStore';
import Image from 'next/image';

// 定义组件状态类型
interface ImageUploaderState {
  isDragging: boolean;
  isUploading: boolean;
  uploadProgress: number;
  uploadResponse: UploadResponse | null;
  error: string | null;
  previewUrl: string | null;
  selectedFile: File | null;
}

const ImageUploader: React.FC = () => {
  const setPicture = usePictureStore((state) => state.setPicture);
  const [state, setState] = useState<ImageUploaderState>({
    isDragging: false,
    isUploading: false,
    uploadProgress: 0,
    uploadResponse: null,
    error: null,
    previewUrl: null,
    selectedFile: null,
  });

  // 清理函数，防止内存泄漏
  const cleanupPreview = () => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
  };

  // 处理文件选择
  const handleFileSelect = async (file: File) => {

    if (!file.type.match('image.*')) {
      setState(prev => ({
        ...prev,
        error: '请选择图片文件',
      }));
      return;
    }

    // 生成预览URL
    const previewUrl = URL.createObjectURL(file);

    // 清理旧的预览URL
    cleanupPreview();

    // 更新状态，显示预览
    setState(prev => ({
      ...prev,
      selectedFile: file,
      previewUrl,
      error: null,
    }));

    // 开始上传
    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null,
    }));

    try {
      // 创建FormData，使用与schema一致的字段名"Data"
      const formData = new FormData();
      formData.append('Data', file); // 修改为'Data'，与后端期望的字段名一致

      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.uploadProgress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, uploadProgress: prev.uploadProgress + 10 };
        });
      }, 200);

      // 发送上传请求
      const response = await fetch('/api/coze/uploadFile', {
        method: 'POST',
        body: formData,
      });

      // 清除进度更新定时器
      clearInterval(progressInterval);

      // 完成进度
      setState(prev => ({ ...prev, uploadProgress: 100 }));

      // 解析响应
      const result: UploadResponse = await response.json();
      if (result.code) {
        console.log("res", result.data)
        setPicture({
          id: result.data?.id || '',
          name: result.data?.name || '',
          size: result.data?.size || 0,
          created_at: result.data?.created_at || 0,
        })
      }

      // 更新状态
      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadResponse: result,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : '上传失败，请重试',
      }));
    }
  };

  // 以编程方式创建文件输入并触发点击
  const handleUploadClick = () => {
    // 创建隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // 添加事件监听器
    fileInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // 移除临时创建的元素
      setTimeout(() => {
        fileInput.remove();
      }, 0);
    });

    // 将元素添加到文档中并触发点击
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  // 处理拖拽进入
  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setState(prev => ({ ...prev, isDragging: true }));
  };

  // 处理拖拽离开
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setState(prev => ({ ...prev, isDragging: false }));
  };

  // 处理拖拽悬停
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // 处理拖放
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setState(prev => ({ ...prev, isDragging: false }));

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 重置上传状态
  const handleReset = () => {
    cleanupPreview();
    setState({
      isDragging: false,
      isUploading: false,
      uploadProgress: 0,
      uploadResponse: null,
      error: null,
      previewUrl: null,
      selectedFile: null,
    });
  };

  // 移除图片预览
  const handleRemovePreview = () => {
    cleanupPreview();
    setState(prev => ({
      ...prev,
      previewUrl: null,
      selectedFile: null,
      uploadResponse: null,
      error: null,
    }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
            mx-auto
            ${state.isDragging
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 hover:shadow-sm'}
          `}
          onClick={handleUploadClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ maxWidth: '400px' }}
        >
          {/* 图片预览 */}
          {state.previewUrl && (
            <div className="relative mb-6 max-h-60 mx-auto">
              <Image
                src={state.previewUrl}
                alt="预览"
                height={300}
                width={420}
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePreview();
                }}
                aria-label="移除预览"
                variant='danger'
              >
                ✕
              </Button>
            </div>
          )}

          <h3 className="text-lg font-medium text-gray-700 mb-3">
            {state.isUploading
              ? '上传中...'
              : state.previewUrl
                ? '点击更换图片或拖放新图片'
                : '拖放图片或点击上传'}
          </h3>

          <p className="text-gray-500 mb-6">
            支持 JPG、PNG、GIF 等常见图片格式
          </p>

          {/* 上传进度条 */}
          {state.isUploading && (
            <div className="w-full bg-gray-100 rounded-full h-3 mb-3 p-0.5 border border-gray-200">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-inner"
                style={{ width: `${state.uploadProgress}%` }}
              />
            </div>
          )}

          {state.isUploading && (
            <p className="text-sm font-medium text-blue-600">
              {state.uploadProgress}% 已上传
            </p>
          )}
        </div>

        {/* 错误信息 */}
        {state.error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-5 rounded-lg shadow-sm mt-6 mx-auto max-w-md">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{state.error}</p>
            </div>
            <Button
              onClick={handleReset}
            >
              重试
            </Button>
          </div>
        )}

        {state.uploadResponse && !state.error && (
          <div className="bg-green-50 border-2 border-green-200 p-5 rounded-lg shadow-sm mt-6 mx-auto max-w-md text-center">
            <p className="text-sm text-gray-700">
              <strong>服务器消息:</strong> {state.uploadResponse.msg}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;