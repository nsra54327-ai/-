import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request body limits to handle uploaded base64 images/videos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared Gemini Client
let ai: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets/environment variables.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// API endpoint for analyzing images and generating commercial scripts
app.post("/api/analyze", async (req, res) => {
  try {
    const { images, notes, externalLink, adType, cinematicTheme } = req.body;

    const gemini = getGeminiClient();

    // Prepare content parts
    const parts: any[] = [];

    if (images && Array.isArray(images) && images.length > 0) {
      for (const imgItem of images) {
        if (typeof imgItem !== "string") continue;

        // If it's a remote URL, fetch and convert to base64 so Gemini SDK can process it
        if (imgItem.startsWith("http://") || imgItem.startsWith("https://")) {
          try {
            console.log(`Fetching remote image from URL: ${imgItem}`);
            const fetchResponse = await fetch(imgItem);
            if (!fetchResponse.ok) {
              throw new Error(`HTTP error! status: ${fetchResponse.status}`);
            }
            const arrayBuffer = await fetchResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Data = buffer.toString("base64");
            const contentType = fetchResponse.headers.get("content-type") || "image/png";

            parts.push({
              inlineData: {
                mimeType: contentType,
                data: base64Data
              }
            });
            console.log(`Successfully fetched and converted remote image of type ${contentType}`);
          } catch (fetchErr) {
            console.error(`Failed to fetch remote image: ${imgItem}`, fetchErr);
            // Graceful fallback: skip the failed image rather than crashing the entire call
          }
        } else {
          // It's already a base64 Data URL
          let mimeType = "image/png";
          let data = imgItem;
          const match = imgItem.match(/^data:(image\/\w+);base64,/);
          if (match) {
            mimeType = match[1];
            data = imgItem.replace(/^data:image\/\w+;base64,/, "");
          }
          parts.push({
            inlineData: {
              mimeType,
              data
            }
          });
        }
      }
    }

    // Build the instruction prompt
    const promptText = `
أريدك أن تعمل كأفضل مخرج سينمائي ومونتير وكاتب سيناريو إعلاني في العالم، ومحاكاة الأسلوب الفني والمونتاجي الفائق المستوحى من الروابط الإعلانية الاحترافية المرجعية على يوتيوب:
1. الرابط الأول (07Q510r50y8): أسلوب تصوير قهوة/سوائل سينمائي - يتميز بلقطات ماكرو فائقة المقربة، تصوير بطيء للبخار والقطرات، إضاءة غنية، وتأثيرات ASMR رطبة ومكثفة.
2. الرابط الثاني (bWF2AnQtyBs): أسلوب منتجات العناية والجمال الفخمة - يتميز بلقطات ناعمة ومحاذاة هندسية دقيقة (Match Cuts)، حركة أفقية بطيئة لعدسات تتبع المنتج، مؤثرات رش رقيقة وصوت بخاخات محيطي.
3. الرابط الثالث (-wNXboIhlSU): أسلوب الساعات والمجوهرات الفاخرة - يتميز بلقطات دوران محوري (Orbital rotation)، كونتراست عالٍ جداً مع إضاءة حافة (Rim Lighting) تبرز الأسطح المعدنية والزجاجية اللامعة، أصوات نقرات وتكات تروس ميكانيكية دقيقة في هندسة الصوت.
4. الرابط الرابع (WTQmcbTNu-k): أسلوب الحركة الديناميكية ورذاذ السوائل الانفجاري - يتميز بتلاعب بالسرعة (Speed Ramping) سريع-بطيء-سريع، تجميد حركة السائل في الهواء، ألوان مشبعة ونابضة بالحياة، وأصوات ارتطام وتدفق قوية ومثيرة للحماس.

يرجى تحليل الصور المرفقة للمنتج (باستخدام أقوى تقنيات الرؤية الحاسوبية) وتحديد شكله، طبيعته، وألوانه السائدة بدقة، وتطبيق توليفة إخراجية، ومونتاجية، وإضاءة وهندسة صوتية مخصصة لهذا المنتج بالتحديد تماثل تلك الروابط الفاخرة:
- إذا كان المنتج (قهوة أو سائل ساخن أو طعام): ركز على أسلوب الرابط الأول (ماكرو البخار والحرارة وانسكاب السوائل، صوت قرقعة وحفيف، إضاءة دافئة ودرجات ذهبية/بنية).
- إذا كان المنتج (عناية، تجميل، كريمات، أو عطور زجاجية): ركز على أسلوب الرابط الثاني (محاذاة ناعمة، انزلاق أفقي، رذاذ دقيق، إضاءة ناعمة وخلفيات باستيل أو متدرجة فاخرة، صوت رش وسحب غطاء).
- إذا كان المنتج (ساعة، إكسسوار معدني، جهاز تقني، أو نظارة): ركز على أسلوب الرابط الثالث (حركة دورانية، كونتراست غامق ومثير، إضاءة حافة حادة Rim Light تظهر انحناءات الهيكل، أصوات نقرات وتكات تروس دقيقة).
- إذا كان المنتج (مشروب غازي، رياضي، سائل نشط، أو يتطلب حيوية): ركز على أسلوب الرابط الرابع (تلاعب بالسرعة Speed Ramping، انشطار رذاذ وارتطام سوائل، إضاءة ساطعة وألوان قوية مشبعة، أصوات ووش هائلة وتدفق وارتطام مائي).

قم بتوليد خطة إعلانية مذهلة تتكون من 15 مشهداً سينمائياً، بالإضافة إلى استخراج وتوليد اسم تجاري أو فني مقترح وجذاب للمنتج باللغة العربية (مثل: عطر الأوركيد الشرقي الفاخر، أو قهوة الإمبراطور السوداء) في حقل (suggestedProductName) لاستخدامه كاسم للمشروع.
(كل مشهد مدته 5 ثوانٍ، باستثناء المشهد الأول "الهوك" الذي يمتد لـ 3 ثوانٍ فقط في رتم سريع جداً وخاطف للأنظار، والمشهد الأخير 15 لعرض المنتج بالكامل وشعار العلامة التجارية بدون أي كتابات أو نصوص مشوهة للمشهد).

يرجى الالتزام بالمعايير التالية بدقة متناهية:

نوع الإعلان المطلوب: ${adType === "cinematic" ? "إعلان سينمائي (Cinematic Commercial)" : "إعلان قصة درامية (Storytelling)"}
${adType === "cinematic" ? `
الخصائص المطلوبة في القسم السينمائي:
- إضاءة سينمائية خلابة (Cinematic Lighting) مثل إضاءة ريمبرانت، كياروسكورو، أو إضاءة خلفية دافئة.
- حركة كاميرا متطورة (Camera Motion) مثل كاميرات Arri Alexa و Red V-Raptor وعدسات هوليوود الفاخرة (Panavision Anamorphic).
- تمثيل احترافي وموسيقى تصويرية دقيقة وتدرج لوني ساحر (Color Grading).
- الطابع المختار للمشروع: ${cinematicTheme || "عام سينمائي"} (مثل أكشن، بوليسي، رومانسي، جيمس بوند، إلخ). استخدم هذا الطابع لتشكيل الألوان والأجواء الإعلانية.
- ثبات شكل الشخصيات والملابس والإكسسوارات واستمرارية الأحداث (Continuity) بين كافة المشاهد.
` : `
الخصائص المطلوبة في قسم القصة الدرامية:
- بناء قصة قصيرة متكاملة تحتوي على (بداية، عقدة، نهاية).
- إبراز مشاعر إنسانية دافئة ومؤثرة تلمس القلوب.
- جعل المنتج جزءاً محورياً طبيعياً داخل أحداث القصة.
- مناسب للماركات الكبيرة، المنتجات العائلية، الأغذية والمشروبات.
- mلامح الشخصيات يجب أن تكون ملامح عربية أو مصرية أصيلة واحترافية بدون أي أشكال فرعونية أو رسومات تاريخية، بل ملامح حقيقية معاصرة ومناسبة لبيئة وطبيعة ومكان المنتج.
`}

ملاحظات وتوجيهات المستخدم الإضافية للتنفيذ: "${notes || "لا توجد ملاحظات إضافية"}"
${externalLink ? `رابط الإلهام الخارجي المطلوب محاكاة طابعه الشكلي وأسلوبه البصري وحركته: "${externalLink}"` : "لا يوجد رابط خارجي مرفق"}

قاعدة ذهبية بالغة الأهمية (شرط إلزامي وصارم):
يمنع منعاً باتاً إدراج أو اقتراح أي موسيقى أو خلفية لحنية في أي مشهد من المشاهد الـ 15! بدلاً من ذلك، يجب الاقتصار والتركيز بالكامل على المؤثرات الصوتية الطبيعية والبيئية والفيزيائية الحقيقية (SFX & Ambient Sounds) التي تناسب طبيعة المشهد بدقة مستوحاة من هندسة الصوت الفائقة في الروابط المذكورة (مثل: صوت تدفق السوائل، صوت البخار المتصاعد، صوت فتح غطاء معدني ثقيل، حفيف أوراق الشجر، أو صوت احتكاك الزجاج على الرخام)، ويجب توضيح هذه المؤثرات في خانة الشرح ووصف الصوتيات لكل مشهد بدلاً من الموسيقى.

هيكل المشاهد الـ 15 بالتفصيل:
- المشهد الأول (المشهد 1 - الهوك): مدته 3 ثوانٍ فقط. لقطة هوك مجمعة سريعة جداً من زوايا متباينة تخطف العين وتثير الفضول.
- المشاهد من 2 إلى 14: مدة كل مشهد 5 ثوانٍ. تتبع التسلسل الدرامي أو السينمائي للإعلان بجمالية فائقة وتنتقل بسلاسة وتماثل أسلوب المونتاج المتناسق والإخراج الفني للروابط المرجعية.
- المشهد 15 (الختامي): مدته 5 ثوانٍ. عرض للمنتج كاملاً في لقطة جمالية فاخرة (Hero Shot) مع شعار العلامة التجارية (Logo) في منتصف الشاشة بدون أي كتابات أو نصوص أخرى.

يرجى صياغة المشاهد وتفاصيل البرومبت البصري لكل مشهد باللغة الإنجليزية في حقل (prompt) لتكون مناسبة تماماً للمحركات العالمية مثل Seedance 2.0 و Sora و Runway و Midjourney، وصياغة الحقول التوضيحية الأخرى وحقل شرح المشهد وجمالياته (arabicDescription) باللغة العربية بأسلوب راقٍ واحترافي يبرز جمالية المشهد والمنتج.

يرجى توليد النيجاتيف برومبت (negativePrompt) الموصى به لكل لقطة لضمان جودة استثنائية وثبات مذهل.
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        productAnalysis: {
          type: Type.OBJECT,
          properties: {
            suggestedProductName: { type: Type.STRING, description: "اسم تجاري أو فني مقترح ومختصر للمنتج باللغة العربية (مثل: عطر الياسمين الملكي، أو قهوة الإمبراطور الذهبية) بحد أقصى 5 كلمات" },
            visualDescription: { type: Type.STRING, description: "وصف بصرى دقيق للمنتج ومحتوياته باللغة العربية" },
            suggestedMood: { type: Type.STRING, description: "المزاج والطابع المقترح للإعلان باللغة العربية" },
            targetAudience: { type: Type.STRING, description: "الفئة المستهدفة المناسبة للمنتج والإعلان باللغة العربية" },
            egyptianArabContext: { type: Type.STRING, description: "توصيف دقيق للملامح والشخصيات والبيئة المناسبة للمنتج باللغة العربية" }
          },
          required: ["suggestedProductName", "visualDescription", "suggestedMood", "targetAudience", "egyptianArabContext"]
        },
        reversePrompt: {
          type: Type.OBJECT,
          properties: {
            elements: { type: Type.STRING, description: "عناصر المشهد المستخرجة بدقة باللغة العربية" },
            lighting: { type: Type.STRING, description: "تفاصيل الإضاءة والظلال السينمائية باللغة العربية" },
            lensAndCamera: { type: Type.STRING, description: "نوع العدسة والكاميرا والبعد البؤري المناسب باللغة العربية" },
            artStyle: { type: Type.STRING, description: "الأسلوب الفني والدرجات اللونية المقترحة باللغة العربية" }
          },
          required: ["elements", "lighting", "lensAndCamera", "artStyle"]
        },
        cameraMotion: { type: Type.STRING, description: "حركات الكاميرا وتوجيهات الانتقال المناسبة لإبراز المنتج باللغة العربية" },
        smartEnhancements: { type: Type.STRING, description: "اقتراحات إبداعية لتحسين البرومبت العام ورفع جودته بأسلوب هوليوود باللغة العربية" },
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER, description: "رقم المشهد من 1 إلى 15" },
              title: { type: Type.STRING, description: "عنوان فرعي معبر عن لقطة المشهد باللغة العربية" },
              duration: { type: Type.STRING, description: "مدة اللقطة (المشهد الأول 3 ثواني وباقي المشاهد 5 ثواني)" },
              prompt: { type: Type.STRING, description: "البرومبت البصري الاحترافي التفصيلي للمشهد باللغة الإنجليزية لنسخه واستخدامه مباشرة في مولدات الفيديو" },
              negativePrompt: { type: Type.STRING, description: "البرومبت السلبي لتلافي التشوهات والعيوب البصرية" },
              cameraMovement: { type: Type.STRING, description: "حركة الكاميرا الموصى بها في هذا المشهد باللغة العربية" },
              lightingStyle: { type: Type.STRING, description: "نمط الإضاءة واللون في هذا المشهد باللغة العربية" },
              arabicDescription: { type: Type.STRING, description: "شرح تفصيلي للمشهد باللغة العربية وجمالياته الفنية والسينمائية والدرامية وما يبرزه في المنتج" }
            },
            required: ["id", "title", "duration", "prompt", "negativePrompt", "cameraMovement", "lightingStyle", "arabicDescription"]
          }
        },
        customizedPlatforms: {
          type: Type.OBJECT,
          properties: {
            seedance: { type: Type.STRING, description: "البرومبت المخصص والمحسن لمنصة Seedance 2.0 باللغة الإنجليزية" },
            midjourney: { type: Type.STRING, description: "البرومبت المخصص والمحسن لمنصة Midjourney مع معاملات الجودة والأبعاد باللغة الإنجليزية" },
            sora: { type: Type.STRING, description: "البرومبت المخصص والمحسن لمنصة Sora مع حركة الكاميرا والامتداد الزمني باللغة الإنجليزية" },
            runway: { type: Type.STRING, description: "البرومبت المخصص والمحسن لمنصة Runway Gen-3 باللغة الإنجليزية" }
          },
          required: ["seedance", "midjourney", "sora", "runway"]
        }
      },
      required: ["productAnalysis", "reversePrompt", "cameraMotion", "smartEnhancements", "scenes", "customizedPlatforms"]
    };

    // Call Gemini with content parts and instructions, with a robust fallback chain to handle 503 errors (high demand)
    let response;
    let lastError: any = null;
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite"
    ];

    for (const modelName of modelsToTry) {
      let attempts = 2; // Try up to 2 times per model
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`Attempt ${attempt} using model: ${modelName}`);
          response = await gemini.models.generateContent({
            model: modelName,
            contents: [
              ...parts,
              { text: promptText }
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
              systemInstruction: `أنت مخرج ومونتير سينمائي عالمي محترف وخبير في صناعة الإعلانات الفاخرة بأسلوب هوليوود وأحدث كاميرات العالم (مثل Arri Alexa, Red V-Raptor) وبأقوى تقنيات الرؤية الحاسوبية.`
            }
          });
          
          if (response && response.text) {
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} (attempt ${attempt}/${attempts}) failed. Error code: ${err.status || err.code}. Message: ${err.message || err}`);
          lastError = err;
          // Wait 1.5 seconds before retrying or falling back
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
      if (response && response.text) {
        break;
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to generate content with any available model");
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini API");
    }

    const parsedResult = JSON.parse(resultText.trim());
    res.json(parsedResult);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ غير متوقع أثناء معالجة البيانات" });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
