// src/context/AppearanceContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// 定义设置的数据结构
interface AppearanceSettings {
  homeWallpaper: string;
  chatWallpaper: string;
  nightMode: boolean;
  showStatusBar: boolean;
  immersiveFrame: boolean;
  dynamicIsland: boolean;
  messageSoundUrl: string;
  customCss: string;
  // 可以继续扩展更多字段...
}

const defaultSettings: AppearanceSettings = {
  homeWallpaper:
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80", // 默认蓝色渐变
  chatWallpaper: "",
  nightMode: false,
  showStatusBar: true,
  immersiveFrame: false,
  dynamicIsland: false,
  messageSoundUrl: "",
  customCss: "",
};

interface AppearanceContextType {
  settings: AppearanceSettings;
  updateSetting: (key: keyof AppearanceSettings, value: any) => void;
  resetSettings: () => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(
  undefined
);

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const saved = localStorage.getItem("appearance_settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 保存设置到 localStorage
  const updateSetting = (key: keyof AppearanceSettings, value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem("appearance_settings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("appearance_settings");
  };

  // 避免服务端渲染不匹配，等待加载完成
  if (!isLoaded) return <>{children}</>;

  return (
    <AppearanceContext.Provider
      value={{ settings, updateSetting, resetSettings }}
    >
      {/* 注入全局 CSS */}
      {settings.customCss && (
        <style dangerouslySetInnerHTML={{ __html: settings.customCss }} />
      )}
      {children}
    </AppearanceContext.Provider>
  );
}

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context)
    throw new Error("useAppearance must be used within AppearanceProvider");
  return context;
};
