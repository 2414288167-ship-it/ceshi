"use client"; // 必须有这行，因为 Provider 只能在客户端运行

import React from "react"; // 👇 必须引入你的 ThemeProvider (根据报错图，路径应该是这个)
import { MyThemeProvider } from "@/lib/MyTheme";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 👇 关键：必须用 MyThemeProvider 包裹住 children
    <MyThemeProvider>{children}</MyThemeProvider>
  );
}
