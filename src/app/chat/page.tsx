"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MessageSquare,
  Users,
  Compass,
  User,
} from "lucide-react";
// 引入 SwipeableItem
import { SwipeableItem } from "@/components/SwipeableItem";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  remark?: string;
  intro?: string;
  aiName?: string;
  myNickname?: string;
  isPinned?: boolean;
}

export default function ChatListPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 默认数据
  const defaultContacts: Contact[] = [
    {
      id: "1",
      name: "哼呀鬼",
      avatar: "🐱",
      remark: "哼呀鬼",
      intro: "在办公室，刚结束一个案情...",
      isPinned: false,
    },
    {
      id: "2",
      name: "小明",
      avatar: "🐶",
      remark: "小明",
      intro: "吃饭了吗？",
      isPinned: false,
    },
    {
      id: "3",
      name: "小红",
      avatar: "🐰",
      remark: "小红",
      intro: "晚上看个电影",
      isPinned: false,
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("contacts");
        let parsedContacts = saved ? JSON.parse(saved) : defaultContacts;

        if (!saved) {
          localStorage.setItem("contacts", JSON.stringify(defaultContacts));
        }

        // 读取最新消息
        const contactsWithLatestMsg = parsedContacts.map((contact: Contact) => {
          const chatHistoryStr = localStorage.getItem(`chat_${contact.id}`);
          if (chatHistoryStr) {
            try {
              const messages = JSON.parse(chatHistoryStr);
              if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                return { ...contact, intro: lastMsg.content };
              }
            } catch (e) {
              console.error(e);
            }
          }
          return contact;
        });

        setContacts(sortContacts(contactsWithLatestMsg));
      } catch (e) {
        setContacts(defaultContacts);
      }
      setIsLoaded(true);
    }
  }, []);

  const sortContacts = (list: Contact[]) => {
    return [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  };

  const saveContacts = (newList: Contact[]) => {
    setContacts(newList);
    localStorage.setItem("contacts", JSON.stringify(newList));
  };

  const handleAddContact = () => {
    const randomId = Date.now().toString();
    const newContact: Contact = {
      id: randomId,
      name: `新朋友 ${Math.floor(Math.random() * 100)}`,
      avatar: "🤖",
      remark: "",
      intro: "你好，我是新来的AI助手",
      aiName: "智能助手",
      myNickname: "老板",
      isPinned: false,
    };
    const pinned = contacts.filter((c) => c.isPinned);
    const unpinned = contacts.filter((c) => !c.isPinned);
    const updated = [...pinned, newContact, ...unpinned];
    saveContacts(updated);
  };

  const handlePin = (id: string) => {
    const updated = contacts.map((c) => {
      if (c.id === id) return { ...c, isPinned: !c.isPinned };
      return c;
    });
    saveContacts(sortContacts(updated));
  };

  const handleDelete = (id: string) => {
    if (confirm("确认删除该聊天？")) {
      const updated = contacts.filter((c) => c.id !== id);
      saveContacts(updated);
      localStorage.removeItem(`chat_${id}`);
    }
  };

  const handleRead = (id: string) => {
    console.log("read", id);
  };

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 overflow-hidden">
      {/* --- Header: 修改为通讯录同款 (灰色背景、居中标题、相对定位) --- */}
      <header className="px-4 h-14 flex items-center justify-between bg-[#ededed] border-b border-gray-200 shrink-0 z-20 relative">
        <h1 className="text-lg font-medium text-gray-900 w-full text-center mr-[-40px]">
          消息 ({contacts.length})
        </h1>
        <div className="flex gap-4 absolute right-4">
          <button className="text-gray-900 p-1">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={handleAddContact} className="text-gray-900 p-1">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 列表区域 */}
      <div className="flex-1 overflow-y-auto pb-16">
        {contacts.map((contact) => (
          <SwipeableItem
            key={contact.id}
            isPinned={contact.isPinned}
            onPin={() => handlePin(contact.id)}
            onDelete={() => handleDelete(contact.id)}
            onRead={() => handleRead(contact.id)}
          >
            <Link
              href={`/chat/${contact.id}`}
              className={`flex items-center gap-3 px-4 py-3 active:bg-gray-100 transition-colors ${
                contact.isPinned ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {contact.avatar?.startsWith("data:") ||
                contact.avatar?.startsWith("http") ? (
                  <img
                    src={contact.avatar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{contact.avatar}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-medium text-base text-gray-900 truncate">
                    {contact.remark || contact.name}
                  </h3>
                  <span className="text-xs text-gray-300">刚刚</span>
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {contact.intro || "点击开始聊天..."}
                </p>
              </div>
            </Link>
          </SwipeableItem>
        ))}
      </div>

      {/* --- 底部导航栏: 优化版 --- */}
      {/* 修改点：高度改为 h-16，padding-bottom 加大，图标改为 w-7 h-7 */}
      <div className="h-16 bg-[#f7f7f7] border-t border-gray-200 flex items-center justify-around text-[11px] shrink-0 fixed bottom-0 w-full z-30 pb-1 safe-area-bottom">
        <div className="flex flex-col items-center justify-center h-full w-1/4 cursor-pointer text-[#07c160]">
          <div className="relative">
            <MessageSquare className="w-7 h-7 mb-0.5 fill-current" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <span>微信</span>
        </div>

        <Link
          href="/contacts"
          className="flex flex-col items-center justify-center h-full w-1/4 text-gray-900 hover:text-[#07c160] transition-colors"
        >
          <Users className="w-7 h-7 mb-0.5" />
          <span>通讯录</span>
        </Link>

        <Link
          href="/discover"
          className="flex flex-col items-center justify-center h-full w-1/4 text-gray-900 hover:text-[#07c160] transition-colors"
        >
          <Compass className="w-7 h-7 mb-0.5" />
          <span>发现</span>
        </Link>

        <Link
          href="/me"
          className="flex flex-col items-center justify-center h-full w-1/4 text-gray-900 hover:text-[#07c160] transition-colors"
        >
          <User className="w-7 h-7 mb-0.5" />
          <span>我</span>
        </Link>
      </div>
    </div>
  );
}
