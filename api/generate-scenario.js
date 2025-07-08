// GoogleのAIライブラリをインポート
import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercelの環境変数からAPIキーを読み込む
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Vercelサーバーレス関数のエントリーポイント
export default async function handler(req, res) {
  // POSTリクエスト以外は拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { mainSubject, summary, targets, features, duration } = req.body;

    // AIモデルを選択
// 変更後
const MODEL_NAME = "gemini-2.0-flash";

    // AIへの指示書（プロンプト）を作成
    const prompt = `
あなたは、YouTubeやTikTok向けの短い動画シナリオを作成するプロの脚本家です。
以下の製品情報をもとに、視聴者の心に響く動画シナリオ案を3つ作成してください。

# 制約条件
- 動画の尺は${duration}分を想定してください。
- 各シナリオは、以下の3つの異なる型で作成してください：1. 問題解決型, 2. 比較検討型, 3. ストーリーテリング型
- 各シナリオには、魅力的な【タイトル案】と、具体的な【構成】（オープニング、本編、まとめ）を記述してください。
- 日本語で、自然かつプロフェッショナルな言葉遣いで記述してください。
- 全体を読みやすく整形してください。

# 製品情報
- **名前**: ${mainSubject}
- **概要**: ${summary}
- **ターゲット**: ${targets.join(', ')}
- **特徴**: 
  - ${features.join('\n  - ')}
`;

    // AIにリクエストを送信
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 成功したら結果をJSONで返す
    res.status(200).json({ text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AIとの通信中にエラーが発生しました。' });
  }
}