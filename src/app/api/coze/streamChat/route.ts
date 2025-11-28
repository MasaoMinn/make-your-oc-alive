// app/api/ai-stream/route.ts
import { NextRequest } from "next/server";
import { CozeAPI, RoleType } from "@coze/api";

export async function GET(req: NextRequest) {
  const apiClient = new CozeAPI({
    token: "pat_ZxD2ADY9kHsNsLGL3LeSSmowhqxsJEyeGHXHfzbYjkqQTIvcI2SMO86IJ330jGD7", // 你的令牌
    baseURL: 'https://api.coze.cn'
  });

  // 创建一个可读流，向客户端推送 SSE 格式的数据
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const res = await apiClient.chat.stream({
          bot_id: '7566161187986636800',
          user_id: '123456789',
          additional_messages: [
            {
              "content": "[{\"type\":\"text\",\"text\":\"这是设定图片：\"},{\"type\":\"file\",\"file_id\":\"7576222842639958056\"}]",
              "content_type": "object_string",
              "role": RoleType.User,
              "type": "question"
            }
          ],
        });

        // 如果返回了一个 async iterable（for await ... of）
        for await (const chunk of res) {
          // chunk 可能是对象（事件/event），我们把它序列化后以 SSE 格式发送
          const payload = JSON.stringify(chunk);

          // SSE 格式：data: <payload>\n\n
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        }

        // 完成事件
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${err}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
