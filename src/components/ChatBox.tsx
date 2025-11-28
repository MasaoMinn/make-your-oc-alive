"use client";
import { CozeAPI, RoleType } from '@coze/api';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatboxProps extends React.HTMLProps<HTMLDivElement> {
  prompt?: string;
  imageId?: string;
}
type chatState = 'avaliable' | 'sent' | 'loading';

export default function ChatBox({
  prompt = '这是设定图片：',
  imageId = '7576222842639958056',
  ...props
}: ChatboxProps) {
  const apiClient = new CozeAPI({
    token: process.env.NEXT_PUBLIC_COZE_API_KEY!, // 你的令牌
    baseURL: 'https://api.coze.cn',
    allowPersonalAccessTokenInBrowser: true,
  });
  const [messages, setMessages] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentState, setCurrentState] = useState<chatState>('avaliable');

  async function sendMultimodalChat() {
    setMessages("");
    setError("");
    setCurrentState('loading');
    try {
      // 流式调用聊天接口
      const res = await apiClient.chat.stream({
        bot_id: '7566161187986636800',
        user_id: '123456789',
        additional_messages: [
          {
            "content": `[{\"type\":\"text\",\"text\":\"${prompt}\"},{\"type\":\"file\",\"file_id\":\"${imageId}\"}]`,
            "content_type": "object_string",
            "role": RoleType.User,
            "type": "question"
          }
        ],
      });

      for await (const chunk of res) {
        switch (chunk.event) {
          case 'conversation.chat.failed':
            setError(chunk.data.last_error?.msg || '调用失败');
            setCurrentState('avaliable');
            console.error('调用失败：', chunk.data.last_error);
            break;
          case 'conversation.message.delta':
            setCurrentState('sent');
            setMessages((prev) => prev + chunk.data.content);
            break;
          case 'done':
            setCurrentState('avaliable');
            break;
        }
      }
    } catch (error) {
      console.error('请求异常：', error);
      setError('请求过程中出现异常');
      setCurrentState('avaliable'); // 出错时也要重置状态
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4" {...props}>
      {/* Card容器样式 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* 输入区域 */}
        <div className="p-4 border-b border-gray-200">
          {/* <div className="mb-4 p-3 bg-gray-50 rounded-md">
            {`${prompt}${imageId}`}
          </div> */}
          <Button
            onClick={sendMultimodalChat}
            disabled={currentState === 'loading'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {currentState === 'loading' ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent text-white"></span>
                处理中...
              </>
            ) : (
              '发送'
            )}
          </Button>
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={messages}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 100
              }}
              className="min-h-[100px] p-3 bg-gray-50 rounded-md"
            >
              {currentState === 'loading' && !messages && (
                <div className="flex items-center justify-center min-h-[100px]">
                  <span className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></span>
                  <span className="ml-2 text-gray-500">正在生成回复...</span>
                </div>
              )}
              <ReactMarkdown>{messages}</ReactMarkdown>
            </motion.div>
          </AnimatePresence>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-50 border-t border-red-200"
          >
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}