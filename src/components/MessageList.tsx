import React from "react";
import { Signal } from "lucide-react"; // 引入信号图标

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "text" | "audio";
  duration?: number;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  contactAvatar?: string;
  myAvatar?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  contactAvatar = "🤖",
  myAvatar = "我",
}) => {
  const renderAvatar = (avatarContent: string) => {
    if (avatarContent.startsWith("data:") || avatarContent.startsWith("http")) {
      return (
        <img
          src={avatarContent}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      );
    }
    return <span className="text-sm select-none">{avatarContent}</span>;
  };

  return (
    <div className="space-y-4 pb-2">
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            {/* 左侧头像 (AI) */}
            {!isUser && (
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 self-start overflow-hidden shadow-sm">
                {renderAvatar(contactAvatar)}
              </div>
            )}

            {/* 消息气泡区域 */}
            <div className="flex flex-col">
              {/* 1. 语音消息 */}
              {message.type === "audio" ? (
                <div
                  className={`px-4 py-2.5 rounded-lg text-[16px] leading-relaxed shadow-sm flex items-center gap-2 cursor-pointer active:opacity-80 transition-opacity ${
                    isUser
                      ? "bg-[#95ec69] text-black justify-end" // 微信绿
                      : "bg-white text-gray-800 border border-gray-100 justify-start"
                  }`}
                  style={{
                    // 动态计算宽度，最小 80px，最大 200px
                    width: `${Math.min(
                      80 + (message.duration || 0) * 5,
                      200
                    )}px`,
                  }}
                >
                  {/* 用户发的：时长在左，图标在右 */}
                  {isUser && (
                    <span className="text-sm text-black/60 mr-1">
                      {/* --- 修复点：这里使用了 &quot; 代替 " --- */}
                      {message.duration}&quot;
                    </span>
                  )}

                  <Signal
                    className={`w-5 h-5 flex-shrink-0 ${
                      isUser ? "rotate-90" : "-rotate-90"
                    }`}
                  />

                  {/* AI发的：图标在左，时长在右 */}
                  {!isUser && (
                    <span className="text-sm text-gray-500 ml-1">
                      {/* --- 修复点：这里使用了 &quot; 代替 " --- */}
                      {message.duration}&quot;
                    </span>
                  )}
                </div>
              ) : (
                // 2. 文本消息
                <div
                  className={`px-4 py-2.5 rounded-lg text-[16px] leading-relaxed shadow-sm relative break-words whitespace-pre-wrap ${
                    isUser
                      ? "bg-[#95ec69] text-black" // 微信绿
                      : "bg-white text-gray-800 border border-gray-100"
                  } 
                  max-w-fit w-fit text-left min-h-[40px] flex items-center`}
                  style={{
                    maxWidth: "75vw",
                    wordBreak: "break-word",
                  }}
                >
                  {message.content}
                </div>
              )}
            </div>

            {/* 右侧头像 (用户) */}
            {isUser && (
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 self-start overflow-hidden shadow-sm">
                {renderAvatar(myAvatar)}
              </div>
            )}
          </div>
        );
      })}

      {/* Loading 动画 */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 self-start overflow-hidden shadow-sm">
            {renderAvatar(contactAvatar)}
          </div>
          <div className="bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm self-start">
            <div className="flex space-x-1.5 h-4 items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
