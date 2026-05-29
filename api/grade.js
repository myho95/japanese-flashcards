// Vercel Serverless Function — Gemini AI grading for translation answers
// POST /api/grade
// Body: { direction: 'vn2jp'|'jp2vn', sourceText, userAnswer, referenceTranslation? }
// Returns: { score: 0-10, feedback: string } or { error }

export default async function handler(req, res) {
  // CORS for preview/branch deployments (vercel auto-adds same-origin headers)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) {} }
  const { direction, sourceText, userAnswer, referenceTranslation } = body || {};

  if (!direction || !sourceText || !userAnswer) {
    return res.status(400).json({ error: 'Missing fields: direction, sourceText, userAnswer' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY chưa được cấu hình trên Vercel.' });
  }

  let prompt;
  if (direction === 'vn2jp') {
    prompt = `Bạn là giáo viên tiếng Nhật chấm bài học sinh JLPT N5.

Câu nguồn (tiếng Việt): "${sourceText}"
Bản dịch tiếng Nhật của học sinh: "${userAnswer}"${referenceTranslation ? `\nBản dịch tham khảo: "${referenceTranslation}"` : ''}

Hãy chấm điểm 0-10 và đưa nhận xét NGẮN GỌN bằng tiếng Việt (2-3 câu).
Đánh giá: ngữ pháp, từ vựng, tự nhiên. Có nhiều cách dịch đúng — không bắt buộc giống bản tham khảo.
Nếu sai, nêu ngắn cách sửa.

Trả lời CHÍNH XÁC dạng JSON (chỉ JSON, không text khác):
{"score": <số 0-10>, "feedback": "<nhận xét tiếng Việt 2-3 câu>"}`;
  } else if (direction === 'jp2vn') {
    prompt = `Bạn là giáo viên tiếng Nhật chấm bài học sinh JLPT N5.

Câu nguồn (tiếng Nhật): "${sourceText}"
Bản dịch tiếng Việt của học sinh: "${userAnswer}"${referenceTranslation ? `\nBản dịch tham khảo: "${referenceTranslation}"` : ''}

Hãy chấm điểm 0-10 và đưa nhận xét NGẮN GỌN bằng tiếng Việt (2-3 câu).
Đánh giá: hiểu nghĩa đúng không, từ tiếng Việt tự nhiên không.
Có nhiều cách dịch đúng — không bắt buộc giống bản tham khảo.

Trả lời CHÍNH XÁC dạng JSON (chỉ JSON, không text khác):
{"score": <số 0-10>, "feedback": "<nhận xét tiếng Việt 2-3 câu>"}`;
  } else {
    return res.status(400).json({ error: "direction phải là 'vn2jp' hoặc 'jp2vn'" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(502).json({ error: `Gemini API error ${resp.status}: ${errText.slice(0, 200)}` });
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Fallback if not valid JSON
      parsed = { score: 5, feedback: text.slice(0, 300) || 'Không thể chấm điểm.' };
    }

    // Clamp score
    const score = Math.max(0, Math.min(10, Number(parsed.score) || 0));
    const feedback = String(parsed.feedback || '').slice(0, 800);

    return res.status(200).json({ score, feedback });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Grading failed' });
  }
}
