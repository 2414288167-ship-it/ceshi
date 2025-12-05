"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChatSettingsPage({ params }: PageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>("");

  // 基础信息
  const [remarkName, setRemarkName] = useState("");
  const [aiName, setAiName] = useState("");
  const [myNickname, setMyNickname] = useState("我");
  const [contactAvatar, setContactAvatar] = useState("🐱");
  const [myAvatar, setMyAvatar] = useState("🐳");
  const [friendGroup, setFriendGroup] = useState("未分组");

  const groupOptions = [
    "特别关心",
    "同学",
    "朋友",
    "家人",
    "网友",
    "宠物",
    "未分组",
  ];

  // 角色设定
  const [aiPersona, setAiPersona] = useState("");
  const [worldBook, setWorldBook] = useState("default");

  // 逻辑与记忆
  const [bgActivity, setBgActivity] = useState(true);
  const [shortMem, setShortMem] = useState(30);
  const [longMem, setLongMem] = useState(10);

  // 环境与语音
  const [weatherSync, setWeatherSync] = useState(false);
  const [location, setLocation] = useState(""); // --- 新增：所在地区 ---
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceId, setVoiceId] = useState("minimax_voice_id");
  const [voiceLang, setVoiceLang] = useState("auto");

  // 模式设置
  const [asideMode, setAsideMode] = useState(false);
  const [todoSync, setTodoSync] = useState(false);
  const [descMode, setDescMode] = useState(false);
  const [timeSense, setTimeSense] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Shanghai");
  const [lyricsPos, setLyricsPos] = useState("top");

  const contactAvatarInputRef = useRef<HTMLInputElement>(null);
  const myAvatarInputRef = useRef<HTMLInputElement>(null);

  const timezoneOptions = [
    { value: "Asia/Shanghai", label: "中国 - 北京/上海 (UTC+8)" },
    { value: "Asia/Hong_Kong", label: "中国 - 香港 (UTC+8)" },
    { value: "Asia/Taipei", label: "中国 - 台北 (UTC+8)" },
    { value: "Asia/Tokyo", label: "日本 - 东京" },
    { value: "America/New_York", label: "美国 - 纽约" },
    { value: "America/Los_Angeles", label: "美国 - 洛杉矶" },
    { value: "Europe/London", label: "英国 - 伦敦" },
  ];

  // 初始化加载
  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);

      if (typeof window !== "undefined") {
        const contactsStr = localStorage.getItem("contacts");
        if (contactsStr) {
          const contacts = JSON.parse(contactsStr);
          const contact = contacts.find(
            (c: any) => String(c.id) === String(resolvedParams.id)
          );
          if (contact) {
            setRemarkName(contact.remark || "");
            setAiName(contact.name || "");
            setMyNickname(contact.myNickname || "我");
            setContactAvatar(contact.avatar || "🐱");
            if (contact.myAvatar) setMyAvatar(contact.myAvatar);
            setFriendGroup(contact.group || "未分组");
            setAiPersona(contact.aiPersona || "");

            // 读取设置
            if (contact.weatherSync !== undefined)
              setWeatherSync(contact.weatherSync);
            if (contact.location) setLocation(contact.location); // 读取地区
            if (contact.asideMode !== undefined)
              setAsideMode(contact.asideMode);
            if (contact.descMode !== undefined) setDescMode(contact.descMode);
            if (contact.timeSense !== undefined)
              setTimeSense(contact.timeSense);
            if (contact.timezone) setTimezone(contact.timezone);
          }
        }
      }
    })();
  }, [params]);

  const handleAvatarChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMyAvatar: boolean
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (isMyAvatar) setMyAvatar(base64);
        else setContactAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // 保存逻辑
  const handleSave = () => {
    if (typeof window !== "undefined") {
      const contactsStr = localStorage.getItem("contacts");
      if (contactsStr) {
        const contacts = JSON.parse(contactsStr);
        const updatedContacts = contacts.map((c: any) => {
          if (String(c.id) === String(id)) {
            return {
              ...c,
              remark: remarkName,
              name: aiName,
              myNickname: myNickname,
              avatar: contactAvatar,
              myAvatar: myAvatar,
              group: friendGroup,
              aiPersona: aiPersona,
              weatherSync,
              location, // 保存地区
              asideMode,
              descMode,
              timeSense,
              timezone,
            };
          }
          return c;
        });
        localStorage.setItem("contacts", JSON.stringify(updatedContacts));
        alert("设置已保存！");
        router.back();
      }
    }
  };

  // --- 辅助组件 ---
  const Section = ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <div className="mb-4">
      {title && <div className="px-4 py-2 text-xs text-gray-500">{title}</div>}
      <div className="bg-white px-4 py-1 rounded-xl overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );

  const SwitchItem = ({ label, desc, value, onChange }: any) => (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-none">
      <div className="flex flex-col">
        <span className="text-base text-gray-900">{label}</span>
        {desc && <span className="text-xs text-gray-400 mt-0.5">{desc}</span>}
      </div>
      <div
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
          value ? "bg-[#07c160]" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );

  const InputItem = ({
    label,
    value,
    onChange,
    type = "text",
    options = [],
    placeholder = "",
  }: any) => (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-none">
      <span className="text-base text-gray-900 flex-shrink-0">{label}</span>
      {type === "select" ? (
        <div className="flex items-center">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-gray-500 bg-transparent outline-none text-right dir-rtl appearance-none pr-1 max-w-[200px]"
          >
            {options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-right text-gray-900 outline-none bg-transparent w-40 placeholder-gray-400"
        />
      )}
    </div>
  );

  const BasicInputRow = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-none">
      <span className="text-base text-gray-900 font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-right text-gray-900 outline-none bg-transparent w-2/3"
      />
    </div>
  );

  const AvatarRow = ({ label, imgUrl, onTriggerUpload }: any) => (
    <div className="py-4 border-b border-gray-100 last:border-none">
      <div className="text-base text-gray-900 font-medium mb-3">{label}</div>
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
          {imgUrl?.startsWith("data:") || imgUrl?.startsWith("http") ? (
            <img src={imgUrl} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{imgUrl}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onTriggerUpload}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200 transition-colors"
          >
            更换
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200">
            图库
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200">
            挂件
          </button>
          {label === "我的头像" && (
            <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200">
              预设
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5] text-gray-900">
      <input
        type="file"
        ref={contactAvatarInputRef}
        hidden
        accept="image/*"
        onChange={(e) => handleAvatarChange(e, false)}
      />
      <input
        type="file"
        ref={myAvatarInputRef}
        hidden
        accept="image/*"
        onChange={(e) => handleAvatarChange(e, true)}
      />

      <header className="h-14 flex items-center justify-between px-2 bg-white border-b border-gray-200 sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-1 text-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium">聊天详情</h1>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-[#07c160] text-white text-sm rounded-md mr-2 active:opacity-80"
        >
          保存
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pt-4 pb-10 px-3">
        <Section>
          <BasicInputRow
            label="备注名 / 群名"
            value={remarkName}
            onChange={setRemarkName}
          />
          <BasicInputRow
            label="对方本名 (AI识别用)"
            value={aiName}
            onChange={setAiName}
          />
          <BasicInputRow
            label="我的昵称"
            value={myNickname}
            onChange={setMyNickname}
          />
          <AvatarRow
            label="对方头像"
            imgUrl={contactAvatar}
            onTriggerUpload={() => contactAvatarInputRef.current?.click()}
          />
          <AvatarRow
            label="我的头像"
            imgUrl={myAvatar}
            onTriggerUpload={() => myAvatarInputRef.current?.click()}
          />
          <div className="flex items-center justify-between py-4">
            <span className="text-base text-gray-900 font-medium">
              好友分组
            </span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={friendGroup}
                  onChange={(e) => setFriendGroup(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {groupOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="px-3 py-1.5 bg-gray-100 rounded-md text-sm text-gray-700 min-w-[80px] text-center flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <span>{friendGroup}</span>
                  <ChevronRight className="w-3 h-3 text-gray-400 rotate-90 ml-2" />
                </div>
              </div>
              <button className="p-1.5 bg-gray-100 rounded-md text-gray-500 hover:bg-gray-200">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Section>

        <Section title="角色设定">
          <div className="py-3">
            <div className="text-base text-gray-900 mb-2 font-medium">
              对方人设 (AI Persona)
            </div>
            <textarea
              value={aiPersona}
              onChange={(e) => setAiPersona(e.target.value)}
              placeholder="输入详细的角色设定..."
              className="w-full h-24 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 outline-none border border-gray-200 resize-none focus:border-green-500 transition-colors"
            />
          </div>
          <InputItem
            label="关联世界书"
            type="select"
            value={worldBook}
            onChange={setWorldBook}
            options={[
              { value: "default", label: "默认世界观" },
              { value: "cyberpunk", label: "赛博朋克" },
              { value: "magic", label: "魔法大陆" },
            ]}
          />
        </Section>

        <Section>
          <SwitchItem
            label="启用独立后台活动"
            desc="允许角色在后台主动发消息"
            value={bgActivity}
            onChange={setBgActivity}
          />
          <InputItem
            label="短期记忆条数"
            type="number"
            value={shortMem}
            onChange={setShortMem}
          />
          <InputItem
            label="挂载记忆条数"
            type="number"
            value={longMem}
            onChange={setLongMem}
          />
        </Section>

        {/* --- 环境与语音 (新增了所在地区输入框) --- */}
        <Section>
          <SwitchItem
            label="启用实时天气同步"
            value={weatherSync}
            onChange={setWeatherSync}
          />
          {weatherSync && (
            <InputItem
              label="所在地区 (城市)"
              value={location}
              onChange={setLocation}
              placeholder="例如: 上海"
            />
          )}
          <SwitchItem
            label="启用语音合成 (TTS)"
            value={ttsEnabled}
            onChange={setTtsEnabled}
          />
          {ttsEnabled && (
            <>
              <InputItem
                label="语音 ID"
                value={voiceId}
                onChange={setVoiceId}
              />
              <InputItem
                label="语音语言/方言"
                type="select"
                value={voiceLang}
                onChange={setVoiceLang}
                options={[
                  { value: "auto", label: "自动识别 (Auto)" },
                  { value: "zh", label: "中文" },
                  { value: "en", label: "English" },
                  { value: "jp", label: "日语" },
                ]}
              />
            </>
          )}
        </Section>

        <Section>
          <SwitchItem
            label="启用旁白模式"
            desc="AI每轮回复都会附带环境或心理描写"
            value={asideMode}
            onChange={setAsideMode}
          />
          <SwitchItem
            label="启用待办事项同步"
            desc="开启后，AI将读取【今日】及【未完成】"
            value={todoSync}
            onChange={setTodoSync}
          />
          <SwitchItem
            label="线下模式 (描写模式)"
            desc="AI将输出包含动作/心理的描写文本"
            value={descMode}
            onChange={setDescMode}
          />
          <SwitchItem
            label="时间感知"
            value={timeSense}
            onChange={setTimeSense}
          />
          <InputItem
            label="时区设置"
            type="select"
            value={timezone}
            onChange={setTimezone}
            options={timezoneOptions}
          />
        </Section>

        <Section title="效果预览">
          {/* 预览部分代码保持不变... */}
          <div className="py-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                {contactAvatar?.startsWith("data:") ||
                contactAvatar?.startsWith("http") ? (
                  <img
                    src={contactAvatar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl flex items-center justify-center h-full">
                    {contactAvatar}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 max-w-[70%]">
                <div className="text-[10px] text-gray-400">08:00</div>
                <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-sm shadow-sm relative">
                  {lyricsPos === "top" && (
                    <div className="text-[10px] text-gray-400 mb-1">
                      ♪ 歌词位置预览 ♪
                    </div>
                  )}
                  对方消息预览
                  {lyricsPos === "bottom" && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      ♪ 歌词位置预览 ♪
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-row-reverse">
              <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                {myAvatar?.startsWith("data:") ||
                myAvatar?.startsWith("http") ? (
                  <img src={myAvatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl flex items-center justify-center h-full">
                    {myAvatar}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 items-end max-w-[70%]">
                <div className="text-[10px] text-gray-400">08:00</div>
                <div className="bg-[#95ec69] p-2.5 rounded-lg text-sm shadow-sm text-black">
                  我的消息预览
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <InputItem
              label="歌词栏设置"
              type="select"
              value={lyricsPos}
              onChange={setLyricsPos}
              options={[
                { value: "top", label: "顶部" },
                { value: "bottom", label: "底部" },
                { value: "none", label: "不显示" },
              ]}
            />
          </div>
        </Section>

        {/* 数据管理保持不变 */}
        <div className="mb-8">
          <div className="bg-white px-4">
            <div className="py-3.5 border-b border-gray-100 flex justify-between items-center active:bg-gray-50 cursor-pointer">
              <span className="text-gray-900">导出聊天记录</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
            <div className="py-3.5 border-b border-gray-100 flex justify-between items-center active:bg-gray-50 cursor-pointer">
              <span className="text-gray-900">导入聊天记录</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
            <div className="py-3.5 flex justify-center items-center active:bg-gray-50 cursor-pointer text-red-600 font-medium">
              拉黑对方 / 移出群聊
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
