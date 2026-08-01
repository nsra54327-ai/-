import { SavedProject } from "./types";

export const defaultProject: SavedProject = {
  id: "default-perfume-01",
  projectName: "عطر الأوركيد الشرقي الفاخر",
  timestamp: "2026-06-25, 10:15 ص",
  notes: "إبراز الطابع العربي الأصيل والفخامة مع إضاءة دافئة ورماد ذهبي، وحركة كاميرا ناعمة وبطيئة تبرز تفاصيل زجاجة العطر الكريستالية الفاخرة.",
  adType: "cinematic",
  cinematicTheme: "بوليسي وأكشن غامض",
  images: [
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"
  ],
  result: {
    productAnalysis: {
      suggestedProductName: "عطر الأوركيد الشرقي الفاخر",
      visualDescription: "زجاجة عطر زجاجية كريستالية ثقيلة ذات خطوط هندسية حادة، تحوي سائلًا ذهبيًا متوهجًا يعكس الضوء، وغطاء نحاسي ثقيل منقوش بزخارف عربية هندسية معاصرة وموضوعة على سطح رخامي أسود داكن عاكس تتناثر عليه ذرات الرماد الذهبي.",
      suggestedMood: "غموض، فخامة مطلقة، جاذبية سينمائية راقية، هيبة بأسلوب أفلام جيمس بوند الغامضة ممزوجة بسحر الشرق الدافئ.",
      targetAudience: "رجال الأعمال، عشاق الروائح الشرقية الفاخرة، والباحثون عن التفرد والتميز في منطقة الشرق الأوسط والعالم.",
      egyptianArabContext: "بيئة قصر عربي عصري ذو طابع قاهري حديث في حي الزمالك العريق بإنارة ليلية دافئة تطل على النيل، الشخصيات بملامح مصرية وسيمة، يرتدون بدلات رسمية عصرية أنيقة للغاية وتظهر عليهم تعابير الثقة والوقار دون أي زخارف تاريخية فرعونية."
    },
    reversePrompt: {
      elements: "Luxury heavy crystal perfume bottle with golden liquid, brass cap, dark reflective marble, scattered gold dust, rich velvet textures.",
      lighting: "Rembrandt dramatic lighting, soft key light from the side, golden rim light highlighting the bottle contours, deep rich shadows.",
      lensAndCamera: "Arri Alexa Mini LF, Panavision C-Series Anamorphic Lenses, 50mm, shallow depth of field (f/1.8), smooth dolly tracks.",
      artStyle: "Hollywood neo-noir with teal and orange color grading, deep contrast, ultra-realistic textures, 8k resolution, cinematic atmosphere."
    },
    cameraMotion: "بطيئة، انسيابية، تقريب تدريجي (Push-in)، وحركات دورانية حول المنتج (Orbiting) بزوايا مائلة تبرز انعكاس الضوء على زوايا الزجاج الكريستالي.",
    smartEnhancements: "إضافة بخار رقيق متصاعد من الخلفية لإثارة شعور الغموض والجاذبية، مع زيادة معدل تباين الألوان لإبراز اللون الذهبي للسائل العطري ليصبح مشعًا كالذهب السائل.",
    scenes: [
      {
        id: 1,
        title: "الخطاف البصري السريع (The Hook)",
        duration: "3 ثواني",
        prompt: "Ultra-fast dynamic edit of high-speed macro shots. Close-up of gold liquid swirling inside crystal glass, heavy brass cap clicking onto a bottle, a mysterious handsome Arab man in a tailored dark suit looking up confidently. Arri Alexa 35, sharp camera pans, flashy anamorphic flares, cinematic dark navy and gold tone, 8k, extreme motion capture --ar 16:9",
        negativePrompt: "text, watermark, poor quality, distorted face, low resolution, cheap packaging, cartoon, plastic material, Pharaonic illustrations",
        cameraMovement: "قطعات مونتاج سريعة جداً (Jump Cuts) مع زوايا كاميرا متحركة ومائلة بشكل ديناميكي مذهل.",
        lightingStyle: "إضاءة سريعة متذبذبة مع ومضات ذهبية وزرقاء غامضة تعكس الفخامة والإثارة.",
        arabicDescription: "لقطة افتتاحية سريعة ومثيرة تجمع بين دوران السائل الذهبي وإغلاق الغطاء النحاسي لشد انتباه المشاهد فوراً."
      },
      {
        id: 2,
        title: "كشف الغموض (The Mystery)",
        duration: "5 ثواني",
        prompt: "A moody luxury penthouse bedroom at dusk in Zamalek Cairo. Warm soft golden light shining from the window. A handsome Egyptian detective in a sharp black suit stands looking out at the city, holding a premium heavy glass perfume bottle. Cinematic atmosphere, high contrast, anamorphic lens, shallow depth of field --ar 16:9",
        negativePrompt: "monochrome, cheap suit, smiling, bad lighting, blurry background, pharaonic drawings",
        cameraMovement: "حركة رافعة ناعمة (Jib shot) تتحرك من الأسفل للأعلى لتكشف عن الشخصية والمنتج.",
        lightingStyle: "إضاءة غروب الشمس الدافئة ممتزجة بالظل الأزرق البارد في الغرفة (Teal & Orange).",
        arabicDescription: "المحقق المصري بملامح شرقية وسيمة يقف في شقته المطلة على نيل القاهرة، ممسكاً بزجاجة العطر الغامضة."
      },
      {
        id: 3,
        title: "الاقتراب من العطر (The Object of Desire)",
        duration: "5 ثواني",
        prompt: "Macro close-up shot of the perfume bottle resting on a black polished marble table. Golden dust particles floating elegantly around the bottle. The brass cap has detailed Arabic geometric engravings. Extreme details, ray tracing, gorgeous light refraction through the liquid --ar 16:9",
        negativePrompt: "dusty, scratched glass, plastic cap, low details, out of focus",
        cameraMovement: "تقريب بطيء جداً وثابت (Slow Push-in) نحو تفاصيل شعار الزجاجة.",
        lightingStyle: "إضاءة جانبية ضيقة (Chiaroscuro) تركز بدقة على تفاصيل الكريستال والغطاء النحاسي.",
        arabicDescription: "تركيز دقيق على زجاجة العطر الكريستالية الثقيلة الموضوعة على سطح رخامي عاكس مع ذرات الرماد الذهبي."
      },
      {
        id: 4,
        title: "الاتصال الحسي (The Touch)",
        duration: "5 ثواني",
        prompt: "A close-up of a well-groomed Egyptian man's hand with a modern silver watch gently lifting the heavy crystal bottle from the marble surface. Small ripples in the golden perfume liquid. Photorealistic, volumetric lighting, rich color depth --ar 16:9",
        negativePrompt: "rough hand, dirty nails, cheap watch, shaky camera",
        cameraMovement: "متابعة كاميرا انسيابية باليد (Handheld steadycam) تحاكي وزن الزجاجة الثقيلة.",
        lightingStyle: "إضاءة خلفية ناعمة (Backlight) تبرز حواف اليد وسرعة حركة الأصابع الفاخرة.",
        arabicDescription: "لقطة مقربة تظهر يد الرجل الفاخرة وهي ترفع الزجاجة برفق، تظهر ثقة الشخصية وهيبتها وتجذب الحواس."
      },
      {
        id: 5,
        title: "رذاذ الفخامة (The Spray)",
        duration: "5 ثواني",
        prompt: "Super slow motion 1000fps shot. The spray nozzle dispersing a fine golden mist into the air. Each micro-droplet reflects the warm key light like tiny stars. Rich dark blue background with volumetric smoke --ar 16:9",
        negativePrompt: "water drops, rain, heavy fog, white background, flat lighting",
        cameraMovement: "كاميرا ثابتة تماماً مع تركيز فائق الدقة (Macro static focus) على فتحة البخاخ ورذاذ العطر المتطاير.",
        lightingStyle: "إضاءة حادة مركزة (Spotlight) بزاوية 90 درجة لإضاءة جزيئات الرذاذ الطائرة.",
        arabicDescription: "رذاذ العطر يتناثر في الهواء ببطء شديد وتناغم تام، حيث تعكس كل قطرة الضوء الذهبي كأنها نجمة صغيرة."
      },
      {
        id: 6,
        title: "الجاذبية والأناقة (Aroma Impact)",
        duration: "5 ثواني",
        prompt: "The handsome Arab man wearing a black tuxedo closes his eyes for a split second, inhaling the premium aroma with a subtle expression of ultimate satisfaction and power. High-end modern Arabic mansion interior, soft defocus --ar 16:9",
        negativePrompt: "goofy face, laughing, casual clothes, messy hair, low contrast",
        cameraMovement: "دوران دائري بطيء (Orbit shot) حول وجه الشخصية لإبراز ملامحه الشرقية وتعبيره المتزن.",
        lightingStyle: "إضاءة ريمبرانت كلاسيكية تبرز تفاصيل الوجه وعظام الفك بهيبة سينمائية.",
        arabicDescription: "الشخصية تغلق عينيها للحظة مستمتعة برائحة العطر الفاخرة، ما يبرز قوة التأثير الحسي للمنتج."
      },
      {
        id: 7,
        title: "رحلة العطر في الفضاء (Spacial Diffusion)",
        duration: "5 ثواني",
        prompt: "Abstract cinematic visual representation of fragrance notes. Golden glowing lines and silk-like smoke weaving through a luxury dark room with mahogany wood panels. Volumetric rays of light, floating gold dust --ar 16:9",
        negativePrompt: "bright colors, neon green, cheap CGI, pixelated, cartoonish",
        cameraMovement: "حركة كاميرا طائرة انسيابية (Drone-like smooth glide) تخترق الضباب الذهبي.",
        lightingStyle: "إنارة سحرية غير مباشرة (Ambient glow) ممتزجة بأشعة شمس خفيفة من خلال النوافذ.",
        arabicDescription: "تجسيد بصري مجرد لانتشار مكونات العطر الذهبية في الهواء كخطوط حريرية دافئة تملأ المكان الفاخر."
      },
      {
        id: 8,
        title: "ثبات الشخصية والملابس (Character Continuity)",
        duration: "5 ثواني",
        prompt: "The Egyptian detective in the same black tailored suit steps out of his modern Cairo residence, adjusting his cufflinks. He exudes power and status. The Nile river visible in the far background under city lights --ar 16:9",
        negativePrompt: "different clothes, casual shirt, flat light, daylight, ancient pyramids",
        cameraMovement: "كاميرا تتبع خلفية (Tracking shot) تسير خلف الشخصية بوقار وثبات.",
        lightingStyle: "إضاءة المدينة الليلية الباردة تتداخل مع إضاءة البوابة الدافئة في توازن سينمائي بديع.",
        arabicDescription: "الشخصية تخرج من القصر ببدلة رسمية فاخرة لتأكيد استمرارية الأحداث والشخصية وثبات مظهرها الأنيق."
      },
      {
        id: 9,
        title: "الاستمرارية والحدث (The Mission)",
        duration: "5 ثواني",
        prompt: "The Egyptian man arrives at a luxury high-end event. He enters the hall, people turning their heads slightly, sensing the magnetic fragrance. Luxurious modern architecture, glass panels, warm ambient light --ar 16:9",
        negativePrompt: "historical setting, old ruins, smiling broadly, cheap crowd",
        cameraMovement: "حركة كاميرا منخفضة الزاوية (Low-angle tracking) تبرز هيبته وحركته الأنيقة.",
        lightingStyle: "إضاءة احتفالية غنية ذات دفء مبهر وظلال ناعمة تبرز لمعان البدلة الفاخرة.",
        arabicDescription: "وصول الشخصية إلى الحفل الفاخر، حيث تلتفت الأنظار إليه فور دخوله تعبيراً عن الجاذبية المغناطيسية للعطر."
      },
      {
        id: 10,
        title: "لحظة الالتقاء (The Encounter)",
        duration: "5 ثواني",
        prompt: "A beautiful Arab woman with elegant modern features and a stylish gown looks toward the man, smiling subtly. The air between them filled with a faint golden shimmer. Highly cinematic, artistic direction, deep depth of field --ar 16:9",
        negativePrompt: "pharaonic makeup, ugly dress, excessive jewelry, over-acting",
        cameraMovement: "انتقال تركيز ناعم (Rack focus) من عيني المرأة إلى زجاجة العطر في جيب سترة الرجل.",
        lightingStyle: "إضاءة حالمة رومانسية خافتة مع توهج ذهبي دافئ يغمر اللقطة.",
        arabicDescription: "المرأة الشرقية الفاتنة تبتسم برقة وغموض متأثرة بعبير العطر الفاخر الذي يملأ الممر."
      },
      {
        id: 11,
        title: "الجمالية المتكاملة (Symphony of Luxury)",
        duration: "5 ثواني",
        prompt: "Cinematic medium shot. The man sits in a bespoke leather chair, the perfume bottle standing prominently on the side table next to a glass of crystal clear water. Refined luxury, high-end Cairo penthouse, 8k resolution --ar 16:9",
        negativePrompt: "shabby room, messy table, plastic cup, bright white ceiling light",
        cameraMovement: "حركة تقريب هادئة مع انزلاق جانبي (Dolly slide and push) لإبراز تفاصيل الجلسة.",
        lightingStyle: "إضاءة ناعمة جداً من مصباح أرضي كلاسيكي يخلق ظلالاً دافئة وطويلة.",
        arabicDescription: "لقطة متوسطة تظهر الرجل مسترخياً على مقعد جلدي فخم، بينما يستقر العطر بجانبه كرمز للسيادة والأناقة."
      },
      {
        id: 12,
        title: "التفاصيل النحاسية الفاخرة (Engraved Luxury)",
        duration: "5 ثواني",
        prompt: "Macro shot of the heavy brass cap as it is placed back onto the crystal perfume bottle. The click sound is visually represented by a soft flare. Elegant gold and copper textures, premium 3d render quality --ar 16:9",
        negativePrompt: "scratchy glass, finger prints, plastic, ugly colors, shaking",
        cameraMovement: "لقطة ثابتة فائقة التقريب (Extreme Close-up) مع عمق ميدان ضيق للغاية.",
        lightingStyle: "إضاءة مركزة بأسلوب الإعلانات التجارية الفاخرة لشركات الذهب والمجوهرات.",
        arabicDescription: "لقطة بالغة القرب للغطاء النحاسي وهو يستقر على الزجاجة بنقوشه الهندسية العربية الرائعة."
      },
      {
        id: 13,
        title: "الامتداد الكوني للرائحة (The Legacy)",
        duration: "5 ثواني",
        prompt: "Wide shot of the modern Cairo skyline at night. A golden wave of aromatic mist gently sweeps over the city skyline, blending with the glittering city lights. Dreamy, magical realism, epic scale --ar 16:9",
        negativePrompt: "dusty environment, sandstorm, day time, cheap animation, flat sky",
        cameraMovement: "حركة بانورامية بطيئة (Slow Pan) من النيل إلى أعالي ناطحات السحاب المضيئة.",
        lightingStyle: "أضواء النيون الباردة للمدينة الليلية تتباين بشكل مذهل مع الموجة الذهبية الدافئة للعطر.",
        arabicDescription: "سماء القاهرة ليلاً مع نيلها الساحر، حيث يمر عبير العطر الذهبي كأنه هالة سحرية تحتضن المدينة."
      },
      {
        id: 14,
        title: "اكتمال القصة والهدف (Resolution)",
        duration: "5 ثواني",
        prompt: "The Egyptian man and the beautiful woman walk side by side down an elegant modern glass corridor, leaving behind a subtle trail of golden light. Perfect continuity, high-fashion aesthetic, 8k --ar 16:9",
        negativePrompt: "casual walking, running, poor clothes, pharaonic pyramids, text on screen",
        cameraMovement: "تراجع تدريجي للكاميرا (Dolly back) لفتح الكادر وتأكيد مشهد الختام.",
        lightingStyle: "إضاءة خلفية قوية (Silhouette rim light) تخلق هالة من الأناقة والجاذبية حول الثنائي.",
        arabicDescription: "الثنائي الأنيق يسيران معاً في ممر زجاجي مضيء تاركين خلفهما أثراً دافئاً يختتم رحلة الإعلان السينمائي."
      },
      {
        id: 15,
        title: "عرض المنتج والشعار (Hero Product & Logo)",
        duration: "5 ثواني",
        prompt: "A stunning majestic studio product shot. The luxury crystal perfume bottle stands perfectly centered on a dark obsidian stone pedestal, illuminated by a brilliant overhead golden light. The liquid inside glows brightly. A metallic engraved Arabic logo float elegantly in the dark empty background. Clean frame, no text or other writings on screen --ar 16:9",
        negativePrompt: "text on screen, watermark, other products, cluttered background, pharaonic art, low quality",
        cameraMovement: "ثبات كامل ومطلق للكاميرا (Static Hero Shot) لإبراز فخامة المنتج وهيبته بوقار استثنائي.",
        lightingStyle: "إضاءة استوديو ثلاثية الأبعاد فائقة الاحترافية (Studio High-Key lighting) تركز بالكامل على المنتج والشعار.",
        arabicDescription: "اللقطة الختامية للبطل (Hero Shot): زجاجة العطر في المنتصف على منصة حجرية سوداء مضاءة بهالة ذهبية مع الشعار العربي الأنيق."
      }
    ],
    customizedPlatforms: {
      seedance: "Seedance 2.0 Prompt: A luxury heavy crystal perfume bottle with glowing gold liquid inside, resting on dark polished marble table. Volumetric warm side lighting, floating gold dust particles, Arri Alexa 35, 50mm lens, 8k resolution, cinematic styling, Arabic elegant details, Egyptian modern luxury context.",
      midjourney: "Midjourney Prompt: A premium heavy crystal perfume bottle with golden glowing liquid, on a black marble reflection table, gold dust particles swirling around, rich volumetric dark blue and gold lighting, Rembrandt style, shot on Arri Alexa Mini LF, 8k, hyper-detailed, photorealistic, cinematic lighting --ar 16:9 --style raw --v 6.0",
      sora: "Sora Prompt: Cinematic extreme close-up of a luxury heavy glass perfume bottle on black marble. Gold dust elegantly floats. The camera performs a slow orbit around the bottle. The liquid inside glows warmly. Volumetric light rays pierce the scene. Highly consistent, photorealistic 3D rendering, 5 seconds duration.",
      runway: "Runway Gen-3 Prompt: Static studio product shot of a majestic crystal perfume bottle on a dark obsidian pedestal. Strong golden light from above makes the fluid glow intensely. Seamless camera motion, high fidelity, 1080p, deep contrast, teal and orange premium grading."
    }
  }
};
