"use client";

import Link from "next/link";
import React from "react";
import { Settings } from "lucide-react";
// 1. 引入外观数据钩子
import { useMyTheme } from "../lib/MyTheme";

export default function HomePage() {
  // ✅ 换成新的钩子名字
  const { settings } = useMyTheme();

  const apps = [
    { id: "chat", name: "聊天", href: "/chat", emoji: "💬" },
    { id: "qq", name: "QQ", href: "/chat", emoji: "🐧" },
    { id: "weixin", name: "微信", href: "/chat", emoji: "🟢" },
    { id: "weibo", name: "微博", href: "/chat", emoji: "🔴" },
    // 3. 新增：外观设置入口 (点击跳转到 appearance 页面)
    { id: "appearance", name: "外观", href: "/appearance", emoji: "🎨" },
  ];

  return (
    <div
      className="min-h-screen bg-darker text-white transition-all duration-500 bg-cover bg-center bg-fixed"
      // 4. 关键点：动态应用壁纸
      // 如果 settings.homeWallpaper 有值，它会覆盖 bg-darker
      style={{
        backgroundImage: settings.homeWallpaper
          ? `url(${settings.homeWallpaper})`
          : undefined,
        // 如果开启了夜间模式，可以在这里加一层滤镜变暗
        filter: settings.nightMode ? "brightness(0.7)" : "none",
      }}
    >
      <div className="hero-wrapper relative">
        {/* 左上角的设置按钮保留，指向原来的 API 设置页面 */}
        <Link
          href="/settings"
          className="absolute left-4 top-4 z-30 p-2 bg-white/10 rounded-full backdrop-blur-sm"
        >
          <Settings className="w-5 h-5 text-white" />
        </Link>

        <div className="hero-card">
          <div
            className="hero-bg-image"
            style={{
              // 如果有全局壁纸，我们可以让卡片背景稍微透明一点，或者保持原样
              backgroundImage:
                "linear-gradient(180deg, rgba(200,210,220,0.3), rgba(230,235,240,0.15))",
            }}
          />
          <div className="hero-inner">
            <div className="hero-avatar">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 9999,
                  background: "#f8fafc",
                }}
              />
            </div>
            <h1 className="hero-name">鱼好吃</h1>
            <div className="hero-handle">@miao_-˓◡˖</div>
            <div className="hero-subtitle">知足者常喵Zz z</div>
            <div className="hero-dot" />
          </div>
          <div className="bottom-wave" aria-hidden />
        </div>
      </div>

      <main className="px-6 pt-8">
        <div className="grid grid-cols-4 gap-6 justify-center items-center max-w-xl mx-auto">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={app.href}
              className="flex flex-col items-center gap-2 group"
            >
              {/* 图标容器：增加一点磨砂玻璃效果，让它在壁纸上更好看 */}
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-2xl shadow-sm transition-transform group-active:scale-95">
                {app.emoji}
              </div>
              <div className="text-sm text-gray-200 font-medium drop-shadow-md">
                {app.name}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
