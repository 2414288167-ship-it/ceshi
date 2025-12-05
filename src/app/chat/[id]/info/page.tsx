"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, ChevronRight, Search } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChatInfoPage({ params }: PageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [contact, setContact] = useState<any>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // --- 新增：记录当前是否有背景图 ---
  const [hasBg, setHasBg] = useState(false);

  // 搜索相关
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);

      if (typeof window !== "undefined") {
        // 1. 加载联系人
        const contactsStr = localStorage.getItem("contacts");
        if (contactsStr) {
          const contacts = JSON.parse(contactsStr);
          const currentContact = contacts.find(
            (c: any) => String(c.id) === String(resolvedParams.id)
          );
          if (currentContact) {
            setContact(currentContact);
            setIsPinned(currentContact.isPinned || false);
          }
        }

        // 2. --- 检查是否有背景图 ---
        const bg = localStorage.getItem(`chat_bg_${resolvedParams.id}`);
        if (bg) {
          setHasBg(true);
        }
      }
    })();
  }, [params]);

  // 搜索逻辑
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const msgsStr = localStorage.getItem(`chat_${id}`);
    if (msgsStr) {
      const msgs = JSON.parse(msgsStr);
      const results = msgs.filter((m: any) => m.content.includes(query));
      setSearchResults(results);
    }
  };

  // 设置背景 (上传)
  const handleSetBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        localStorage.setItem(`chat_bg_${id}`, base64);
        setHasBg(true); // 更新状态
        alert("聊天背景设置成功！");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 新增：恢复默认背景 ---
  const handleRestoreBackground = () => {
    localStorage.removeItem(`chat_bg_${id}`);
    setHasBg(false); // 更新状态
    alert("已恢复默认灰色背景");
  };

  // 置顶逻辑
  const togglePin = () => {
    const newState = !isPinned;
    setIsPinned(newState);
    const contactsStr = localStorage.getItem("contacts");
    if (contactsStr) {
      const contacts = JSON.parse(contactsStr);
      const updatedContacts = contacts.map((c: any) => {
        if (String(c.id) === String(id)) return { ...c, isPinned: newState };
        return c;
      });
      localStorage.setItem("contacts", JSON.stringify(updatedContacts));
    }
  };

  // 清空记录逻辑
  const clearHistory = () => {
    if (confirm("确定要清空聊天记录吗？")) {
      localStorage.removeItem(`chat_${id}`);
      alert("聊天记录已清空");
    }
  };

  const MenuItem = ({
    label,
    type = "arrow",
    value = false,
    onClick,
    className = "",
    subText = "",
  }: any) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3.5 bg-white active:bg-gray-50 border-b border-gray-100 last:border-none ${className}`}
    >
      <span className="text-base text-gray-900">{label}</span>
      <div className="flex items-center gap-2">
        {subText && <span className="text-sm text-gray-400">{subText}</span>}
        {type === "arrow" && <ChevronRight className="w-5 h-5 text-gray-300" />}
        {type === "toggle" && (
          <div
            className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ${
              value ? "bg-[#07c160]" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                value ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (!contact) return <div className="bg-[#f5f5f5] min-h-screen"></div>;

  if (isSearching) {
    // ... 搜索界面的代码保持不变 ...
    return (
      <div className="flex flex-col h-screen bg-[#f5f5f5] text-gray-900">
        <div className="h-14 flex items-center px-2 bg-white border-b border-gray-200 sticky top-0 z-10 gap-2">
          <button
            onClick={() => setIsSearching(false)}
            className="p-2 text-gray-900"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 bg-gray-100 rounded-md flex items-center px-3 py-1.5">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-sm w-full"
              placeholder="搜索聊天记录..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center text-gray-400 mt-10">无搜索结果</div>
          )}
          {searchResults.map((msg: any) => (
            <div
              key={msg.id}
              className="bg-white p-3 rounded-lg mb-3 shadow-sm"
            >
              <div className="text-xs text-gray-400 mb-1 flex justify-between">
                <span>{msg.role === "user" ? "我" : contact.name}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-sm text-gray-800">{msg.content}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5] text-gray-900">
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={handleSetBackground}
      />

      <header className="h-14 flex items-center px-2 bg-white border-b border-gray-200 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-1 text-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium ml-1">聊天信息 ({contact.name})</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white p-4 mb-2 flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-1 w-16">
            <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden">
              {contact.avatar?.startsWith("data:") ||
              contact.avatar?.startsWith("http") ? (
                <img
                  src={contact.avatar}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {contact.avatar}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 truncate w-full text-center">
              {contact.name}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 w-16">
            <div className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              <Plus className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="mb-2">
          <MenuItem label="查找聊天记录" onClick={() => setIsSearching(true)} />
        </div>

        <div className="mb-2">
          <MenuItem
            label="消息免打扰"
            type="toggle"
            value={isMuted}
            onClick={() => setIsMuted(!isMuted)}
          />
          <MenuItem
            label="置顶聊天"
            type="toggle"
            value={isPinned}
            onClick={togglePin}
          />
          <MenuItem label="提醒" type="toggle" value={false} />
        </div>

        {/* --- 修改后的背景设置区域 --- */}
        <div className="mb-2">
          {/* 上传按钮 */}
          <MenuItem
            label="设置当前聊天背景"
            onClick={() => fileInputRef.current?.click()}
            subText={hasBg ? "已设置" : ""}
          />

          {/* 只有当 hasBg 为 true 时，才显示这个红色的恢复按钮 */}
          {hasBg && (
            <MenuItem
              label="恢复默认背景"
              onClick={handleRestoreBackground}
              className="text-red-600" // 红色字体，醒目一点
              type="none" // 不显示右箭头
            />
          )}
        </div>

        <div className="mb-2">
          <MenuItem label="清空聊天记录" onClick={clearHistory} />
        </div>

        <div className="mb-8">
          <MenuItem
            label="聊天设置"
            onClick={() => router.push(`/chat/${id}/settings`)}
          />
        </div>
      </div>
    </div>
  );
}
