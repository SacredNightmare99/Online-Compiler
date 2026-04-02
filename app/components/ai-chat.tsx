"use client";

import { useState, useRef, useEffect } from "react";
import "@/app/styles/ai-chat.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeBlock?: {
    code: string;
    language: string;
  };
};

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  currentLanguage: string;
  onApplyCode: (code: string) => void;
}

export function AIChat({
  isOpen,
  onClose,
  currentCode,
  currentLanguage,
  onApplyCode,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractCodeBlock = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    if (match) {
      return {
        code: match[2].trim(),
        language: match[1] || currentLanguage,
        beforeCode: text.substring(0, match.index),
        afterCode: text.substring((match.index || 0) + match[0].length),
      };
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log("Sending request to AI API...", {
        hasCode: !!currentCode,
        language: currentLanguage,
      });

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          currentCode,
          currentLanguage,
        }),
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Successfully got response from API");

      const assistantContent = data.message || "No response";
      const codeBlock = extractCodeBlock(assistantContent);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: codeBlock
          ? codeBlock.beforeCode.trim() + " " + codeBlock.afterCode.trim()
          : assistantContent,
        codeBlock: codeBlock
          ? { code: codeBlock.code, language: codeBlock.language }
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("AI Chat Error (Full):", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ Error: ${errorMsg}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-overlay" onClick={onClose}>
      <div className="ai-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-chat-header">
          <h3>🤖 AI Assistant</h3>
          <button className="ai-chat-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.length === 0 && (
            <div className="ai-chat-welcome">
              <div className="ai-welcome-icon">✨</div>
              <h4>AI Coding Assistant</h4>
              <p>Ask me to help with your code, fix bugs, or explain concepts.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`ai-message ${msg.role}`}>
              <div className="ai-message-content">
                {msg.content && <p>{msg.content}</p>}

                {msg.codeBlock && (
                  <div className="ai-code-block">
                    <div className="ai-code-header">
                      <span className="ai-code-lang">{msg.codeBlock.language}</span>
                      <div className="ai-code-actions">
                        <button
                          className="ai-code-btn ai-copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.codeBlock!.code);
                          }}
                          title="Copy code"
                        >
                          📋 Copy
                        </button>
                        <button
                          className="ai-code-btn ai-apply-btn"
                          onClick={() => onApplyCode(msg.codeBlock!.code)}
                          title="Insert at cursor"
                        >
                          ✓ Apply
                        </button>
                      </div>
                    </div>
                    <pre>
                      <code>{msg.codeBlock.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-message assistant">
              <div className="ai-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me something..."
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="ai-send-btn"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
