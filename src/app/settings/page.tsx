"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [temp, setTemp] = useState(0.8);
  const [enableBgActivity, setEnableBgActivity] = useState(true);
  const [enableAiImages, setEnableAiImages] = useState(true);

  const [proxyUrl, setProxyUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const p = localStorage.getItem("ai_proxy_url") || "";
      const k = localStorage.getItem("ai_api_key") || "";
      const m = localStorage.getItem("ai_model") || "";
      setProxyUrl(p);
      setApiKey(k);
      setModel(m);
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ai_proxy_url", proxyUrl);
      localStorage.setItem("ai_api_key", apiKey);
      localStorage.setItem("ai_model", model);
      alert("已保存 API 配置");
    }
  };

  const [fetching, setFetching] = React.useState(false);
  const [modelsList, setModelsList] = React.useState<string[]>([]);
  const [showModelsModal, setShowModelsModal] = React.useState(false);
  const [selectedModelIndex, setSelectedModelIndex] = React.useState<
    number | null
  >(null);
  const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
  const saveConfirmTimerRef = React.useRef<number | null>(null);

  // 当弹窗打开时，为根元素添加 modal-open class 锁定背景滚动
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.documentElement;
    if (showModelsModal) {
      el.classList.add("modal-open");
    } else {
      el.classList.remove("modal-open");
    }
    return () => {
      el.classList.remove("modal-open");
    };
  }, [showModelsModal]);

  React.useEffect(() => {
    return () => {
      if (saveConfirmTimerRef.current) {
        clearTimeout(saveConfirmTimerRef.current);
      }
    };
  }, []);

  const handleFetchModels = async () => {
    if (!proxyUrl || !proxyUrl.trim()) {
      alert('请先在"反代地址"中填写代理 URL 并保存后再尝试拉取模型');
      return;
    }
    setFetching(true);
    setSelectedModelIndex(null); // 重置选择索引，待拉取完成后初始化
    try {
      const urlBase = proxyUrl.replace(/\/+$/, "");
      const tryUrls = [urlBase + "/models", urlBase + "/v1/models", urlBase];
      let res = null;
      let lastError = "";
      for (const u of tryUrls) {
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
          res = await fetch(u, { method: "GET", headers });
          if (!res.ok) {
            // try next
            lastError = `请求 ${u} 返回 ${res.status}`;
            res = null;
            continue;
          }
          break;
        } catch (err: any) {
          lastError = String(err?.message || err);
          res = null;
        }
      }

      if (!res) {
        alert(
          "拉取模型失败: " +
            lastError +
            "\n请确认反代地址和网络可用，或在设置中选择合适的接口。"
        );
        return;
      }

      const data = await res.json().catch(() => null);
      if (!data) {
        alert("拉取模型失败：返回数据无法解析为 JSON");
        return;
      }

      // 更鲁棒的解析：递归查找首个非空数组，且数组元素为字符串或对象（包含 id/name/model 字段）
      const seen = new Set<any>();
      function findArray(obj: any): any[] | null {
        if (!obj || seen.has(obj)) return null;
        seen.add(obj);
        if (Array.isArray(obj) && obj.length > 0) return obj;
        if (typeof obj === "object") {
          for (const key of Object.keys(obj)) {
            try {
              const val = (obj as any)[key];
              if (Array.isArray(val) && val.length > 0) return val;
              if (typeof val === "object") {
                const found = findArray(val);
                if (found) return found;
              }
            } catch (e) {
              // ignore
            }
          }
        }
        return null;
      }

      const candidate = findArray(data) || [];
      if (candidate.length > 0) {
        // 规范化为字符串列表
        const normalized = candidate.map((it: any) => {
          if (typeof it === "string") return it;
          if (!it) return JSON.stringify(it);
          return it.id || it.name || it.model || it.title || JSON.stringify(it);
        });
        const first = normalized[0];
        setModel(first);
        setModelsList(normalized);
        // 根据当前保存的模型值初始化选择索引，若不存在则默认为 0
        const idx = normalized.findIndex((m) => m === model) ?? 0;
        setSelectedModelIndex(idx >= 0 ? idx : 0);
        console.debug(
          "[Settings] models fetched, currentModel:",
          model,
          "normalized:",
          normalized,
          "selectedIdx:",
          idx
        );
        // 打开模型选择弹窗，方便用户选择其它模型
        setShowModelsModal(true);
        alert(
          "已拉取模型列表，已默认选择第一个模型：" +
            first +
            "\n你也可以在弹窗中选择其它模型，记得点击保存以持久化配置"
        );
      } else {
        console.warn("模型拉取返回数据：", data);
        alert(
          "拉取成功，但未检测到模型列表，请检查返回格式。已把返回数据输出到控制台（console）。"
        );
      }
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="h-14 flex items-center justify-between px-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-blue-500 p-2">
            &lt;
          </Link>
          <h1 className="text-lg font-medium">API 设置</h1>
        </div>
        <button
          onClick={() => {
            handleSave();
            setShowSaveConfirm(true);
            if (saveConfirmTimerRef.current) {
              clearTimeout(saveConfirmTimerRef.current);
            }
            saveConfirmTimerRef.current = window.setTimeout(() => {
              setShowSaveConfirm(false);
              saveConfirmTimerRef.current = null;
            }, 1500);
          }}
          className="mr-2 px-3 py-1 bg-green-400 text-white rounded-lg"
        >
          保存
        </button>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>语言</div>
              <div className="text-gray-500">简体中文</div>
            </div>
          </div>
        </section>

        <section>
          <div className="text-sm text-gray-500 mb-2">API 预设管理</div>
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>当前配置</div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-gray-100 rounded"
                >
                  保存
                </button>
                <button
                  className="px-3 py-1 bg-gray-100 rounded"
                  onClick={() => {
                    setProxyUrl("");
                    setApiKey("");
                    setModel("");
                    localStorage.removeItem("ai_proxy_url");
                    localStorage.removeItem("ai_api_key");
                    localStorage.removeItem("ai_model");
                  }}
                >
                  删除
                </button>
              </div>
            </div>
            <div className="p-4 text-sm text-gray-500">
              主API设置 (用于聊天)
            </div>
            <div className="p-4 border-t">
              <div className="mb-2 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                提示: 若要使用 “发送图片” 功能，请务必选择支持 Vision 的模型。
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500">
                    反代地址 (Proxy URL)
                  </label>
                  <input
                    value={proxyUrl}
                    onChange={(e) => setProxyUrl(e.target.value)}
                    placeholder="https://your-proxy.example.com/api/chat"
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">API Key</label>
                  <input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    模型 (可选)
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      value={model}
                      readOnly
                      onClick={() => {
                        if (modelsList && modelsList.length > 0) {
                          setShowModelsModal(true);
                        } else {
                          alert(
                            "还没有拉取模型，请先点击拉取模型按钮获取可用模型列表"
                          );
                        }
                      }}
                      placeholder="gpt-4o"
                      className="flex-1 mt-1 border rounded px-3 py-2 bg-white/80 cursor-pointer"
                    />
                    <button
                      onClick={handleFetchModels}
                      disabled={fetching}
                      className="px-3 py-2 bg-blue-600 text-white rounded"
                    >
                      {fetching ? "拉取中..." : "拉取模型"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-2">
              副API设置 (用于总结长期记忆)
            </div>
            <div className="grid grid-cols-3 gap-2 text-gray-600">
              <div className="col-span-2">反代地址</div>
              <div className="text-right text-gray-400">留空使用主API</div>
              <div className="col-span-2">API Key</div>
              <div className="text-right text-gray-400">可选</div>
              <div className="col-span-2">模型</div>
              <div className="text-right">
                <button className="px-2 py-1 bg-gray-100 rounded">拉取</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-xl p-4">
            <div className="mb-3 text-sm text-gray-500">参数设置</div>
            <div className="flex items-center justify-between">
              <div>温度 (Temperature)</div>
              <div className="text-sky-600">{temp.toFixed(1)}</div>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full mt-3"
            />
          </div>
        </section>

        <section>
          <div className="bg-white rounded-xl p-4">
            <div className="mb-3 text-sm text-gray-500">后台活动设置</div>
            <div className="flex items-center justify-between py-2">
              <div>启用后台角色活动</div>
              <input
                type="checkbox"
                checked={enableBgActivity}
                onChange={(e) => setEnableBgActivity(e.target.checked)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>检测间隔 (秒)</div>
              <div className="bg-gray-50 px-3 py-1 rounded">300</div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>拉黑冷静期 (小时)</div>
              <div className="bg-gray-50 px-3 py-1 rounded">1</div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-xl p-4">
            <div className="mb-3 text-sm text-gray-500">
              语音消息设置 (MINIMAX TTS)
            </div>
            <div className="grid grid-cols-3 gap-2 text-gray-700 items-center">
              <div className="col-span-2">Group ID</div>
              <div className="text-right text-gray-400">输入 Group ID</div>
              <div className="col-span-2">API Key</div>
              <div className="text-right text-gray-400">输入 API Key</div>
              <div className="col-span-2">模型</div>
              <div className="text-right">Speech-01 (标准版)</div>
              <div className="col-span-2">接口域名</div>
              <div className="text-right">🇨🇳 国内 (api.minimax.chat)</div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-xl p-4">
            <div className="mb-3 text-sm text-gray-500">生图功能设置</div>
            <div className="flex items-center justify-between py-2">
              <div>启用通用 AI 生图</div>
              <input
                type="checkbox"
                checked={enableAiImages}
                onChange={(e) => setEnableAiImages(e.target.checked)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>启用 NovelAI</div>
              <input type="checkbox" />
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-xl p-4">
            <div className="mb-3 text-sm text-gray-500">云服务与存储</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-3 border-t">
                ImgBB 图床 <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                Catbox 托管 <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                GitHub 云备份 <input type="checkbox" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 保存成功提示 (toast) */}
      {showSaveConfirm && (
        <div className="fixed right-4 bottom-6 z-60">
          <div className="bg-green-600 text-white px-4 py-2 rounded shadow-lg">
            已保存
          </div>
        </div>
      )}
      {/* Models selection modal */}
      {showModelsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setShowModelsModal(false)}
          />
          {/* 修复点：添加 relative 和 z-10，确保内容层在背景层之上，能够接收点击 */}
          <div className="relative z-10 w-full max-w-md mx-auto bg-white text-black rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b text-center font-medium">选择模型</div>
            <div
              className="max-h-[60vh] overflow-y-auto"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "auto",
                overscrollBehavior: "contain",
              }}
            >
              {modelsList.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  没有可用模型，先拉取模型列表
                </div>
              ) : (
                modelsList.map((m, idx) => (
                  <button
                    key={m + idx}
                    onClick={(e) => {
                      // 建议添加 stopPropagation 防止冒泡（虽然有 z-index 后可能不需要，但更稳妥）
                      e.stopPropagation();
                      console.debug(
                        "[Settings] model item clicked, idx:",
                        idx,
                        "model:",
                        m
                      );
                      setSelectedModelIndex(idx);
                    }}
                    className={`w-full text-left p-4 border-b flex items-center justify-between ${
                      selectedModelIndex === idx ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className="truncate">{m}</span>
                    <span className="text-sky-600">
                      {selectedModelIndex === idx ? "已选" : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="p-4 flex gap-3">
              <button
                onClick={() => {
                  if (
                    selectedModelIndex != null &&
                    modelsList[selectedModelIndex]
                  ) {
                    const chosen = modelsList[selectedModelIndex];
                    setModel(chosen);
                    try {
                      localStorage.setItem("ai_model", chosen);
                      // 建议：在这里也顺便保存一下当前的 Proxy 和 Key，防止用户忘记点主保存
                      if (proxyUrl)
                        localStorage.setItem("ai_proxy_url", proxyUrl);
                      if (apiKey) localStorage.setItem("ai_api_key", apiKey);

                      console.info("[Settings] model changed to:", chosen);
                    } catch (e) {
                      console.warn("[Settings] failed to persist ai_model", e);
                    }
                  }
                  setShowModelsModal(false);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded"
              >
                确定
              </button>
              <button
                onClick={() => setShowModelsModal(false)}
                className="flex-1 py-2 bg-gray-100 rounded"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
