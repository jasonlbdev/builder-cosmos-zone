import { RequestHandler } from "express";

// Dynamic import AI clients to avoid startup errors without API keys
let openai: any = null;
let anthropic: any = null;

const getOpenAIClient = async (): Promise<any> => {
  if (!openai && process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import("openai")).default;
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } catch (error) {
      console.error("Failed to load OpenAI:", error);
      throw new Error("OpenAI package not available");
    }
  }
  if (!openai) {
    throw new Error("OpenAI client not available - API key missing");
  }
  return openai;
};

const getAnthropicClient = async (): Promise<any> => {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    } catch (error) {
      console.error("Failed to load Anthropic:", error);
      throw new Error("Anthropic package not available");
    }
  }
  if (!anthropic) {
    throw new Error("Anthropic client not available - API key missing");
  }
  return anthropic;
};

// Email categorization prompts
const EMAIL_CATEGORIZATION_PROMPT = `You are an expert email categorization AI. Analyze the given email and categorize it into one of these categories:

CATEGORIES:
- "To Respond": Emails that require a response from the user (questions, requests, important business communications)
- "Awaiting Reply": Emails where the user sent something and is waiting for a response
- "Important": Critical emails (invoices, deadlines, urgent matters, legal documents)
- "FYI": Informational emails that don't require action (newsletters, updates, notifications)
- "Marketing": Promotional emails, advertisements, sales pitches
- "Promotions": Deals, discounts, special offers

ANALYSIS CRITERIA:
1. Sender relationship (colleague, client, automated system, marketing)
2. Subject urgency keywords (urgent, deadline, ASAP, action required)
3. Content tone and intent (question, request, information, promotion)
4. Call-to-action presence (reply needed, click here, buy now)
5. Time sensitivity indicators

EMAIL TO ANALYZE:
From: {sender}
Subject: {subject}
Content: {content}

RESPOND WITH JSON:
{
  "category": "one of the categories above",
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation of why this category was chosen",
  "urgency": "low|medium|high",
  "suggestedActions": ["action1", "action2"],
  "keywords": ["relevant", "keywords", "found"]
}`;

const EMAIL_REPLY_PROMPT = `You are an expert email assistant. Generate a professional, contextually appropriate reply to the given email.

GUIDELINES:
- Match the tone of the original email (formal/informal)
- Be concise but complete
- Address all points raised in the original email
- Include appropriate greetings and closings
- Suggest specific next steps when relevant

ORIGINAL EMAIL:
From: {sender}
Subject: {subject}
Content: {originalContent}

USER CONTEXT: {userContext}

Generate a professional reply that addresses the email appropriately. Return ONLY the email content without subject line.`;

const SMART_SUMMARY_PROMPT = `You are an expert email summarization AI. Create a concise, actionable summary of the given email.

FOCUS ON:
- Key information and main points
- Action items or requests
- Important deadlines or dates  
- Next steps required
- People involved

EMAIL TO SUMMARIZE:
From: {sender}
Subject: {subject}
Content: {content}

Provide a clear, structured summary in 2-3 sentences that captures the essence and any required actions.`;

const CONVERSATION_SUMMARY_PROMPT = `You are an expert conversation analysis AI. Analyze this conversation thread and provide insights.

CONVERSATION:
{messages}

PROVIDE:
1. Brief summary of the conversation
2. Current status/outcome
3. Action items for each participant
4. Key decisions made
5. Next steps

Format as structured bullet points for easy scanning.`;

interface EmailAnalysisRequest {
  sender: string;
  subject: string;
  content: string;
  metadata?: {
    platform?: string;
    timestamp?: string;
    recipients?: string[];
    isReply?: boolean;
  };
}

interface ChatRequest {
  message: string;
  context?: any;
  conversation?: Array<{
    type: 'user' | 'assistant';
    content: string;
  }>;
}

// Helper function to choose AI provider
const getAIProvider = () => {
  // Prioritize OpenAI if available, fallback to Anthropic
  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  } else if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }
  return null;
};

async function callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const client = await getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("[AI] OpenAI API error:", error);
    throw error;
  }
}

async function callAnthropic(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const client = await getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0.1,
      system: systemPrompt || "You are a helpful AI assistant specialized in email management and analysis.",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : "";
  } catch (error) {
    console.error("[AI] Anthropic API error:", error);
    throw error;
  }
}

async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const provider = getAIProvider();
  
  if (!provider) {
    throw new Error("No AI API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY");
  }

  if (provider === 'openai') {
    return callOpenAI(prompt, systemPrompt);
  } else {
    return callAnthropic(prompt, systemPrompt);
  }
}

// API Endpoints

// AI EMAIL CATEGORIZATION REMOVED
// AI should only be used for: reply generation, summarization, and chat interface
// Email categorization is manual or rule-based only, not AI-powered

export const generateEmailReply: RequestHandler = async (req, res) => {
  try {
    const { sender, subject, originalContent, userContext = "Professional business context" } = req.body;

    if (!sender || !subject || !originalContent) {
      return res.status(400).json({
        error: "Missing required fields: sender, subject, originalContent"
      });
    }

    const prompt = EMAIL_REPLY_PROMPT
      .replace('{sender}', sender)
      .replace('{subject}', subject)
      .replace('{originalContent}', originalContent.substring(0, 1500))
      .replace('{userContext}', userContext);

    const aiResponse = await callAI(prompt);

    res.json({
      success: true,
      reply: aiResponse.trim(),
      metadata: {
        provider: getAIProvider(),
        originalLength: originalContent.length,
        replyLength: aiResponse.length,
        processingTime: Date.now(),
      }
    });
  } catch (error) {
    console.error("[AI] Reply generation failed:", error);
    
    // Provide better fallback if AI is unavailable
    let fallbackReply = "Thank you for your email. I'll review this and get back to you soon.";
    
    if (error.message.includes("API key missing") || error.message.includes("No AI API keys")) {
      // Generate a more contextual fallback based on subject
      if (subject.toLowerCase().includes("meeting")) {
        fallbackReply = "Thank you for the meeting request. I'll check my calendar and get back to you with my availability.";
      } else if (subject.toLowerCase().includes("urgent")) {
        fallbackReply = "I've received your urgent message and will prioritize reviewing it. I'll respond as soon as possible.";
      } else if (subject.toLowerCase().includes("question")) {
        fallbackReply = "Thank you for your question. I'll look into this and provide you with a detailed response shortly.";
      }
    }

    res.status(500).json({
      success: false,
      error: "AI reply generation failed",
      message: error.message,
      fallback: fallbackReply,
      note: "AI service unavailable - using template response"
    });
  }
};

export const summarizeEmail: RequestHandler = async (req, res) => {
  try {
    const { sender, subject, content }: EmailAnalysisRequest = req.body;

    if (!sender || !subject || !content) {
      return res.status(400).json({
        error: "Missing required fields: sender, subject, content"
      });
    }

    const prompt = SMART_SUMMARY_PROMPT
      .replace('{sender}', sender)
      .replace('{subject}', subject)
      .replace('{content}', content.substring(0, 2000));

    const aiResponse = await callAI(prompt);

    res.json({
      success: true,
      summary: aiResponse.trim(),
      metadata: {
        provider: getAIProvider(),
        originalLength: content.length,
        summaryLength: aiResponse.length,
        compressionRatio: (aiResponse.length / content.length).toFixed(2),
      }
    });
  } catch (error) {
    console.error("[AI] Email summarization failed:", error);
    res.status(500).json({
      success: false,
      error: "AI summarization failed",
      message: error.message,
      fallback: `Email from ${req.body.sender} regarding: ${req.body.subject}`
    });
  }
};

export const chatWithAI: RequestHandler = async (req, res) => {
  try {
    const { message, context, conversation = [] }: ChatRequest = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Missing required field: message"
      });
    }

    let prompt = message;
    let systemPrompt = "You are Dexter, an expert email management AI assistant. You help users manage their emails efficiently, categorize messages, generate replies, and provide insights about their communication patterns.";

    // Add context if provided
    if (context) {
      if (context.action === 'generateReply') {
        prompt = `Generate a professional reply to this email:
From: ${context.sender}
Subject: ${context.subject}
Content: ${context.content}

User's message: ${message}`;
      } else if (context.action === 'summarize') {
        prompt = `Summarize this email:
From: ${context.sender}
Subject: ${context.subject}
Content: ${context.content}

User's question: ${message}`;
      } else if (context.action === 'smartReply') {
        prompt = `Generate quick reply options for this conversation:
Platform: ${context.platform}
Last message: ${context.lastMessage}

User's input: ${message}`;
      } else if (context.action === 'summarizeChat') {
        prompt = `Analyze this conversation thread:
Platform: ${context.platform}
Messages: ${JSON.stringify(context.messages)}

User's question: ${message}`;
      }
    }

    // Add conversation history
    if (conversation.length > 0) {
      const conversationHistory = conversation.slice(-10).map(msg => 
        `${msg.type}: ${msg.content}`
      ).join('\n');
      
      prompt = `Previous conversation:\n${conversationHistory}\n\nCurrent message: ${prompt}`;
    }

    const aiResponse = await callAI(prompt, systemPrompt);

    res.json({
      success: true,
      content: aiResponse.trim(),
      suggestions: [
        "Show me urgent emails",
        "Categorize my recent emails", 
        "Generate reply templates",
        "Summarize today's emails"
      ],
      metadata: {
        provider: getAIProvider(),
        hasContext: !!context,
        conversationLength: conversation.length,
      }
    });
  } catch (error) {
    console.error("[AI] Chat failed:", error);
    res.status(500).json({
      success: false,
      error: "AI chat failed",
      message: error.message,
      fallback: "I'm having trouble processing your request right now. Please try again later."
    });
  }
};

export const getAIStatus: RequestHandler = (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const provider = getAIProvider();

  res.json({
    success: true,
    status: {
      available: !!(hasOpenAI || hasAnthropic),
      provider: provider,
      capabilities: {
        emailCategorization: false,  // AI does NOT categorize emails
        replyGeneration: true,
        summarization: true,
        chat: true,
      },
      models: {
        openai: hasOpenAI ? "gpt-4-turbo-preview" : null,
        anthropic: hasAnthropic ? "claude-3-sonnet-20240229" : null,
      },
    },
    setup: {
      openai: hasOpenAI ? "configured" : "missing OPENAI_API_KEY",
      anthropic: hasAnthropic ? "configured" : "missing ANTHROPIC_API_KEY",
    },
  });
};