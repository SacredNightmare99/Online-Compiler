import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    console.log("=== AI Chat API Called ===");

    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "Groq API key not configured. Set GROQ_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const { messages, currentCode, currentLanguage } = await request.json();
    console.log("Request received with language:", currentLanguage);

    // Format messages for Groq
    const formattedMessages: Message[] = [
      {
        role: "user",
        content: `You are a helpful coding assistant. The user is working on a ${currentLanguage} project. Here is their current code:\n\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\`\n\nBe concise and helpful. If you suggest code, wrap it in a code block with the language specified.`,
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    console.log("Sending request to Groq API (openai/gpt-oss-120b)");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log("Groq API Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error response:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return NextResponse.json(
        {
          error: errorData.error?.message || `Groq API error: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.choices?.[0]?.message?.content || "No response received";

    console.log("✅ Successfully got response from Groq");

    return NextResponse.json({
      message: assistantMessage,
      usage: data.usage,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: errorMsg,
        type: error instanceof Error ? error.constructor.name : "Unknown",
      },
      { status: 500 }
    );
  }
}
