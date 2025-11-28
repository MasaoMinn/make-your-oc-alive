import { CozeAPI } from '@coze/api';

// 初始化 Coze 客户端
const apiClient = new CozeAPI({
  token: "pat_ZxD2ADY9kHsNsLGL3LeSSmowhqxsJEyeGHXHfzbYjkqQTIvcI2SMO86IJ330jGD7", // 你的令牌
  baseURL: 'https://api.coze.cn'
});

// 多模态消息调用主函数
async function sendMultimodalChat() {
  try {
    // 流式调用聊天接口
    const res = await apiClient.chat.stream({ 
      bot_id: '7566161187986636800', 
      user_id: '123456789', 
      additional_messages: [ 
      { 
        "content": "[{\"type\":\"text\",\"text\":\"这是设定图片：\"},{\"type\":\"file\",\"file_id\":\"7576222842639958056\"}]", 
        "content_type": "object_string", 
        "role": "user", 
        "type": "question" 
      } 
     ], 
    }); 

    // 处理流式响应
    for await (const chunk of res) {
      if (chunk.event === 'conversation.chat.failed') {
        // 打印错误详情
        console.error('调用失败：', chunk.data.last_error);
      } else {
        // 打印正常流式数据（如消息内容、结束标识等）
        console.log('流式返回：', chunk);
      }
    }
  } catch (error) {
    // 捕获请求级别的异常（如网络、令牌无效等）
    console.error('请求异常：', error.message);
  }
}

// 执行调用
sendMultimodalChat();