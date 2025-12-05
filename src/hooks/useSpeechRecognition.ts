import { useState, useRef } from "react";

// 回调函数增加 duration 参数
export const useSpeechRecognition = (
  onResult?: (text: string, duration: number) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const isCancelledRef = useRef(false);
  // 记录开始时间
  const startTimeRef = useRef<number>(0);

  const startListening = async () => {
    setError(null);
    isCancelledRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (isCancelledRef.current) {
          console.log("录音已取消");
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // 计算时长 (秒)
        const duration =
          Math.round((Date.now() - startTimeRef.current) / 1000) || 1;

        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        if (audioBlob.size < 1000) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const formData = new FormData();
        formData.append("file", audioBlob);

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          // 将 文字 和 时长 一起返回
          if (data.text && onResult) {
            onResult(data.text, duration);
          }
        } catch (err: any) {
          console.error("转录失败", err);
          setError("转录失败");
        } finally {
          stream.getTracks().forEach((t) => t.stop());
        }
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now(); // 记录开始时间
      setIsListening(true);
    } catch (err: any) {
      console.error("麦克风启动失败:", err);
      setError("无法访问麦克风");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const abortListening = () => {
    if (mediaRecorderRef.current && isListening) {
      isCancelledRef.current = true;
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    startListening,
    stopListening,
    abortListening,
    error,
  };
};
