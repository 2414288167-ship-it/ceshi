import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";

// 这是一个示例 API 路由，处理聊天消息
// 在实际应用中，你需要配置 LLM provider（如 OpenAI, Claude 等）
export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // 这里需要集成实际的 AI provider
    // 示例代码显示流式响应的基本结构
    const textStream = new ReadableStream({
      start(controller) {
        // 模拟流式响应
        const response =
          "This is a sample response. Configure your AI provider to enable real chat.";
        for (const char of response) {
          controller.enqueue(new TextEncoder().encode(char));
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(textStream);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
