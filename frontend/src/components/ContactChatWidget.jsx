"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";

const initialMessage = {
  role: "assistant",
  content: "Xin chào! Mình là trợ lý AI MyShop. Bạn muốn tìm sản phẩm hay cần hỗ trợ gì?",
};

const suggestedQuestions = [
  "Tư vấn điện thoại phù hợp",
  "Sản phẩm nào đang giảm giá?",
  "Cách kiểm tra đơn hàng?",
];

function ChatMark() {
  return (
    <span
      aria-hidden="true"
      className="relative block h-5 w-6 rounded-lg border-2 border-current after:absolute after:-bottom-1 after:left-1 after:h-2 after:w-2 after:rotate-[-35deg] after:border-b-2 after:border-l-2 after:border-current after:bg-teal-700"
    >
      <span className="absolute inset-0 flex items-center justify-center gap-0.5">
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
    </span>
  );
}

export default function ContactChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event) => {
      if (!widgetRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending, isOpen]);

  const sendMessage = async (messageText = input) => {
    const content = messageText.trim();
    if (!content || isSending) return;

    // The first assistant message is only the static greeting; Gemini expects
    // conversation history to begin with the user's first real message.
    const history = messages.slice(1).slice(-8).map(({ role, content: messageContent }) => ({
      role,
      content: messageContent,
    }));

    setMessages((current) => [...current, { role: "user", content }]);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await api.post("/chat", { message: content, history }, { timeout: 45000 });
      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.data?.reply || "Mình chưa có câu trả lời cho câu hỏi này." },
      ]);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Mình chưa thể trả lời lúc này. Bạn thử lại sau nhé.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div ref={widgetRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <section
          id="myshop-ai-chat-panel"
          aria-label="Trò chuyện với trợ lý AI MyShop"
          className="flex h-[min(38rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-center gap-3 bg-teal-700 px-4 py-3 text-white">
            <ChatMark />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">Trợ lý AI MyShop</h2>
              <p className="text-xs text-teal-100">Tư vấn sản phẩm và hỗ trợ mua sắm</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Đóng chat" className="rounded-lg px-2 py-1 text-lg leading-none text-teal-100 hover:bg-teal-600 hover:text-white">
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${message.role === "user" ? "rounded-br-md bg-teal-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"}`}>
                  {message.content}
                </p>
              </div>
            ))}

            {messages.length === 1 && !isSending && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestedQuestions.map((question) => (
                  <button key={question} type="button" onClick={() => sendMessage(question)} className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-teal-800 transition hover:bg-teal-50">
                    {question}
                  </button>
                ))}
              </div>
            )}

            {isSending && (
              <p className="w-fit rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-500">
                Trợ lý đang trả lời...
              </p>
            )}
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex shrink-0 items-end gap-2 border-t border-slate-200 bg-white p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              maxLength={1000}
              rows={1}
              aria-label="Tin nhắn gửi trợ lý AI"
              placeholder="Nhập câu hỏi của bạn..."
              className="max-h-24 min-h-10 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
            <button type="submit" disabled={isSending || !input.trim()} aria-label="Gửi tin nhắn" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              ➤
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        title="Chat với trợ lý AI MyShop"
        aria-label={isOpen ? "Đóng chat AI MyShop" : "Mở chat AI MyShop"}
        aria-controls="myshop-ai-chat-panel"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
      >
        <ChatMark />
      </button>
    </div>
  );
}
