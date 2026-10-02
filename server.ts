import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const corsOrigins = new Set([
  'https://localhost',
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  const isAllowedOrigin = origin !== undefined && corsOrigins.has(origin);

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(origin && !isAllowedOrigin ? 403 : 204);
  }

  next();
});

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client with required User-Agent
const apiKey = process.env.GEMINI_API_KEY?.trim();
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== 'YOUR_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn(
    'GEMINI_API_KEY is missing or still a placeholder. AI responses will use the fallback responder until a valid key is configured in .env.local.'
  );
}

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    ),
  ]);
}

async function callGeminiWithRetry<T>(
  operation: () => Promise<T>,
  retries = 2,
  delayMs = 800
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      const isRetryable =
        error?.status === 503 ||
        error?.code === 503 ||
        /UNAVAILABLE|temporar|rate limit|429|high demand/i.test(String(error?.message || ''));

      if (isRetryable && attempt < retries) {
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw error;
    }
  }
}

// Fallback response generator if API key is not present or API call fails
function getFallbackChatReply(
  message: string,
  action: string | undefined,
  subject: string,
  learningStyle: string,
  language: string,
  studentName: string
) {
  const isHindi = language === 'hi';
  const isSpanish = language === 'es';
  const isFrench = language === 'fr';

  const name = studentName || 'friend';

  if (action === 'hint') {
    if (isHindi) {
      return `💡 **छोटा सा संकेत:** इस सवाल के पहले हिस्से को ध्यान से देखो। क्या तुम इसे दो आसान टुकड़ों में बाँट सकते हो?\n\nक्या तुम मुझे बता सकते हो कि तुम्हारा पहला कदम क्या होगा?`;
    }
    if (isSpanish) {
      return `💡 **Una pequeña pista:** Mira de cerca la primera parte del problema. ¿Puedes dividirlo en dos partes más sencillas?\n\n¿Cuál crees que sería el primer paso?`;
    }
    if (isFrench) {
      return `💡 **Un petit indice :** Regarde bien la première étape. Peux-tu décomposer le problème en deux parties simples ?\n\nQuelle serait ta toute première idée ?`;
    }
    return `💡 **Gentle Hint for ${name}:** Take a close look at the first piece of the problem. Can we break it into two smaller chunks?\n\nWhat do you notice first when you look at it?`;
  }

  if (action === 'example') {
    if (isHindi) {
      return `🔍 **एक उदाहरण से समझते हैं:**\nमान लो तुम्हारे पास 6 सेब हैं और तुम्हें उन्हें 2 दोस्तों में बराबर बाँटना है। प्रत्येक को 3 सेब मिलेंगे (6 ÷ 2 = 3)!\n\nअब अपने सवाल पर आओ: क्या तुम इसी तरीके से इसे आज़मा सकते हो?`;
    }
    if (isSpanish) {
      return `🔍 **Veamos un ejemplo parecido:**\nImagina que tienes 6 manzanas y quieres compartirlas con 2 amigos. Cada uno recibe 3 manzanas (6 ÷ 2 = 3).\n\nAhora inténtalo con tu propio problema: ¿cómo aplicarías esta misma idea?`;
    }
    if (isFrench) {
      return `🔍 **Regardons un exemple similaire :**\nImagine que tu as 6 pommes et 2 amis. Chacun en reçoit 3 (6 ÷ 2 = 3).\n\nMaintenant, applique cette même logique à ta question : qu'obtiens-tu ?`;
    }
    return `🔍 **Here is a quick parallel example:**\nImagine you have 6 apples and want to share them equally between 2 friends. Each friend gets 3 (6 ÷ 2 = 3)!\n\nNow, look back at your question: how can we use that same idea here?`;
  }

  if (action === 'another_way') {
    if (isHindi) {
      return `🔄 **एक और नज़रिए से देखते हैं:**\nअगर संख्याओं से समझना मुश्किल लग रहा है, तो एक चित्र की कल्पना करो! एक वृत्त बनाओ और उसे बराबर भागों में बाँटो।\n\nक्या अब यह थोड़ा और साफ़ लग रहा है?`;
    }
    if (isSpanish) {
      return `🔄 **Probemos de otra manera:**\nSi los números parecen confusos, ¡imagina un dibujo! Dibuja una línea de tiempo o círculos divididos en partes iguales.\n\n¿Te ayuda a ver la conexión con más claridad?`;
    }
    if (isFrench) {
      return `🔄 **Essayons autrement :**\nSi la formule semble abstraite, imagine un schéma visuel ou une pizza découpée en parts égales !\n\nEst-ce que cela rend l'idée plus évidente ?`;
    }
    return `🔄 **Let's try a different angle:**\nInstead of just numbers, picture it like building blocks or slices of a fresh pizza.\n\nDoes visualizing the pieces make the next step click?`;
  }

  if (action === 'got_it') {
    if (isHindi) {
      return `🎉 **शाबाश ${name}! बहुत बढ़िया!** तुमने खुद अपनी सोच से इसे समझा!\n\nक्या तुम 2 छोटे सवालों वाली **Mini Check** के लिए तैयार हो ताकि यह कॉन्सेप्ट हमेशा याद रहे?`;
    }
    if (isSpanish) {
      return `🎉 **¡Genial, ${name}! ¡Excelente trabajo!** Has llegado a la respuesta pensando por ti mismo.\n\n¿Listo para un **Mini Check** de 2 preguntas rápidas para celebrar lo aprendido?`;
    }
    if (isFrench) {
      return `🎉 **Bravo ${name} ! Super travail !** Tu as trouvé la solution en réfléchissant par toi-même.\n\nEs-tu prêt pour un rapide **Mini Check** de 2 questions pour valider tout ça ?`;
    }
    return `🎉 **Awesome work, ${name}! You totally nailed it!** Thinking it through yourself is the best way to learn.\n\nAre you ready for a quick 2-question **Mini Check** to show off what you learned?`;
  }

  // General initial reply tailored to style
  let styleHint = '';
  if (learningStyle === 'visual') {
    styleHint = isHindi
      ? `🎨 **चित्र बनाकर सोचें:** अपने दिमाग में एक बड़ा बोर्ड सोचो जहाँ हम इसे रंगों में बाँट सकते हैं।`
      : isSpanish
      ? `🎨 **Imaginémoslo visualmente:** Visualiza una pizarra con dos columnas de colores.`
      : isFrench
      ? `🎨 **Visualisons ensemble :** Imagine un tableau coloré avec deux colonnes.`
      : `🎨 **Visual clue:** Picture a bright drawing where each part has its own color and place.`;
  } else if (learningStyle === 'story') {
    styleHint = isHindi
      ? `📖 **एक छोटी सी कहानी:** मान लो एक खोजी वैज्ञानिक एक नया रहस्य सुलझा रहा है...`
      : isSpanish
      ? `📖 **Una pequeña historia:** Imagina a un explorador espacial que necesita equilibrar su nave...`
      : isFrench
      ? `📖 **Une petite histoire :** Imagine un astronaute qui doit équilibrer sa fusée...`
      : `📖 **Story moment:** Imagine an adventurous detective who finds an intriguing clue on a treasure map...`;
  } else {
    styleHint = isHindi
      ? `🔢 **कदम दर कदम:**\n1. सबसे पहले हम मुख्य बिंदु को पहचानते हैं।\n2. फिर हम इसे सरल बनाते हैं।`
      : isSpanish
      ? `🔢 **Paso a paso:**\n1. Primero identificamos el dato principal.\n2. Luego vemos qué relación tiene con la pregunta.`
      : isFrench
      ? `🔢 **Étape par étape :**\n1. D'abord, repérons l'information clé.\n2. Ensuite, voyons ce qui est demandé.`
      : `🔢 **Step by step:**\nStep 1: Spot the main clue given to us.\nStep 2: Think about what it is asking us to find.`;
  }

  const promptQuestion = isHindi
    ? `\n\nतुम्हारा क्या सोचना है? पहले तुम क्या करोगे?`
    : isSpanish
    ? `\n\n¿Qué opinas tú? ¿Qué harías en el primer paso?`
    : isFrench
    ? `\n\nQu'en penses-tu ? Par quoi commencerais-tu ?`
    : `\n\nWhat do you think? What would you try as the very first step?`;

  return `${styleHint}\n\n${promptQuestion}`;
}

// POST /api/study/chat
app.post('/api/study/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      action,
      subject = 'General',
      learningStyle = 'visual',
      language = 'en',
      studentName = 'Learner',
      history = [],
    } = req.body;

    const styleName =
      learningStyle === 'visual'
        ? 'See it (Visual diagrams, spatial imagery, mental sketches)'
        : learningStyle === 'story'
        ? 'Story (Engaging real-world narratives, analogies, friendly scenarios)'
        : 'Step by step (Clear numbered mini-checkpoints, bite-sized deduction)';

    const langName =
      language === 'hi'
        ? 'Hindi (हिन्दी) - Use warm, simple Hindi with Devanagari script'
        : language === 'es'
        ? 'Spanish (Español) - Clear, student-friendly Spanish'
        : language === 'fr'
        ? 'French (Français) - Friendly and encouraging French'
        : 'English - Simple, enthusiastic and clear';

    const systemInstruction = `You are "Google Study Buddy", an encouraging, patient, and pedagogical learning companion for school students.
Target student: ${studentName}.
Subject: ${subject}.
Selected Learning Style: ${styleName}.
Output Language: ${langName}.

Core Pedagogical Philosophy (Socratic Method):
1. NEVER give away the direct answer or write out the complete final homework solution immediately!
2. Give a warm, gentle hint or intuitive breakdown matching their learning style (${styleName}).
3. Always ask ONE targeted guiding question back to prompt the student to think for themselves.
4. Keep the reply concise (2 to 4 short paragraphs or bullet points maximum) so it is delightful and not overwhelming for a student.

Handling Quick Button Actions:
- If action is "hint": Give a bite-sized clue or rule-of-thumb without solving it.
- If action is "example": Give a parallel toy example with different values/settings and walk through how that one was solved.
- If action is "another_way": Change the explanation angle completely (e.g. switch from formula to a visual analogy or hands-on metaphor).
- If action is "got_it": Give exuberant praise ("Awesome job, ${studentName}!"), celebrate their insight, and ask if they are ready for a quick 2-question Mini Check.

Tone: Warm, enthusiastic, Google-clean, positive, empowering, student-safe.`;

    if (aiClient) {
      try {
        let userPrompt = message;
        if (action === 'hint') {
          userPrompt = `Please give me a small hint for my question without giving away the full answer.`;
        } else if (action === 'example') {
          userPrompt = `Can you show me a simple example of this concept with different numbers or a toy scenario?`;
        } else if (action === 'another_way') {
          userPrompt = `Can you explain this in another way? Try a different perspective or metaphor.`;
        } else if (action === 'got_it') {
          userPrompt = `I got it! I understand now.`;
        }

        // Construct history parts if available
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-6);
          for (const item of recentHistory) {
            contents.push({
              role: item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: userPrompt }],
        });

        const response = await withTimeout(
          callGeminiWithRetry(() =>
            aiClient!.models.generateContent({
              model: MODEL_NAME,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
                topP: 0.95,
              },
            })
          ),
          12000
        );

        const replyText = response.text || '';
        return res.json({ reply: replyText, source: 'gemini' });
      } catch (geminiError: any) {
        console.error('Gemini API call failed, falling back to smart responder:', geminiError?.message);
      }
    }

    // Fallback if no API key or call error
    const fallback = getFallbackChatReply(
      message,
      action,
      subject,
      learningStyle,
      language,
      studentName
    );
    return res.json({ reply: fallback, source: 'fallback' });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// POST /api/study/mini-check
app.post('/api/study/mini-check', async (req: Request, res: Response) => {
  try {
    const {
      subject = 'Maths',
      topic = 'Fractions & Ratios',
      learningStyle = 'visual',
      language = 'en',
      studentName = 'Learner',
      difficultyLevel = 'medium',
    } = req.body;

    const langName =
      language === 'hi' ? 'Hindi (हिन्दी)' : language === 'es' ? 'Spanish (Español)' : language === 'fr' ? 'French' : 'English';

    const systemInstruction = `You generate an interactive adaptive Mini Check for school students.
Student: ${studentName}
Subject: ${subject}
Topic: ${topic}
Learning Style: ${learningStyle}
Language: ${langName}
Difficulty: ${difficultyLevel}

Provide 2 or 3 quick, fun multiple-choice questions to verify understanding.
Rules:
- Questions must be encouraging and clear.
- Feedback for correct answer should be warm and positive ("Nice! Let's try one more.", "You nailed it! ⭐").
- Feedback for incorrect should be supportive and give a gentle pointer.
- Include a 'visualOrStoryClue' for each question reflecting the learning style.
- Output strictly valid JSON matching this schema:
{
  "title": string,
  "topic": string,
  "questions": [
    {
      "id": string,
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number (0 to 3),
      "clue": string,
      "correctFeedback": string,
      "incorrectFeedback": string
    }
  ]
}`;

    if (aiClient) {
      try {
        const response = await withTimeout(
          callGeminiWithRetry(() =>
            aiClient!.models.generateContent({
              model: MODEL_NAME,
              contents: `Generate a 2-question Mini Check on "${topic}" in ${subject} for student ${studentName}. Return strictly valid JSON.`,
              config: {
                systemInstruction,
                responseMimeType: 'application/json',
              },
            })
          ),
          12000
        );

        const text = response.text?.trim() || '{}';
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (geminiError: any) {
        console.error('Gemini mini-check generation error, using fallback:', geminiError?.message);
      }
    }

    // Adaptive fallback questions based on subject & language
    const fallbackQuizzes: Record<string, any> = {
      Maths: {
        en: {
          title: 'Maths Quick Check',
          topic: topic || 'Fractions & Proportions',
          questions: [
            {
              id: 'q1',
              question: 'If a pizza has 8 equal slices and you share 4 with a buddy, what fraction did you share?',
              options: ['1/4 of the pizza', '1/2 of the pizza', '3/4 of the pizza', '1/8 of the pizza'],
              correctIndex: 1,
              clue: 'Think of 4 slices out of 8: 4 is exactly half of 8!',
              correctFeedback: "Nice! Let's try one more.",
              incorrectFeedback: "Almost! Think about dividing 8 into 2 equal piles of 4.",
            },
            {
              id: 'q2',
              question: 'Which of the following fractions is equivalent to 2/3?',
              options: ['4/6', '3/4', '2/6', '4/9'],
              correctIndex: 0,
              clue: 'Multiply both top and bottom numbers by 2!',
              correctFeedback: "Fantastic! You've mastered this concept! 🌟",
              incorrectFeedback: 'Try multiplying both numerator and denominator by the same number.',
            },
          ],
        },
        hi: {
          title: 'गणित मिनी चेक',
          topic: topic || 'भिन्न (Fractions)',
          questions: [
            {
              id: 'q1',
              question: 'यदि एक रोटी के 4 बराबर टुकड़े किए जाएं और आप 2 टुकड़े खा लें, तो आपने कितना हिस्सा खाया?',
              options: ['1/4 हिस्सा', '1/2 (आधा) हिस्सा', '3/4 हिस्सा', 'पूरा हिस्सा'],
              correctIndex: 1,
              clue: '4 में से 2 टुकड़े यानी ठीक आधा!',
              correctFeedback: 'शाबाश! चलो एक और सवाल आज़माते हैं।',
              incorrectFeedback: 'लगभग सही! 4 में से 2 का मतलब आधा होता है।',
            },
            {
              id: 'q2',
              question: 'भिन्न 1/3 के बराबर कौन सी भिन्न है?',
              options: ['2/6', '2/4', '3/6', '1/6'],
              correctIndex: 0,
              clue: 'ऊपर और नीचे दोनों संख्याओं को 2 से गुणा करें!',
              correctFeedback: 'बहुत बढ़िया! तुमने यह कॉन्सेप्ट पूरी तरह समझ लिया! 🌟',
              incorrectFeedback: 'अंश और हर दोनों को एक ही संख्या से गुणा करके देखें।',
            },
          ],
        },
      },
      Science: {
        en: {
          title: 'Science Discovery Check',
          topic: topic || 'Plants & Photosynthesis',
          questions: [
            {
              id: 'q1',
              question: 'What primary gas do green plants absorb from the air to make their food?',
              options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'],
              correctIndex: 1,
              clue: 'Humans breathe it out, and green leaves welcome it in!',
              correctFeedback: "Nice! Let's try one more.",
              incorrectFeedback: 'Think about what plants take in during the day to create sugar and oxygen.',
            },
            {
              id: 'q2',
              question: 'Which part of the plant cell captures sunlight for photosynthesis?',
              options: ['Chloroplast', 'Cell Wall', 'Nucleus', 'Vacuole'],
              correctIndex: 0,
              clue: 'It contains the green pigment named chlorophyll!',
              correctFeedback: 'Brilliant thinking! You are a science champion! 🌿',
              incorrectFeedback: 'Look for the organelle that has green chlorophyll inside it.',
            },
          ],
        },
        hi: {
          title: 'विज्ञान मिनी चेक',
          topic: topic || 'पौधे और प्रकाश संश्लेषण',
          questions: [
            {
              id: 'q1',
              question: 'हरे पौधे अपना भोजन बनाने के लिए हवा से कौन सी गैस लेते हैं?',
              options: ['ऑक्सीजन', 'कार्बन डाइऑक्साइड', 'नाइट्रोजन', 'हीलियम'],
              correctIndex: 1,
              clue: 'जो गैस हम सांस छोड़ते समय निकालते हैं, पौधे वही लेते हैं!',
              correctFeedback: 'शाबाश! चलो एक और सवाल आज़माते हैं।',
              incorrectFeedback: 'सोचिए, दिन के समय पौधे कौन सी गैस सोखते हैं।',
            },
            {
              id: 'q2',
              question: 'पौधों की पत्तियों का हरा रंग किस वर्णक (Pigment) के कारण होता है?',
              options: ['क्लोरोफिल (हरितलवक)', 'कैरोटीन', 'हीमोग्लोबिन', 'मेलेनिन'],
              correctIndex: 0,
              clue: 'यह धूप की ऊर्जा को सोखने में मदद करता है!',
              correctFeedback: 'अद्भुत! विज्ञान के इस विषय पर आपकी पकड़ पक्की हो गई! 🌿',
              incorrectFeedback: 'यह क्लोरोप्लास्ट में पाया जाने वाला हरा रंग है।',
            },
          ],
        },
      },
    };

    const subjFallback = fallbackQuizzes[subject] || fallbackQuizzes.Maths;
    const finalFallback = subjFallback[language] || subjFallback.en;
    return res.json(finalFallback);
  } catch (err: any) {
    console.error('Mini check error:', err);
    return res.status(500).json({ error: 'Failed to generate mini check' });
  }
});

// Serve frontend with Vite middlewares in dev, or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const startOnPort = (port: number) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Google Study Buddy server running on http://0.0.0.0:${port}`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        const fallbackPort = port + 1;
        console.warn(`Port ${port} is already in use. Retrying on ${fallbackPort}...`);
        startOnPort(fallbackPort);
        return;
      }

      console.error('Server error:', err);
      process.exit(1);
    });
  };

  startOnPort(PORT);
}

startServer();
