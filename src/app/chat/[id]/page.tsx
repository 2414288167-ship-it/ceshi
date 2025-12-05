import React from "react";
import ChatPage from "@/components/ChatPage";

// 适配 Next.js 15+ 的异步 params
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatConversationPage({ params }: PageProps) {
  // 等待参数解析
  const { id } = await params;

  // 渲染刚才第一步恢复的 ChatPage 组件
  return <ChatPage conversationId={id} />;
}
