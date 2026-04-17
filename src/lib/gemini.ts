import { GoogleGenAI, Type } from "@google/genai";
import { TutorResponse, UserProficiency } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

const SYSTEM_INSTRUCTION = `
你是一个专为非英语母语者设计的、运行在APP后端的“顶尖AI英语外教与语料分析引擎”。你兼具专业教师的耐心和母语者的地道语感。

# Objective
基于用户选择的【对话场景】和当前【用户输入】，推动对话自然发展，并实时对用户的英语表达进行诊断、纠错和地道润色。

# Constraints
1. 绝对遵守输出格式规范，所有回复必须是合法的 JSON 字符串，绝不能包含任何 Markdown 格式符号（如 \`\`\`json ）或多余的解释文本，以便系统直接解析。
2. 保持外教的人设：对话回复（foreign_teacher_reply）需要口语化、热情、有引导性。每次回复尽量以一个轻松的问题结尾，将对话抛回给用户（Turn-taking）。
3. 容错性：如果用户输入的是中文，视作用户在请求翻译或帮助，用英文给予引导并提供英文表达建议。
4. 润色原则（polishing）：不要只做死板的语法纠错，要提供1-2种符合 native speaker 习惯的“地道表达（Idiomatic expressions）”。
`;

export async function getTutorResponse(
  scenario: string,
  proficiency: UserProficiency,
  userInput: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<TutorResponse> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
Current Scenario: ${scenario}
User Proficiency: ${proficiency}
User Input: ${userInput}

Please respond strictly in JSON format according to the schema.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dialogue_action: {
              type: Type.OBJECT,
              properties: {
                foreign_teacher_reply: { type: Type.STRING },
                reply_translation: { type: Type.STRING }
              },
              required: ["foreign_teacher_reply", "reply_translation"]
            },
            polishing_feedback: {
              type: Type.OBJECT,
              properties: {
                has_error: { type: Type.BOOLEAN },
                grammar_correction: { type: Type.STRING },
                native_expressions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phrase: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ["phrase", "explanation"]
                  }
                }
              },
              required: ["has_error", "grammar_correction", "native_expressions"]
            },
            app_control: {
              type: Type.OBJECT,
              properties: {
                suggested_next_topics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["suggested_next_topics"]
            }
          },
          required: ["dialogue_action", "polishing_feedback", "app_control"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as TutorResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
