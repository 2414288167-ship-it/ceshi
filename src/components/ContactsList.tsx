"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronLeft,
  MoreVertical,
  X,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  subtitle?: string;
  avatar?: string;
  remark?: string;
  aiName?: string;
  myNickname?: string;
}

interface ContactEditData {
  remark: string;
  aiName: string;
  myNickname: string;
  aiAvatar: string;
  myAvatar: string;
}

interface ChatSettings {
  allowNewHeartbeat: boolean;
  independentBackstageActivity: boolean;
  independentActionCooldown: number;
  shortTermMemoryTokens: number;
  longTermMemoryTokens: number;
  autoSummarizeLongMemory: boolean;
  autoSummarizationInterval: number;
  otherMemoryMounting: boolean;
  currentConversationTokens: number;
  estimateContextTokens: number;
  enableRealTimeWeather: boolean;
  enableTTSSynthesis: boolean;
  voiceId: string;
  voiceLanguage: string;
  enableMusicComposition: boolean;
  enablePrivateMode: boolean;
  enableTodoSync: boolean;
}

const sampleContacts: Contact[] = [
  {
    id: "1",
    name: "哼呀鬼",
    subtitle: "[在办公室，刚结束一个案情...]",
    avatar: "🐱",
    remark: "哼呀鬼",
    aiName: "沈墨",
    myNickname: "我",
  },
  {
    id: "2",
    name: "小明",
    subtitle: "吃饭了吗？",
    avatar: "🐶",
    remark: "小明",
    aiName: "小明",
    myNickname: "我",
  },
  {
    id: "3",
    name: "小红",
    subtitle: "晚上看个电影",
    avatar: "🐰",
    remark: "小红",
    aiName: "小红",
    myNickname: "我",
  },
];

const defaultChatSettings: ChatSettings = {
  allowNewHeartbeat: false,
  independentBackstageActivity: true,
  independentActionCooldown: 10,
  shortTermMemoryTokens: 30,
  longTermMemoryTokens: 10,
  autoSummarizeLongMemory: false,
  autoSummarizationInterval: 20,
  otherMemoryMounting: false,
  currentConversationTokens: 2910,
  estimateContextTokens: 8880,
  enableRealTimeWeather: false,
  enableTTSSynthesis: false,
  voiceId: "minimax voice_id",
  voiceLanguage: "自动识别 (Auto)",
  enableMusicComposition: false,
  enablePrivateMode: false,
  enableTodoSync: false,
};

export const ContactsList: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ContactEditData>({
    remark: "",
    aiName: "",
    myNickname: "",
    aiAvatar: "🐱",
    myAvatar: "🤖",
  });
  const [chatSettings, setChatSettings] =
    useState<ChatSettings>(defaultChatSettings);

  // 头像选择相关状态
  const [showAvatarPicker, setShowAvatarPicker] = useState<"ai" | "my" | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
    setChatSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEditClick = () => {
    if (selectedContact) {
      setEditData({
        remark: selectedContact.remark || selectedContact.name,
        aiName: selectedContact.aiName || "沈墨",
        myNickname: selectedContact.myNickname || "我",
        aiAvatar: selectedContact.avatar || "🐱",
        myAvatar: "🤖",
      });
      setIsEditing(true);
    }
  };

  // 获取最后一条消息作为预览
  const getMessagePreview = (contactId: string): string => {
    if (typeof window === "undefined") return "";
    try {
      const messagesStr = localStorage.getItem(`chat_${contactId}`);
      if (messagesStr) {
        const messages = JSON.parse(messagesStr);
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          return (
            lastMessage.content.substring(0, 30) +
            (lastMessage.content.length > 30 ? "..." : "")
          );
        }
      }
    } catch (e) {
      console.error("Failed to get message preview:", e);
    }
    return "";
  };

  const handleSaveEdit = () => {
    // 更新选中的联系人信息
    if (selectedContact) {
      const updatedContact: Contact = {
        ...selectedContact,
        remark: editData.remark,
        aiName: editData.aiName,
        myNickname: editData.myNickname,
        avatar: editData.aiAvatar.startsWith("data:")
          ? editData.aiAvatar
          : editData.aiAvatar,
        name: editData.remark, // 同步名字显示
      };

      // 更新联系人列表
      setContacts((prevContacts) =>
        prevContacts.map((c) =>
          c.id === selectedContact.id ? updatedContact : c
        )
      );

      // 更新选中的联系人
      setSelectedContact(updatedContact);

      // 保存到 localStorage
      const contactsData = contacts.map((c) =>
        c.id === selectedContact.id ? updatedContact : c
      );
      localStorage.setItem("contacts", JSON.stringify(contactsData));

      setIsEditing(false);
    }
  };

  // 处理头像文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (showAvatarPicker === "ai") {
          setEditData({ ...editData, aiAvatar: base64 });
        } else if (showAvatarPicker === "my") {
          setEditData({ ...editData, myAvatar: base64 });
        }
        setShowAvatarPicker(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const openFilePicker = (type: "ai" | "my") => {
    setShowAvatarPicker(type);
    fileInputRef.current?.click();
  };

  // AI预设头像
  const aiPresetAvatars = [
    "🐱",
    "🤖",
    "👨‍🎓",
    "👩‍🎨",
    "🧙",
    "🧚",
    "🧜",
    "🦸",
    "🧙‍♀️",
    "👽",
    "🤡",
    "🎭",
    "💀",
    "👻",
    "🎃",
  ];
  // 用户预设头像
  const myPresetAvatars = [
    "🤖",
    "👨",
    "👩",
    "👨‍💼",
    "👩‍💼",
    "👨‍🎓",
    "👩‍🎓",
    "🧑",
    "👨‍🎨",
    "👩‍🎨",
    "🧔",
    "👴",
    "👵",
    "🧓",
    "🤷",
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 text-blue-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-lg font-medium">消息</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-sky-500">
            <Search className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-sky-500"
            onClick={() => setShowCreate(true)}
            aria-label="create new"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      {!selectedContact ? (
        <>
          {/* Contacts list */}
          <main className="px-4 pt-2 pb-28">
            <ul className="divide-y">
              {contacts.map((c) => (
                <li
                  key={c.id}
                  className="py-3 flex items-center justify-between"
                >
                  <Link
                    href={`/chat/${c.id}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-xl">
                      {c.avatar && c.avatar.startsWith("data:") ? (
                        <Image
                          src={c.avatar}
                          alt={c.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div>{c.avatar || "🐱"}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{c.remark || c.name}</div>
                      <div className="text-sm text-gray-400">
                        {getMessagePreview(c.id) || c.subtitle}
                      </div>
                    </div>
                  </Link>
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedContact(c)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </main>
        </>
      ) : (
        <>
          {/* Chat Info Panel */}
          <main className="pb-28 overflow-y-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b flex items-center justify-between px-4 h-14">
              <button
                className="p-2 text-blue-500 flex items-center gap-1"
                onClick={() => {
                  setSelectedContact(null);
                  setIsEditing(false);
                }}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>返回</span>
              </button>
              <h1 className="text-lg font-bold flex-1 text-center">
                {isEditing ? "编辑信息" : "聊天详情"}
              </h1>
              {isEditing ? (
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium active:scale-95 transition"
                >
                  保存
                </button>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium active:scale-95 transition"
                >
                  编辑
                </button>
              )}
            </header>

            {/* Contact Info Section */}
            <section className="p-4 space-y-4">
              {/* Basic Info */}
              {isEditing ? (
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">
                      备注名 / 群名
                    </label>
                    <input
                      type="text"
                      value={editData.remark}
                      onChange={(e) =>
                        setEditData({ ...editData, remark: e.target.value })
                      }
                      className="w-full bg-gray-50 border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">
                      对方本名 (AI识别用)
                    </label>
                    <input
                      type="text"
                      value={editData.aiName}
                      onChange={(e) =>
                        setEditData({ ...editData, aiName: e.target.value })
                      }
                      className="w-full bg-gray-50 border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">
                      我的昵称
                    </label>
                    <input
                      type="text"
                      value={editData.myNickname}
                      onChange={(e) =>
                        setEditData({ ...editData, myNickname: e.target.value })
                      }
                      className="w-full bg-gray-50 border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">
                      对方头像
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg border flex items-center justify-center text-lg">
                        {editData.aiAvatar.startsWith("data:") ? (
                          <Image
                            src={editData.aiAvatar}
                            alt="AI Avatar"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          editData.aiAvatar
                        )}
                      </div>
                      <button
                        onClick={() => openFilePicker("ai")}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                      >
                        图库
                      </button>
                      <button
                        onClick={() => setShowAvatarPicker("ai")}
                        className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200 transition"
                      >
                        预设
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <label className="block text-sm font-medium mb-2">
                      我的头像
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg border flex items-center justify-center text-lg">
                        {editData.myAvatar.startsWith("data:") ? (
                          <Image
                            src={editData.myAvatar}
                            alt="My Avatar"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          editData.myAvatar
                        )}
                      </div>
                      <button
                        onClick={() => openFilePicker("my")}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                      >
                        图库
                      </button>
                      <button
                        onClick={() => setShowAvatarPicker("my")}
                        className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200 transition"
                      >
                        预设
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 flex items-center justify-between border-b">
                    <div>备注名 / 群名</div>
                    <div className="text-gray-500 text-sm">
                      {editData.remark}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between border-b">
                    <div>对方本名 (AI识别用)</div>
                    <div className="text-gray-500 text-sm">
                      {editData.aiName}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between border-b">
                    <div>我的昵称</div>
                    <div className="text-gray-500 text-sm">
                      {editData.myNickname}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2">对方头像</div>
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs">
                        {editData.aiAvatar}
                      </div>
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm">
                        更换
                      </button>
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm">
                        图库
                      </button>
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm">
                        挂件
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2">我的头像</div>
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs">
                        {editData.myAvatar}
                      </div>
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm">
                        更换
                      </button>
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm">
                        图库
                      </button>
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm">
                        挂件
                      </button>
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm">
                        预设
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2">好友分组</div>
                    <select className="w-full bg-gray-50 border rounded px-3 py-2 text-sm">
                      <option>未分组</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Chat Settings Section - only show when not editing */}
              {!isEditing && (
                <div>
                  <div className="text-xs text-gray-500 px-2 mb-2">
                    人聊天设置
                  </div>
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm divide-y">
                    {/* 注入最新心声 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>注入最新心声</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "allowNewHeartbeat",
                              !chatSettings.allowNewHeartbeat
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.allowNewHeartbeat
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.allowNewHeartbeat
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        回复前注入上一轮的内容独白
                      </div>
                    </div>

                    {/* 启用独立后台活动 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>启用独立后台活动</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "independentBackstageActivity",
                              !chatSettings.independentBackstageActivity
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.independentBackstageActivity
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.independentBackstageActivity
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        允许角色在后台主动发消息
                      </div>
                    </div>

                    {/* 独立行动冷却 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>独立行动冷却 (分钟)</div>
                      <input
                        type="number"
                        value={chatSettings.independentActionCooldown}
                        onChange={(e) =>
                          handleSettingChange(
                            "independentActionCooldown",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 bg-gray-50 border rounded px-2 py-1 text-right"
                      />
                    </div>

                    {/* 短期记忆条数 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>短期记忆条数</div>
                      <input
                        type="number"
                        value={chatSettings.shortTermMemoryTokens}
                        onChange={(e) =>
                          handleSettingChange(
                            "shortTermMemoryTokens",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 bg-gray-50 border rounded px-2 py-1 text-right"
                      />
                    </div>

                    {/* 挂载记忆条数 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>挂载记忆条数</div>
                      <input
                        type="number"
                        value={chatSettings.longTermMemoryTokens}
                        onChange={(e) =>
                          handleSettingChange(
                            "longTermMemoryTokens",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 bg-gray-50 border rounded px-2 py-1 text-right"
                      />
                    </div>

                    {/* 自动总结长期记忆 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>自动总结长期记忆</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "autoSummarizeLongMemory",
                              !chatSettings.autoSummarizeLongMemory
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.autoSummarizeLongMemory
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.autoSummarizeLongMemory
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        对话达到一定长度自动提炼
                      </div>
                    </div>

                    {/* 自动总结间隔 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>自动总结间隔 (条)</div>
                      <input
                        type="number"
                        value={chatSettings.autoSummarizationInterval}
                        onChange={(e) =>
                          handleSettingChange(
                            "autoSummarizationInterval",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 bg-gray-50 border rounded px-2 py-1 text-right"
                      />
                    </div>

                    {/* 挂载其他聊天记忆 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>挂载其他聊天记忆</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "otherMemoryMounting",
                              !chatSettings.otherMemoryMounting
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.otherMemoryMounting
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.otherMemoryMounting
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* 当前对话条数 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>当前对话条数</div>
                      <div className="text-gray-500 text-sm">
                        {chatSettings.currentConversationTokens} 条
                      </div>
                    </div>

                    {/* 预估上下文 Token */}
                    <div className="p-4 flex items-center justify-between">
                      <div>预估上下文 Token</div>
                      <div className="text-gray-500 text-sm">
                        {chatSettings.estimateContextTokens} Tokens
                      </div>
                    </div>

                    {/* 启用实时天气同步 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>启用实时天气同步</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "enableRealTimeWeather",
                              !chatSettings.enableRealTimeWeather
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.enableRealTimeWeather
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.enableRealTimeWeather
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* 启用语音合成 (TTS) */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>启用语音合成 (TTS)</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "enableTTSSynthesis",
                              !chatSettings.enableTTSSynthesis
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.enableTTSSynthesis
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.enableTTSSynthesis
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* 语音 ID */}
                    <div className="p-4 flex items-center justify-between">
                      <div>语音 ID</div>
                      <div className="text-gray-500 text-sm">
                        {chatSettings.voiceId}
                      </div>
                    </div>

                    {/* 语音语言/方言 */}
                    <div className="p-4">
                      <div className="mb-2">语音语言/方言</div>
                      <select
                        value={chatSettings.voiceLanguage}
                        onChange={(e) =>
                          handleSettingChange("voiceLanguage", e.target.value)
                        }
                        className="w-full bg-gray-50 border rounded px-3 py-2 text-sm"
                      >
                        <option>自动识别 (Auto)</option>
                        <option>中文</option>
                        <option>英文</option>
                      </select>
                    </div>

                    {/* 启用乐谱合成 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>启用乐谱合成</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "enableMusicComposition",
                              !chatSettings.enableMusicComposition
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.enableMusicComposition
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.enableMusicComposition
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        允许角色发送乐谱并自动演奏
                      </div>
                    </div>

                    {/* 启用旁白模式 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>启用旁白模式</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "enablePrivateMode",
                              !chatSettings.enablePrivateMode
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.enablePrivateMode
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.enablePrivateMode
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        AI每轮回复都会附带环境或心理描写(灰色系统字)
                      </div>
                    </div>

                    {/* 启用待办事项同步 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>启用待办事项同步</div>
                        <button
                          onClick={() =>
                            handleSettingChange(
                              "enableTodoSync",
                              !chatSettings.enableTodoSync
                            )
                          }
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            chatSettings.enableTodoSync
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                              chatSettings.enableTodoSync
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        并启后，AI将读取【今日】及【未完成】的待办事项。
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {/* Bottom tab bar (static) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-14 flex items-center justify-around">
        <button className="flex flex-col items-center text-sky-600 text-sm">
          消息
        </button>
        <button className="flex flex-col items-center text-gray-500 text-sm">
          动态
        </button>
        <button className="flex flex-col items-center text-gray-500 text-sm">
          回忆
        </button>
        <button className="flex flex-col items-center text-gray-500 text-sm">
          收藏
        </button>
        <button className="flex flex-col items-center text-gray-500 text-sm">
          NPC
        </button>
      </nav>

      {/* Create modal / action sheet */}
      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowCreate(false)}
          />
          <div className="w-full max-w-md mx-auto mb-8 bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 text-center border-b">
              <div className="text-lg font-medium">创建新聊天</div>
            </div>
            <div className="divide-y">
              <Link
                href="/chat/new/role"
                className="block p-4 text-sky-600 text-center"
              >
                手动创建角色
              </Link>
              <Link
                href="/chat/new/role"
                className="block p-4 text-sky-600 text-center"
              >
                从角色卡导入 (.json/.png)
              </Link>
            </div>
            <div className="p-4">
              <button
                className="w-full py-2 rounded-lg bg-gray-100"
                onClick={() => setShowCreate(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Preset Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAvatarPicker(null)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {showAvatarPicker === "ai" ? "选择对方头像" : "选择我的头像"}
              </h3>
              <button
                onClick={() => setShowAvatarPicker(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3 p-4">
              {(showAvatarPicker === "ai"
                ? aiPresetAvatars
                : myPresetAvatars
              ).map((avatar, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (showAvatarPicker === "ai") {
                      setEditData({ ...editData, aiAvatar: avatar });
                    } else if (showAvatarPicker === "my") {
                      setEditData({ ...editData, myAvatar: avatar });
                    }
                    setShowAvatarPicker(null);
                  }}
                  className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl hover:bg-gray-200 transition hover:scale-110 cursor-pointer"
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
