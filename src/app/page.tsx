// src/app/page.tsx
import HomePage from "@/components/HomePage";

export default function Home() {
  // 👇 这里的 Provider 可以删掉了，直接返回组件即可
  return <HomePage />;
}
