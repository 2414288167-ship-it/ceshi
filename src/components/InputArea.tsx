"use client";

import React, { useRef, useEffect, useState } from "react";
import { Signal, Keyboard, Smile, Plus, Mic, X } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useInputContext } from "@/context/InputContext";

interface InputAreaProps {
  input: string;
  isLoading: boolean;
}

export function InputArea({ input, isLoading }: InputAreaProps) {
  const { onInputChange, onSendAudio, onSendText } = useInputContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [recordState, setRecordState] = useState<
    "idle" | "recording" | "cancel"
  >("idle");
  const startY = useRef(0);

  const { startListening, stopListening, abortListening } =
    useSpeechRecognition((text, duration) => {
      if (text) {
        // 直接发送音频消息，传递识别到的文本和时长
        onSendAudio(text, duration);
      }
    });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // --- 修复后的触摸事件处理 ---

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    // 删除了 e.preventDefault()，解决 passive event listener 报错
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;

    setRecordState("recording");
    startListening();
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (recordState === "idle") return;

    // 删除了 e.preventDefault()
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const diff = startY.current - clientY;

    if (diff > 80) {
      setRecordState("cancel");
    } else {
      setRecordState("recording");
    }
  };

  const handleEnd = () => {
    // 这里保留 preventDefault 是安全的，或者也可以删掉
    // e.preventDefault();

    if (recordState === "cancel") {
      abortListening();
    } else if (recordState === "recording") {
      stopListening();
    }
    setRecordState("idle");
  };

  return (
    <>
      {/* 全屏录音状态遮罩 */}
      {recordState !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className={`w-40 h-40 rounded-xl flex flex-col items-center justify-center transition-colors duration-200 shadow-xl ${
              recordState === "cancel" ? "bg-[#fa5151]" : "bg-[#55b969]"
            }`}
          >
            {recordState === "cancel" ? (
              <>
                <div className="mb-4">
                  <X className="w-12 h-12 text-white" />
                </div>
                <span className="text-white text-[15px] font-bold bg-[#b52d2d] px-1 rounded">
                  松开手指
                </span>
                <span className="text-white/80 text-xs mt-1">取消发送</span>
              </>
            ) : (
              <>
                <div className="mb-2">
                  <Mic className="w-14 h-14 text-white animate-pulse" />
                </div>
                <span className="text-white text-[15px] font-bold">
                  手指上滑
                </span>
                <span className="text-white/80 text-xs mt-1">取消发送</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 底部菜单 */}
      {showMenu && (
        <div className="fixed md:relative bottom-24 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-4 safe-area-bottom max-h-48 overflow-y-auto">
          <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
            <button className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">相册</span>
            </button>
            {/* ...其他按钮省略... */}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="fixed md:relative bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-3 py-2.5 safe-area-bottom select-none">
        <div className="flex gap-2 items-end">
          <button
            onClick={() =>
              setInputMode((prev) => (prev === "text" ? "voice" : "text"))
            }
            className="flex-shrink-0 w-8 h-8 mb-1 rounded-full border border-gray-800 transition-colors flex items-center justify-center text-gray-800 bg-white hover:bg-gray-100"
          >
            {inputMode === "text" ? (
              <Signal className="w-5 h-5" />
            ) : (
              <Keyboard className="w-5 h-5" />
            )}
          </button>

          {inputMode === "text" ? (
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              className="flex-1 bg-white text-gray-900 rounded-lg px-2 py-2 resize-none focus:outline-none border-none max-h-24 min-h-[40px] text-base leading-relaxed"
              style={{ paddingTop: "8px" }}
              disabled={isLoading}
            />
          ) : (
            <button
              className={`flex-1 h-10 mb-[1px] rounded-md text-[16px] font-bold text-gray-900 transition-colors select-none touch-none flex items-center justify-center ${
                recordState === "idle"
                  ? "bg-white border border-gray-200"
                  : "bg-gray-200 border border-gray-300"
              }`}
              // 触摸事件
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              // 鼠标事件
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              // 防止长按弹出右键菜单
              onContextMenu={(e) => e.preventDefault()}
            >
              {recordState === "idle" ? "按住 说话" : "松开 结束"}
            </button>
          )}

          <div className="flex gap-2 mb-1 flex-shrink-0 items-center">
            <button className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-gray-800 bg-white hover:bg-gray-100 transition-colors">
              <Smile className="w-5 h-5" />
            </button>

            {input.trim() && inputMode === "text" ? (
              <button
                onClick={() => onSendText()}
                disabled={isLoading}
                className="h-8 px-4 rounded-md bg-[#07c160] text-white text-sm font-medium hover:bg-[#06ad56] transition-colors flex items-center justify-center"
              >
                发送
              </button>
            ) : (
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-gray-800 bg-white hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
