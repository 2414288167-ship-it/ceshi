// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
// 👇 引入刚才写的客户端包装器
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat App",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0a0e27" />
      </head>
      <body className="dark antialiased">
        {/* 👇 使用包装器，而不是直接用 Provider */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
