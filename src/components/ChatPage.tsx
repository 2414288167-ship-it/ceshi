"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageList, Message } from "./MessageList";
import { InputArea } from "./InputArea";
import { InputProvider } from "@/context/InputContext";
import { Menu, ChevronLeft } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ChatPageProps {
  conversationId?: string;
  contactName?: string;
}

export default function ChatPage({
  conversationId,
  contactName = "AI助手",
}: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [aiState, setAiState] = useState<
    "idle" | "waiting" | "thinking" | "typing"
  >("idle");

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [localWeather, setLocalWeather] = useState<string>("");

  const [contactInfo, setContactInfo] = useState<{
    name: string;
    avatar: string;
    aiName: string;
    myNickname: string;
    intro?: string;
    aiPersona?: string;
    weatherSync?: boolean;
    location?: string;
    asideMode?: boolean;
    descMode?: boolean;
    timeSense?: boolean;
    timezone?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // =========================================================
  // 1. 修改语音 Hook 回调：直接发送语音气泡
  // =========================================================
  useSpeechRecognition((text, duration) => {
    if (!text) return;
    // 直接调用发送逻辑，传入 type='audio' 和 duration
    handleUserSend(text, "audio", duration);
  });

  // 初始化逻辑 (保持不变)
  useEffect(() => {
    if (conversationId && typeof window !== "undefined") {
      try {
        const contactsStr = localStorage.getItem("contacts");
        if (contactsStr) {
          const contacts = JSON.parse(contactsStr);
          const contact = contacts.find(
            (c: any) => String(c.id) === String(conversationId)
          );
          if (contact) {
            setContactInfo({
              name: contact.remark || contact.name,
              avatar: contact.avatar || "🐱",
              aiName: contact.name || contact.name,
              myNickname: contact.myNickname || "我",
              intro: contact.intro,
              aiPersona: contact.aiPersona,
              weatherSync: contact.weatherSync,
              location: contact.location,
              asideMode: contact.asideMode,
              descMode: contact.descMode,
              timeSense: contact.timeSense,
              timezone: contact.timezone || "Asia/Shanghai",
            });
            const savedMsgs = localStorage.getItem(`chat_${conversationId}`);
            if (savedMsgs) setMessages(JSON.parse(savedMsgs));

            if (contact.weatherSync) {
              fetchWeather(contact.location);
            }
          } else {
            setContactInfo({
              name: contactName,
              avatar: "🐱",
              aiName: contactName,
              myNickname: "我",
            });
          }
        }
        const savedBg = localStorage.getItem(`chat_bg_${conversationId}`);
        if (savedBg) setBgImage(savedBg);
      } catch (e) {
        console.error(e);
      }
    }
  }, [conversationId, contactName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (input.trim().length > 0) {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
        replyTimerRef.current = null;
      }
      if (aiState === "waiting") setAiState("idle");
    }
  }, [input, aiState]);

  const fetchWeather = async (location: string = "") => {
    try {
      const query = location ? encodeURIComponent(location) : "";
      const url = `https://wttr.in/${query}?format=3`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        setLocalWeather(text.trim());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCurrentTime = (timeZone: string) => {
    try {
      const now = new Date();
      return now.toLocaleString("zh-CN", {
        timeZone: timeZone,
        hour12: false,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    } catch (e) {
      return new Date().toLocaleString();
    }
  };

  const triggerAIResponse = async (currentMessages: Message[]) => {
    setAiState("thinking");
    try {
      const apiKey = localStorage.getItem("ai_api_key")?.trim();
      let proxyUrl = localStorage.getItem("ai_proxy_url")?.trim();
      const model = localStorage.getItem("ai_model")?.trim() || "gpt-3.5-turbo";
      if (!apiKey) throw new Error("API Key Missing");
      if (!proxyUrl) proxyUrl = "https://api.openai.com/v1";
      proxyUrl = proxyUrl.replace(/\/+$/, "");
      let fetchUrl = proxyUrl.includes("/chat/completions")
        ? proxyUrl
        : proxyUrl.endsWith("/v1")
        ? `${proxyUrl}/chat/completions`
        : `${proxyUrl}/v1/chat/completions`;

      let finalSystemPrompt = "";
      finalSystemPrompt += `你现在进行角色扮演。你的名字是：${contactInfo?.aiName}。\n`;
      finalSystemPrompt += `你的对话对象是：${contactInfo?.myNickname}。\n`;

      if (contactInfo?.aiPersona)
        finalSystemPrompt += `【你的详细人设】：\n${contactInfo.aiPersona}\n`;
      else if (contactInfo?.intro)
        finalSystemPrompt += `【人设背景】：${contactInfo.intro}\n`;

      finalSystemPrompt += `\n【环境感知】：\n`;
      if (contactInfo?.timeSense)
        finalSystemPrompt += `- 当前时间：${getCurrentTime(
          contactInfo?.timezone || "Asia/Shanghai"
        )}\n`;
      if (contactInfo?.weatherSync && localWeather)
        finalSystemPrompt += `- ${
          contactInfo?.location || "当前位置"
        } 天气：${localWeather}\n`;

      finalSystemPrompt += `\n【回复指令】：\n1. 随机决定回复条数，如需分段用 || 隔开。\n`;
      if (contactInfo?.asideMode)
        finalSystemPrompt += `2. [旁白模式]：用（括号）描写心理/动作。\n`;
      if (contactInfo?.descMode)
        finalSystemPrompt += `3. [描写模式]：侧重动作描写。\n`;
      else finalSystemPrompt += `2. 保持口语化。\n`;

      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          messages: [
            { role: "system", content: finalSystemPrompt },
            // 发送给 AI 时，无论是语音还是文字，content 都是文字，所以这里直接传就行
            ...currentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      if (!response.ok) throw new Error(response.statusText);
      setAiState("typing");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Cannot read response body");
      const decoder = new TextDecoder();
      let aiContent = "";
      const tempAiMsgId = (Date.now() + 1).toString();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === "[DONE]") continue;
          try {
            const data = JSON.parse(dataStr);
            const token = data.choices?.[0]?.delta?.content || "";
            if (token) {
              aiContent += token;
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (
                  lastMsg.role === "assistant" &&
                  lastMsg.id === tempAiMsgId
                ) {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMsg, content: aiContent },
                  ];
                } else {
                  return [
                    ...prev,
                    {
                      id: tempAiMsgId,
                      role: "assistant",
                      content: aiContent,
                      timestamp: new Date(),
                    },
                  ];
                }
              });
            }
          } catch (e) {}
        }
      }

      if (aiContent) {
        const splitParts = aiContent
          .split("||")
          .map((s) => s.trim())
          .filter((s) => s);
        const finalAiMessages = splitParts.map((part, index) => ({
          id: (Date.now() + index + 10).toString(),
          role: "assistant" as const,
          content: part,
          timestamp: new Date(Date.now() + index * 500),
        }));
        setMessages((prev) => {
          const cleanPrev = prev.filter((m) => m.id !== tempAiMsgId);
          const next = [...cleanPrev, ...finalAiMessages];
          if (conversationId)
            localStorage.setItem(
              `chat_${conversationId}`,
              JSON.stringify(next)
            );
          return next;
        });
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `❌ ${e.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setAiState("idle");
      replyTimerRef.current = null;
    }
  };

  // =========================================================
  // 2. 修改发送函数：支持 type 和 duration 参数
  // =========================================================
  const handleUserSend = (
    text: string = input,
    type: "text" | "audio" = "text",
    duration?: number
  ) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
      type: type, // 记录消息类型
      duration: duration, // 记录语音时长
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      if (conversationId)
        localStorage.setItem(
          `chat_${conversationId}`,
          JSON.stringify(newMessages)
        );

      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);

      setAiState("waiting");
      replyTimerRef.current = setTimeout(() => {
        triggerAIResponse(newMessages);
      }, 4000);

      return newMessages;
    });
    setInput("");
  };

  const getHeaderStatus = () => {
    if (aiState === "thinking") return "对方正在思考...";
    if (aiState === "typing") return "对方正在输入...";
    if (aiState === "waiting") return "对方正在偷看你发的消息...";
    return contactInfo?.name || contactName;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-white/90 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center gap-1">
          <Link
            href="/chat"
            className="-ml-2 p-2 text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="ml-1 h-10 flex flex-col justify-center">
            <div className="font-semibold text-base transition-all duration-200">
              {getHeaderStatus()}
            </div>
            {aiState === "idle" && (
              <div className="text-xs text-green-500">在线</div>
            )}
          </div>
        </div>
        <Link
          href={`/chat/${conversationId}/info`}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <Menu className="w-5 h-5" />
        </Link>
      </header>

      <div
        className="flex-1 overflow-y-auto px-4 pt-4 pb-32"
        style={{
          backgroundColor: bgImage ? "transparent" : "#f5f5f5",
          backgroundImage: bgImage ? `url(${bgImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <MessageList
          messages={messages}
          isLoading={aiState === "thinking"}
          contactAvatar={contactInfo?.avatar}
        />
        <div ref={messagesEndRef} />
      </div>

      <InputProvider
        onInputChange={setInput}
        onSendAudio={(text, duration) =>
          handleUserSend(text, "audio", duration)
        }
        onSendText={() => handleUserSend(input, "text")}
        input={input}
      >
        <InputArea
          input={input}
          isLoading={aiState === "thinking" || aiState === "typing"}
        />
      </InputProvider>
    </div>
  );
}
