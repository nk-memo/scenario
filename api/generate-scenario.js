import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const MODEL_NAME = "gemini-2.5-pro";
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const { mainSubject, summary, targets, features, duration } = req.body;


    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192, 
    };


    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ];


    const prompt = `
あなたは、YouTubeやTikTok向けの短い動画シナリオを作成するプロの脚本家です。
以下の製品情報をもとに、視聴者の心に響く動画シナリオ案を「3つ」作成してください。

# 制約条件
- 動画の尺は${duration}分を想定してください。
- 各シナリオは、以下の3つの異なる型で作成してください：1. 問題解決型, 2. 比較検討型, 3. ストーリーテリング型
- 各シナリオには、魅力的な【タイトル案】と、具体的な【構成】（オープニング、本編、まとめ）を記述してください。
- 日本語で、自然かつプロフェッショナルな言葉遣いで記述してください。
- 全体を読みやすく整形してください。
- *ではなく 【】 や ◆、 - なども活用し読みやすいレイアウトで表示してください。
- **必ず3つのシナリオ案をすべて、最後まで完全に生成してください。**

# 製品情報
- **名前**: ${mainSubject}
- **概要**: ${summary}
- **ターゲット**: ${targets.join(', ')}
- **特徴**: 
  - ${features.join('\n  - ')}
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    
    const text = result.response.text();

    res.status(200).json({ text });

  } catch (error) {
    console.error("詳細なエラー:", error);
    res.status(500).json({ error: 'AIとの通信中にエラーが発生しました。詳細はサーバーログを確認してください。', details: error.message });
  }
}