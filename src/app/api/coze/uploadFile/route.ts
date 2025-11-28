import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const URL = "https://api.coze.cn/v1/files/upload";

// 文件数据接口定义
interface FileData {
  name: string;
  type: string;
  size: number;
}

// 修改图片数据模式验证，使其更加灵活
// 允许字段为可选，并提供默认值处理
export const pictureSchema = z.object({
  id: z.string().optional(),
  size: z.number().optional(),
  created_at: z.number().optional(),
  name: z.string().optional(),
})

// 上传响应模式验证
export const uploadResponseSchema = z.object({
  code: z.boolean(),
  msg: z.string(),
  data: pictureSchema.optional(),
});
export type UploadResponse = z.infer<typeof uploadResponseSchema>;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("Data"); // 确保使用正确的字段名'Data'

    // 验证文件对象
    if (!file || typeof file !== "object" || !(file instanceof Blob)) {
      const errorResponse: UploadResponse = {
        code: false,
        msg: "无效的文件数据",
      };
      return NextResponse.json(errorResponse);
    }

    // 验证是否为图片文件
    const fileObj = file as FileData;
    if (!fileObj.type || !fileObj.type.startsWith("image/")) {
      const errorResponse: UploadResponse = {
        code: false,
        msg: "Only image files are allowed",
      };
      return NextResponse.json(errorResponse);
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file as File);

    try {
      const response = await axios.post(URL, uploadFormData, {
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_COZE_API_KEY}`
        },
        timeout: 30000 // 30秒超时
      });

      const originalFile = file as File;
      const originalFileName = originalFile.name || "uploaded_image";
      const originalFileSize = originalFile.size || 0;
      const currentTimestamp = Math.floor(Date.now() / 1000); // 获取当前时间戳（秒）

      // 构建完整的图片信息，确保包含所有必要字段
      const finalResponse: UploadResponse = {
        code: true,
        msg: response.data.msg || response.data.message || "上传成功",
        data: {
          id: response.data.data?.id || response.data.data?.file_id || `img_${currentTimestamp}`,
          name: response.data.data?.name || response.data.data?.file_name || originalFileName,
          size: Number(response.data.data?.size || response.data.data?.bytes || originalFileSize) || 0,
          created_at: response.data.data?.created_at || currentTimestamp
        },
      };

      return NextResponse.json(finalResponse);
    } catch (error) {
      const errorResponse: UploadResponse = {
        code: false,
        msg: error instanceof Error ? error.message : "Coze API调用失败",
      };
      return NextResponse.json(errorResponse);
    }
  } catch (error) {
    const failResponse: UploadResponse = {
      code: false,
      msg: error instanceof Error ? error.message : "处理请求时发生未知错误",
    };
    return NextResponse.json(failResponse);
  }
}