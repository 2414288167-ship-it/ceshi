// src/lib/MyTheme.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// 1. 定义完整的类型 (配合你的外观页面)
interface ThemeSettings {
  homeWallpaper: string;
  chatWallpaper: string;
  nightMode: boolean;
  showStatusBar: boolean;
  immersiveFrame: boolean;
  dynamicIsland: boolean;
  messageSoundUrl: string;
  customCss: string;
}

// 2. 设置默认值
const defaultSettings: ThemeSettings = {
  homeWallpaper:
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
  chatWallpaper: "",
  nightMode: false,
  showStatusBar: true,
  immersiveFrame: false,
  dynamicIsland: false,
  messageSoundUrl: "",
  customCss: "",
};

interface ThemeContextType {
  settings: ThemeSettings;
  updateSetting: (key: keyof ThemeSettings, value: any) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function MyThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem("my_theme_settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const updateSetting = (key: keyof ThemeSettings, value: any) => {
    setSettings((prev) => {
      const newS = { ...prev, [key]: value };
      localStorage.setItem("my_theme_settings", JSON.stringify(newS));
      return newS;
    });
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSetting }}>
      {/* 注入全局 CSS */}
      {settings.customCss && (
        <style dangerouslySetInnerHTML={{ __html: settings.customCss }} />
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export const useMyTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useMyTheme must be used within MyThemeProvider");
  }
  return context;
};
