import React, { useState, useEffect, useRef } from "react";
import {
  Film,
  Megaphone,
  Sparkles,
  Upload,
  Trash2,
  Copy,
  Check,
  Download,
  Menu,
  X,
  Sun,
  Moon,
  Link2,
  Play,
  Pause,
  Music,
  Volume2,
  Flame,
  User,
  MapPin,
  Clock,
  Layers,
  Video,
  Heart,
  Smile,
  Eye,
  History,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { AnalysisResult, SavedProject, Scene } from "./types";
import { defaultProject } from "./defaultData";

export default function App() {
  // Theme state: dark luxury (navy background) vs light mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Split section state & themes
  const [adType, setAdType] = useState<"cinematic" | "storytelling">("cinematic");
  const [cinematicTheme, setCinematicTheme] = useState<string>("جيمس بوند والأناقة الغامضة");
  const [externalLink, setExternalLink] = useState<string>("");

  // Input states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("مشروع جديد");

  // App running/progress states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Current active result
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  // Local History list
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Copy status feedback states
  const [copiedSceneId, setCopiedSceneId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [isPlatformsExpanded, setIsPlatformsExpanded] = useState(false);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cinematic interactive timeline & audio synthesis states
  const [isCinemaModalOpen, setIsCinemaModalOpen] = useState(false);
  const [currentCinemaSceneIdx, setCurrentCinemaSceneIdx] = useState(0);
  const [isPlayingCinema, setIsPlayingCinema] = useState(false);
  const [synthAudioContext, setSynthAudioContext] = useState<AudioContext | null>(null);
  const [synthOscillators, setSynthOscillators] = useState<any[]>([]);

  // Function to start real-time browser synthesizer
  const startRealtimeCinemaSynth = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      setSynthAudioContext(ctx);

      // Create a master volume
      const masterVol = ctx.createGain();
      masterVol.gain.setValueAtTime(0.25, ctx.currentTime);
      masterVol.connect(ctx.destination);

      // Deep cinematic low drone (55Hz / A1)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      
      const filter1 = ctx.createBiquadFilter();
      filter1.type = "lowpass";
      filter1.frequency.setValueAtTime(100, ctx.currentTime);
      
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.4, ctx.currentTime);
      
      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(masterVol);
      osc1.start();

      // Atmospheric pad sweep (220Hz / A3)
      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(220, ctx.currentTime);
      
      const filter2 = ctx.createBiquadFilter();
      filter2.type = "lowpass";
      filter2.frequency.setValueAtTime(280, ctx.currentTime);
      
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.12, ctx.currentTime);
      
      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(masterVol);
      osc2.start();

      // Slow LFO to sweep the filter frequency
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12s modulation sweep
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter2.frequency);
      lfo.start();

      // Soft heartbeat cinematic percussion pulse (every 2 seconds)
      const pulseInterval = setInterval(() => {
        if (ctx.state === "closed") return;
        try {
          const oscP = ctx.createOscillator();
          oscP.type = "sine";
          oscP.frequency.setValueAtTime(60, ctx.currentTime);
          
          const gainP = ctx.createGain();
          gainP.gain.setValueAtTime(0.35, ctx.currentTime);
          gainP.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
          
          oscP.connect(gainP);
          gainP.connect(masterVol);
          oscP.start();
          oscP.stop(ctx.currentTime + 1.0);
        } catch (e) {}
      }, 2000);

      setSynthOscillators([
        osc1, 
        osc2, 
        lfo, 
        { stop: () => clearInterval(pulseInterval) }
      ]);
    } catch (e) {
      console.error("Web Audio API not supported or failed to initialize", e);
    }
  };

  // Function to stop real-time browser synthesizer
  const stopRealtimeCinemaSynth = () => {
    if (synthOscillators && synthOscillators.length > 0) {
      synthOscillators.forEach(osc => {
        try {
          osc.stop();
        } catch(e) {}
      });
      setSynthOscillators([]);
    }
    if (synthAudioContext) {
      try {
        synthAudioContext.close();
      } catch(e) {}
      setSynthAudioContext(null);
    }
  };

  // Automatic slideshow logic when presentation is active
  useEffect(() => {
    let timer: any = null;
    if (isPlayingCinema && currentResult) {
      timer = setInterval(() => {
        setCurrentCinemaSceneIdx((prev) => {
          if (prev >= currentResult.scenes.length - 1) {
            return 0; // loop back to first scene
          }
          return prev + 1;
        });
      }, 4500); // 4.5 seconds per scene transition
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingCinema, currentResult]);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      stopRealtimeCinemaSynth();
    };
  }, []);

  // Function to generate and download customized 90-second WAV soundtrack
  const downloadCinematicSoundtrack = () => {
    try {
      const sampleRate = 22050; // 22.05 kHz is perfect for instant, high-quality synth loops
      const duration = 90; // 90 seconds (1.5 minutes)
      const numSamples = sampleRate * duration;
      const buffer = new Float32Array(numSamples);

      // Synthesize a gorgeous cinematic pad drone & space pulse sequence
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        
        // Base low drone (55Hz / A1 and 82.4Hz / E2)
        const subBass = Math.sin(2 * Math.PI * 55 * t) * 0.32;
        const chordFifth = Math.sin(2 * Math.PI * 82.4 * t) * 0.18;
        
        // Slow swell LFO waves (12 seconds)
        const swellLFO = (Math.sin(2 * Math.PI * 0.08 * t) + 1) / 2;
        const pulseLFO = (Math.sin(2 * Math.PI * 1.5 * t) + 1.2) / 2.2;
        
        // Soft cinematic high-end sparkle pads (E3, A3, E4)
        const pad1 = Math.sin(2 * Math.PI * 164.8 * t) * 0.08;
        const pad2 = Math.sin(2 * Math.PI * 220.0 * t) * 0.06;
        const pad3 = Math.sin(2 * Math.PI * 329.6 * t) * 0.04;
        
        const drone = (subBass + chordFifth) * swellLFO + (pad1 + pad2 + pad3) * (1 - swellLFO) * 0.6;
        
        // Heartbeat rhythmic percussion impact (every 2.0 seconds)
        const pulse = Math.sin(2 * Math.PI * 62 * t) * 0.14 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * 0.5 * t)), 8);
        
        let sample = (drone + pulse * pulseLFO) * 0.8;
        
        // Safety clipping guard
        if (sample > 1) sample = 1;
        if (sample < -1) sample = -1;
        
        buffer[i] = sample;
      }

      // Build PCM WAV container
      const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(wavBuffer);

      // RIFF header
      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, 36 + numSamples * 2, true);
      view.setUint32(8, 0x57415645, false); // "WAVE"

      // Format chunk
      view.setUint32(12, 0x666d7420, false); // "fmt "
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM format
      view.setUint16(22, 1, true); // Mono channel
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true); // 16-bit

      // Data chunk
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, numSamples * 2, true);

      // Write samples
      let offset = 44;
      for (let i = 0; i < numSamples; i++) {
        const sample = Math.max(-1, Math.min(1, buffer[i]));
        const val = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, val, true);
        offset += 2;
      }

      // Trigger automatic browser file download
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `موسيقى_${projectName.replace(/\s+/g, "_")}_السينمائية.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate or download the soundtrack WAV", err);
    }
  };

  // Load default project and history on mount
  useEffect(() => {
    // Inject the beautiful default project so the user has an immediate Hollywood showcase
    setCurrentResult(defaultProject.result);
    setUploadedImages(defaultProject.images);
    setUserNotes(defaultProject.notes);
    setProjectName(defaultProject.projectName);
    setAdType(defaultProject.adType);
    if (defaultProject.cinematicTheme) {
      setCinematicTheme(defaultProject.cinematicTheme);
    }

    // Load localStorage projects if they exist
    try {
      const localData = localStorage.getItem("commercial_film_projects");
      if (localData) {
        setSavedProjects(JSON.parse(localData));
      } else {
        // Seed history with default project
        const initialList = [defaultProject];
        setSavedProjects(initialList);
        localStorage.setItem("commercial_film_projects", JSON.stringify(initialList));
      }
    } catch (e) {
      console.error("Error reading localStorage", e);
    }
  }, []);

  // Save projects to local storage helper
  const saveProjectsToLocal = (updatedList: SavedProject[]) => {
    setSavedProjects(updatedList);
    try {
      localStorage.setItem("commercial_film_projects", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("Storage quota warning - optimizing projects data size...", e);
      try {
        // Attempt 1: Keep images of only the very first (most recent) project, strip images of past ones
        const optimizedList = updatedList.map((p, idx) => ({
          ...p,
          images: idx === 0 ? p.images : []
        }));
        localStorage.setItem("commercial_film_projects", JSON.stringify(optimizedList));
        setSavedProjects(optimizedList);
        console.log("Storage optimized by removing images from past projects.");
      } catch (e2) {
        console.warn("Storage quota still exceeded - removing all images from projects...", e2);
        try {
          // Attempt 2: Strip images from ALL projects, leaving pure text/metadata
          const textOnlyList = updatedList.map(p => ({
            ...p,
            images: []
          }));
          localStorage.setItem("commercial_film_projects", JSON.stringify(textOnlyList));
          setSavedProjects(textOnlyList);
          console.log("Storage optimized to pure text-only projects.");
        } catch (e3) {
          console.error("Critical storage error - truncating history length...", e3);
          try {
            // Attempt 3: Keep only the 3 most recent projects (text-only)
            const truncatedList = updatedList.slice(0, 3).map(p => ({
              ...p,
              images: []
            }));
            localStorage.setItem("commercial_film_projects", JSON.stringify(truncatedList));
            setSavedProjects(truncatedList);
            console.log("Storage optimized by truncating history to 3 items.");
          } catch (e4) {
            console.error("Failed to save to localStorage entirely.", e4);
          }
        }
      }
    }
  };

  // Convert files to base64
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    const promises = fileList.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(new Error("File reading error"));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then(base64s => {
        const newImages = [...uploadedImages, ...base64s];
        setUploadedImages(newImages);
        // Let the user configure settings first and click the generation button manually.
      })
      .catch(err => {
        setErrorMessage("خطأ أثناء قراءة الملف المرفق. يرجى المحاولة مرة أخرى.");
      });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Trigger server-side analysis
  const triggerAnalysis = async (imagesToAnalyze = uploadedImages) => {
    if (imagesToAnalyze.length === 0) {
      setErrorMessage("برجاء رفع صورة أو فيديو للمنتج أولاً لتمكين ميزة الرؤية الحاسوبية والتحليل.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");
    setProgressMessage("جاري استدعاء محرك الرؤية الحاسوبية وتحليل تفاصيل المنتج البصرية...");

    // Staged status messages for pulse animation
    const progressIntervals = [
      "جاري استنباط الطابع والألوان بأسلوب هوليوود...",
      "جاري بناء قصة متناسقة وتصميم 15 مشهداً سينمائياً...",
      "جاري الحفاظ على استمرارية الشخصيات وتماسك الملابس...",
      "جاري تخصيص البرومبت للمنصات العالمية (Sora, Midjourney)...",
      "جاري إنهاء توليد المشروع وتنسيق المشاهد والسيناريو..."
    ];

    let step = 0;
    const intervalId = setInterval(() => {
      if (step < progressIntervals.length) {
        setProgressMessage(progressIntervals[step]);
        step++;
      }
    }, 2500);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          images: imagesToAnalyze,
          notes: userNotes,
          externalLink: externalLink,
          adType: adType,
          cinematicTheme: adType === "cinematic" ? cinematicTheme : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل الاتصال بالخادم الرئيسي لتوليد التحليل.");
      }

      const result: AnalysisResult = await response.json();
      setCurrentResult(result);

      // Create a project object to store in history
      const newProject: SavedProject = {
        id: "project_" + Date.now(),
        projectName: projectName === "مشروع جديد" ? result.productAnalysis.suggestedProductName : projectName,
        timestamp: new Date().toLocaleString("ar-EG", { hour12: true }),
        notes: userNotes,
        externalLink: externalLink,
        adType: adType,
        cinematicTheme: adType === "cinematic" ? cinematicTheme : undefined,
        result: result,
        images: imagesToAnalyze
      };

      // Set the project name in UI if it was default
      if (projectName === "مشروع جديد") {
        setProjectName(newProject.projectName);
      }

      // Add to list of saved projects
      const updatedList = [newProject, ...savedProjects.filter(p => p.id !== "default-perfume-01")];
      saveProjectsToLocal(updatedList);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "فشل معالجة الطلب عبر خادم الذكاء الاصطناعي. تأكد من إعداد مفتاح GEMINI_API_KEY.");
    } finally {
      clearInterval(intervalId);
      setIsAnalyzing(false);
    }
  };

  // Load a project from history
  const loadProject = (project: SavedProject) => {
    setProjectName(project.projectName);
    setUploadedImages(project.images);
    setUserNotes(project.notes);
    setExternalLink(project.externalLink || "");
    setAdType(project.adType);
    if (project.cinematicTheme) {
      setCinematicTheme(project.cinematicTheme);
    }
    setCurrentResult(project.result);
    setIsHistoryOpen(false);
  };

  // Delete a project from history
  const deleteProjectFromHistory = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProjects.filter(p => p.id !== projectId);
    saveProjectsToLocal(updated);
  };

  // Get YouTube reference school applied based on product nature
  const getAppliedYoutubeSchool = () => {
    const textToScan = ((projectName || "") + " " + (currentResult?.productAnalysis?.visualDescription || "") + " " + (userNotes || "")).toLowerCase();
    
    // 1. Watches, electronics, sunglasses, luxury mechanical accessories, jewelry
    if (textToScan.match(/(ساع|نظار|هاتف|جوال|ذهب|تروس|أجهزة|إلكترون|معدن|فضة|حديد|تكنولوج|سلسلة|حلي|watch|phone|laptop|gear|metal|glass|lens|jewelry|device|screen)/)) {
      return {
        title: "مدرسة الدوران المحوري والغموض الفاخر (-wNXboIhlSU)",
        ref: "-wNXboIhlSU",
        description: "مخصصة للمنتجات الفاخرة والمعادن المصقولة والأجهزة عالية الدقة.",
        directing: "لقطات دوران محوري (Orbital rotation) وحركات كاميرا دائرية حول التفاصيل الدقيقة للمنتج، مع استخدام عدسات ماكرو تظهر دقة التفاصيل الهندسية.",
        editing: "إيقاع منضبط يتبع نقرات وتكات التروس، ومونتاج دقيق مع انتقالات تعتمد على الخطوط الهندسية المتوازية واللمعان البصري.",
        lighting: "إضاءة حافة حادة جدًا (Rim/Edge Lighting) كونتراست غامق ومثير يفصل المنتج عن الخلفية المعتمة، وتدرجات لونية معدنية زرقاء أو بلاتينية باردة.",
        sound: "هندسة صوتية ميكانيكية دقيقة؛ أصوات تكات تروس ميكانيكية ناعمة، نقرات معدنية، احتكاك ناعم، وصدى غامض يعزز القيمة الفاخرة للمنتج."
      };
    }
    
    // 2. Cosmetics, skincare, makeup, perfumes, creams, glass bottles
    if (textToScan.match(/(عطر|تجميل|بشرة|كريم|زجاج|قنينة|ورود|ياسمين|عناية|ماكياج|ورد|زهور|جمال|perfume|cream|makeup|skincare|cosmetic|rose|flower|skin)/)) {
      return {
        title: "مدرسة الانسياب الهندسي والجمال الناعم (bWF2AnQtyBs)",
        ref: "bWF2AnQtyBs",
        description: "مخصصة لمنتجات التجميل، العناية بالبشرة، العطور الفخمة، والمستحضرات الزجاجية.",
        directing: "لقطات انسيابية ناعمة جدًا، تتبع أفقي بطيء لزجاجة المنتج، عدسات مقربة تعبر عبر البخار أو الرذاذ المتطاير برفق، وتركيز على الملمس السائل الحريري.",
        editing: "محاذاة هندسية ناعمة (Match Cuts) تربط بين شكل الزجاجة والمكونات الطبيعية، مع انتقال تدريجي لطيف يحافظ على الهدوء والاستمرارية البصرية.",
        lighting: "إضاءة ناعمة جداً ومشتتة (Soft High-Key Diffused Lighting) لإخفاء الظلال الحادة، مع تدرجات لونية باستيل أو دافئة (وردي، ذهبي خفيف، أبيض لؤلؤي) تبرز نقاء ومثالية المنتج.",
        sound: "أصوات رش دافئة ومؤثرات بخاخات ناعمة (Soft Mist Puff)، صوت فتح وسحب غطاء زجاجي مصقول، حفيف أوراق شجر ناعم، وصوت تدفق قطرة كريم غنية."
      };
    }

    // 3. Carbonated drinks, sports, active liquids, energy, high energy motion, explosions
    if (textToScan.match(/(غازي|بيبسي|كوكا|صودا|رياض|حماس|انفجا|رذاذ|تطاير|ثلج|نشاط|حرك|طاقة|soda|cola|sport|energy|splash|explode|bubble|ice)/)) {
      return {
        title: "مدرسة تلاعب السرعة والانفجار الحركي السائل (WTQmcbTNu-k)",
        ref: "WTQmcbTNu-k",
        description: "مخصصة للمنتجات الحركية، المشروبات الغازية، المنتجات الرياضية، ورذاذ السائل المندفع بقوة.",
        directing: "تلاعب شديد بالسرعة (Speed Ramping) سريع-بطيء-سريع، تجميد رذاذ السوائل المنشطرة وبلورات الثلج في الهواء (Frozen fluid dynamics)، ولقطات تتبع ديناميكية سريعة لفتح العبوة.",
        editing: "مونتاج خاطف وإيقاعي فائق السرعة متزامن بدقة مع انفجار الرذاذ أو تكسير الثلج، مع استخدام لقطات متتالية قصيرة لزيادة الحماس البصري.",
        lighting: "إضاءة ساطعة وعالية التباين مع درجات لونية مشبعة للغاية ونابضة بالحياة (سوبر كونتراست) تبرز فوران الفقاعات ولمعان الرذاذ المتطاير.",
        sound: "هندسة صوتية انفجارية ومثيرة؛ أصوات فتح علبة الصودا (Hiss & Pop)، تكسير الثلج القوي، ارتطام السوائل المتفجر، وأصوات ووش (Swoosh/Whoosh) هائلة مع حركات الكاميرا الخاطفة."
      };
    }

    // 4. Default / Coffee, food, organic items, hot drinks, chocolate
    return {
      title: "مدرسة الماكرو والسوائل العضوية الفاخرة (07Q510r50y8)",
      ref: "07Q510r50y8",
      description: "مخصصة للقهوة، المأكولات، السوائل العضوية، الشوكولاتة، والمنتجات الساخنة.",
      directing: "لقطات ماكرو فائقة المقربة (Ultra Macro Shots) لحبيبات القهوة أو قوام المنتج، تتبع بطيء لانسكاب السائل ببطء، وتصوير بخار متصاعد بدقة 120 إطار بالثانية.",
      editing: "إيقاع مونتاجي غني وثقيل يتدرج من تسارع خاطف عند تساقط الحبيبات إلى بطء سينمائي مهيب يمتع العين بتفاصيل المنتج وجزيئاته.",
      lighting: "إضاءة دافئة وثرية (Warm Rembrandt Lighting) مع كونتراست يعكس درجات اللون البني والذهبي والأسود، وتركيز على انعكاس الضوء على الأسطح الرطبة والدافئة.",
      sound: "هندسة صوتية حسية ASMR؛ أصوات قرقعة حبوب القهوة العميقة، انسكاب السائل اللزج الدافئ، هيس البخار المتصاعد، قرقعة كوب السيراميك الثقيل على الرخام."
    };
  };

  // Copy individual scene prompt
  const copyScenePrompt = (scene: Scene) => {
    const formattedText = `Prompt:\n${scene.prompt}\n\nNegative Prompt:\n${scene.negativePrompt}`;
    navigator.clipboard.writeText(formattedText);
    setCopiedSceneId(scene.id);
    setTimeout(() => setCopiedSceneId(null), 2000);
  };

  // Copy Platform prompt
  const copyPlatformPrompt = (platformName: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPlatform(platformName);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  // Copy All 15 Scenes combined with Negative Prompt
  const copyAllCombinedScenes = () => {
    if (!currentResult) return;

    let text = `=== مشروع الفيلم الإعلاني: ${projectName} ===\n`;
    text += `نوع الإعلان: ${adType === "cinematic" ? "إعلان سينمائي" : "إعلان قصة درامية"}\n`;
    if (adType === "cinematic") {
      text += `طابع الأفلام السينمائية: ${cinematicTheme}\n`;
    }
    if (externalLink) {
      text += `رابط الإلهام الشكلي: ${externalLink}\n`;
    }
    text += `ملاحظات العميل: ${userNotes}\n`;
    text += `=========================================\n\n`;

    currentResult.scenes.forEach(s => {
      text += `--- المشهد ${s.id} [${s.title}] (${s.duration}) ---\n`;
      text += `حركة الكاميرا: ${s.cameraMovement}\n`;
      text += `الإضاءة وتناسق الألوان: ${s.lightingStyle}\n`;
      text += `البرومبت البصري الأساسي (Visual Prompt):\n${s.prompt}\n`;
      text += `البرومبت البصري السلبي (Negative Prompt):\n${s.negativePrompt}\n\n`;
    });

    text += `=========================================\n`;
    text += `=== البرومبت السلبي الموحد للمشروع (Combined Negative Prompts) ===\n`;
    currentResult.scenes.forEach(s => {
      text += `- المشهد ${s.id}: ${s.negativePrompt}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Save/Download project to Word DOC file
  const handleSaveProjectFile = () => {
    if (!currentResult) return;

    const proj: SavedProject = {
      id: "download_" + Date.now(),
      projectName: projectName,
      timestamp: new Date().toLocaleString("ar-EG"),
      notes: userNotes,
      externalLink: externalLink,
      adType: adType,
      cinematicTheme: adType === "cinematic" ? cinematicTheme : undefined,
      result: currentResult,
      images: uploadedImages
    };

    // Export using HTML structure with inline CSS so Microsoft Word reads it cleanly
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${proj.projectName}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; line-height: 1.6; background-color: #ffffff; color: #333333; padding: 20px; }
          .header-box { text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px; }
          h1 { color: #1e3a8a; font-size: 26px; margin: 0; }
          h2 { color: #7c3aed; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; font-size: 20px; }
          .meta-info { font-size: 14px; color: #555555; background: #f1f5f9; padding: 10px; border-radius: 6px; margin-bottom: 20px; }
          .section-card { background: #fafafa; border: 1px solid #eaeaea; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .scene-card { border: 1.5px solid #7c3aed; padding: 20px; margin-bottom: 25px; border-radius: 10px; background: #faf5ff; }
          .scene-header { font-weight: bold; color: #7c3aed; font-size: 18px; border-bottom: 1px solid #e9d5ff; padding-bottom: 8px; margin-bottom: 12px; }
          .prompt-container { background: #1e293b; color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; font-family: 'Consolas', 'Courier New', monospace; direction: ltr; text-align: left; margin: 10px 0; border-radius: 5px; font-size: 14px; }
          .negative-container { background: #fef2f2; color: #991b1b; border-left: 4px solid #ef4444; padding: 12px; font-family: 'Consolas', 'Courier New', monospace; direction: ltr; text-align: left; margin: 10px 0; border-radius: 5px; font-size: 13px; }
          .footer { text-align: center; font-size: 12px; color: #999; margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1>مشروع إعلاني سينمائي: ${proj.projectName}</h1>
          <p style="color: #666; margin: 5px 0 0 0;">تم استخراجه وتنسيقه عبر منصة "فيلم إعلاني" للذكاء الاصطناعي</p>
        </div>

        <div class="meta-info">
          <strong>نوع الإعلان الأساسي:</strong> ${proj.adType === "cinematic" ? "إعلان تجاري سينمائي (Cinematic)" : "إعلان قصة درامية (Storytelling)"}<br/>
          ${proj.adType === "cinematic" ? `<strong>نمط الفيلم المختار:</strong> ${proj.cinematicTheme || "عام سينمائي"}<br/>` : ""}
          <strong>تاريخ إنشاء المشروع:</strong> ${proj.timestamp}<br/>
          ${proj.externalLink ? `<strong>رابط الطابع البصري الملهم:</strong> <a href="${proj.externalLink}">${proj.externalLink}</a><br/>` : ""}
          <strong>ملاحظات العميل والتفاصيل المطلوبة:</strong> ${proj.notes || "لا توجد ملاحظات"}
        </div>

        <h2>أولاً: تحليل الرؤية الحاسوبية للمنتج البصري</h2>
        <div class="section-card">
          <p><strong>الوصف البصري الدقيق للمنتج:</strong> ${proj.result.productAnalysis.visualDescription}</p>
          <p><strong>المزاج والإحساس العام المقترح:</strong> ${proj.result.productAnalysis.suggestedMood}</p>
          <p><strong>الفئة المستهدفة للإعلان:</strong> ${proj.result.productAnalysis.targetAudience}</p>
          <p><strong>طبيعة الشخصيات العربية/المصرية والبيئة:</strong> ${proj.result.productAnalysis.egyptianArabContext}</p>
        </div>

        <h2>ثانياً: استخراج المكونات البصرية العكسية (Reverse Prompting)</h2>
        <div class="section-card">
          <p><strong>العناصر والمكونات الرئيسية:</strong> ${proj.result.reversePrompt.elements}</p>
          <p><strong>الإضاءة والظلال السينمائية:</strong> ${proj.result.reversePrompt.lighting}</p>
          <p><strong>أقوى كاميرات الإعلان والعدسة المقترحة:</strong> ${proj.result.reversePrompt.lensAndCamera}</p>
          <p><strong>التدرج اللوني والأسلوب الفني المقترح:</strong> ${proj.result.reversePrompt.artStyle}</p>
          <p><strong>توجيهات حركات الكاميرا:</strong> ${proj.result.cameraMotion}</p>
          <p><strong>نصائح التحسين الذكي بأسلوب هوليوود:</strong> ${proj.result.smartEnhancements}</p>
        </div>

        <h2>ثالثاً: السيناريو الإعلاني المنسق (15 مشهداً احترافياً)</h2>
        ${proj.result.scenes.map(s => `
          <div class="scene-card">
            <div class="scene-header">المشهد ${s.id}: ${s.title} (${s.duration})</div>
            <p style="background-color: #f5f3ff; border: 1.5px solid #ddd6fe; padding: 10px; border-radius: 6px; font-weight: bold; color: #6d28d9; margin-bottom: 12px;"><strong>شرح المشهد بالعربي وجمالياته:</strong> ${s.arabicDescription || "شرح وتفاصيل لقطة المنتج الإعلانية والجماليات السينمائية المقترحة بالتكامل مع الهوية الإعلانية للعلامة التجارية."}</p>
            <p><strong>حركة الكاميرا وتأثير المونتاج:</strong> ${s.cameraMovement}</p>
            <p><strong>توزيع الإضاءة وتفاصيل اللون:</strong> ${s.lightingStyle}</p>
            <p style="margin-top: 15px; font-weight: bold; color: #1e3a8a;">البرومبت البصري الاحترافي الجاهز للتوليد (Visual Prompt):</p>
            <div class="prompt-container">${s.prompt}</div>
            <p style="font-weight: bold; color: #991b1b;">البرومبت السلبي لتلافي العيوب والتشوه (Negative Prompt):</p>
            <div class="negative-container">${s.negativePrompt}</div>
          </div>
        `).join("")}

        <h2>رابعاً: تخصيص البرومبت للمنصات العالمية</h2>
        <div class="section-card">
          <h3>منصة Seedance 2.0</h3>
          <div class="prompt-container">${proj.result.customizedPlatforms.seedance}</div>
          
          <h3>منصة Midjourney</h3>
          <div class="prompt-container">${proj.result.customizedPlatforms.midjourney}</div>
          
          <h3>منصة Sora</h3>
          <div class="prompt-container">${proj.result.customizedPlatforms.sora}</div>
          
          <h3>منصة Runway Gen-3</h3>
          <div class="prompt-container">${proj.result.customizedPlatforms.runway}</div>
        </div>

        <div class="footer">
          <p>تم التوليد بنجاح عبر "فيلم إعلاني" - منصة استوديوهات هوليود الافتراضية للإعلانات © 2026</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `مشروع_إعلاني_${proj.projectName.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Quick helper to auto-fill input with a mock external link for demonstration
  const setDemoLink = () => {
    setExternalLink("https://www.youtube.com/watch?v=dQw4w9WgXcQ (James Bond 007 Specter Style)");
  };

  // Classes matching user requirements: Immersive Deep Cyber Navy (#000040) and cyber-glass elements from Immersive UI design.
  const themeBgClass = isDarkMode ? "bg-[#000040] text-white" : "bg-[#f8fafc] text-slate-900";
  const themeCardClass = isDarkMode ? "bg-white/5 backdrop-blur-md border border-white/20" : "bg-white border-slate-200 shadow-md";
  const themeTextClass = isDarkMode ? "text-slate-200" : "text-slate-700";
  const themeHeadingClass = isDarkMode ? "text-white" : "text-[#000040]";
  const themeInputClass = isDarkMode ? "bg-white/5 border border-white/20 text-white focus:border-blue-400 placeholder:text-white/30" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#3b82f6]";

  return (
    <div dir="rtl" className={`min-h-screen font-sans ${themeBgClass} pb-20 transition-colors duration-300 relative`}>
      
      {/* HEADER SECTION - glassmorphism design, centered logo, no bar on top of "الفيلم الإعلاني", smaller and elegant */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b py-3 px-6 shadow-lg transition-all ${
        isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Day/Night Theme Switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-full bg-opacity-10 hover:bg-opacity-20 bg-blue-500 text-blue-400 hover:text-blue-300 transition-all cursor-pointer"
            title={isDarkMode ? "الوضع المضيء" : "الوضع الليلي الفاخر"}
          >
            {isDarkMode ? <Sun className="w-7 h-7" /> : <Moon className="w-7 h-7" />}
          </button>

          {/* Centered Logo & Title - no horizontal bar, slightly smaller */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 text-white shadow-lg animate-pulse">
                {/* Cinema film-strip with megaphone icon inside */}
                <div className="relative">
                  <Film className="w-8 h-8 stroke-2" />
                  <Megaphone className="w-4 h-4 absolute top-2 left-2 text-yellow-300 fill-yellow-400" />
                </div>
              </div>
              <h1 className={`font-display font-bold text-2xl tracking-wide ${isDarkMode ? 'text-white' : 'text-[#050a18]'} m-0`}>
                فيلم إعلاني
              </h1>
            </div>
            <p className="text-xs text-purple-400 font-medium tracking-widest mt-1">
              HOLLYWOOD CINEMATIC AD STUDIO
            </p>
          </div>

          {/* Saved Projects Button to open the hidden sidebar list */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-medium text-lg transition-all cursor-pointer"
          >
            <History className="w-6 h-6" />
            <span>مشاريعي</span>
          </button>
        </div>
      </header>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto mt-6 px-4">
          <div className="bg-red-500/20 border-2 border-red-500 text-red-200 p-4 rounded-2xl flex items-center justify-between text-lg">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="p-1 hover:bg-red-500/20 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* APP MOTTO / BANNER - Large and prominent fonts */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
            مرحباً بك في أستوديو صناعة الإعلانات الاحترافي
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            منصتك الإبداعية المتخصصة في هندسة المشاهد الإعلانية بأرقى المعايير السينمائية وأساليب هوليوود لتوليد برومبت تفصيلي مذهل متوافق مع Sora, Runway, Midjourney و Seedance 2.0.
          </p>
        </div>

        {/* SECTION SWITCHER: TWO DIVISIONS (Cinematic vs Storytelling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* DIVISION 1: Cinematic Commercials Card */}
          <div
            onClick={() => setAdType("cinematic")}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
              adType === "cinematic"
                ? isDarkMode 
                  ? "border-blue-400 bg-blue-900/40 shadow-[0_0_25px_rgba(37,99,235,0.3)]" 
                  : "border-blue-500 bg-blue-50 shadow-lg"
                : `${themeCardClass} opacity-70 hover:opacity-100`
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all"></div>
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${adType === "cinematic" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                <Film className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">إعلان سينمائي (Cinematic)</h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  مشاهد أفلام حركية بأسلوب هوليوود. يعتمد على الإضاءة الفخمة، كاميرات Arri/Red، تدرج لوني دافئ، وحركات كاميرا ثلاثية الأبعاد مع الحفاظ على ثبات الشخصيات واستمرارية الملابس والإكسسوارات.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">إضاءة درامية</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">ألوان سينمائية</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">استمرارية اللقطات</span>
                </div>
              </div>
            </div>
          </div>

          {/* DIVISION 2: Storytelling Card */}
          <div
            onClick={() => setAdType("storytelling")}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
              adType === "storytelling"
                ? isDarkMode 
                  ? "border-purple-400 bg-purple-900/40 shadow-[0_0_25px_rgba(168,85,247,0.3)]" 
                  : "border-purple-500 bg-purple-50 shadow-lg"
                : `${themeCardClass} opacity-70 hover:opacity-100`
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all"></div>
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${adType === "storytelling" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                <Megaphone className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">قصة درامية (Storytelling)</h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  يركز على سرد قصصي قصير ومؤثر (بداية، عقدة، نهاية) بمشاعر إنسانية غنية تدمج المنتج كعنصر محوري عائلي، مع ملامح شخصيات عربية أو مصرية معاصرة أنيقة وبيئات تتماشى مع طبيعة بلد المنتج.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">بداية وعقدة ونهاية</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">مشاعر مصرية/عربية</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">قصة عائلية</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* WORKSPACE & SETTINGS - INPUTS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* RIGHT 2 COLUMNS: NOTES, CAMPAIGN NAME & PRODUCT MEDIA (RIGHT SIDE) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. NOTES INPUT - FIRST */}
            <div className={`${themeCardClass} p-6 rounded-3xl border border-opacity-40 flex flex-col`}>
              <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Smile className="w-6 h-6 text-blue-400" />
                <span>توجيهات وملاحظات العميل</span>
              </h4>
              <p className="text-sm text-slate-400 mb-3">
                اكتب أي تفاصيل إضافية تريدها في إعلانك (مثل التركيز على لمعان الزجاج، تفاصيل الديكور، إلخ).
              </p>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className={`flex-1 w-full p-4 rounded-2xl border resize-none focus:outline-none min-h-[140px] text-lg ${themeInputClass}`}
                placeholder="مثال: يرجى إبراز لون القهوة الداكن المتطاير مع البخار، وتصوير حركة الكاميرا من أسفل الفنجان لتظهر الهيبة والفخامة..."
              />
            </div>

            {/* 2. Project Name Header - SECOND */}
            <div className={`${themeCardClass} p-6 rounded-3xl border border-opacity-40`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="w-full">
                  <label className="block text-lg font-semibold text-purple-300 mb-1">اسم حملتك الإعلانية:</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className={`w-full text-xl font-bold p-3 rounded-xl border ${themeInputClass}`}
                    placeholder="مثال: حملة عطر الصحراء الدافئ، إعلان قهوة الأساطير..."
                  />
                </div>
              </div>
            </div>

            {/* 3. UPLOAD ZONE - THIRD */}
            <div className={`${themeCardClass} p-6 rounded-3xl border border-opacity-40 flex flex-col`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-6 h-6 text-purple-400" />
                  <span>صور وفيديوهات المنتج</span>
                </h4>
                {uploadedImages.length > 0 && (
                  <button
                    onClick={() => setUploadedImages([])}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الكل</span>
                  </button>
                )}
              </div>

              {/* Drag & Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-purple-400 bg-purple-500/10 scale-[0.98]"
                    : "border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => processFiles(e.target.files)}
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                />
                <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10" />
                </div>
                <span className="text-xl font-bold text-white mb-2">ارمي الصورة أو الفيديو هنا</span>
                <span className="text-sm text-slate-400">تدعم سحب وإفلات عدة ملفات لتفاصيل منتجك</span>
              </div>

              {/* Thumbnails list with delete buttons */}
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1">
                  {uploadedImages.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-purple-500/30 group">
                      <img src={src} alt="Product Thumbnail" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600 rounded-lg text-white hover:bg-red-500 opacity-90 transition-opacity cursor-pointer shadow-md"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* LEFT COLUMN: PARAMETERS & STYLE TRANSFER CONFIGS (LEFT SIDE) */}
          <div className="space-y-6">
            
            {adType === "cinematic" ? (
              // Cinematic Settings
              <div className={`${themeCardClass} p-6 rounded-3xl border border-opacity-40 space-y-4`}>
                <h4 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  <Film className="w-6 h-6" />
                  <span>طابع وإخراج الفيلم الإعلاني</span>
                </h4>
                <p className="text-md text-slate-300">
                  اختر تيمة المخرج المفضلة لديك والتي تناسب طبيعة منتجك:
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "أكشن وإثارة مذهلة",
                    "أفلام بوليسية ومطاردات",
                    "رومانسية وشاعرية حالمة",
                    "جيمس بوند والأناقة الغامضة",
                    "بساطة معاصرة فاخرة",
                    "خيال علمي ومستقبل مبهر"
                  ].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setCinematicTheme(theme)}
                      className={`p-3 rounded-xl text-md text-right font-medium transition-all cursor-pointer border ${
                        cinematicTheme === theme
                          ? "bg-purple-600/20 border-purple-500 text-purple-300 font-bold"
                          : "border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 text-slate-400"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>

                {/* External link feature for style transfer / mimicking */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="block text-lg font-bold text-white flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-purple-400" />
                    <span>محاكاة نمط خارجي (لينك فيلم)</span>
                  </label>
                  <p className="text-sm text-slate-400">
                    أدخل رابط أي فيلم أو إعلان على يوتيوب لمحاكاة الطابع الشكلي، الإضاءة، وحركة الكاميرا منه:
                  </p>
                  <input
                    type="url"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-md ${themeInputClass}`}
                    placeholder="مثال: https://youtube.com/watch?v=..."
                  />
                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={setDemoLink}
                      className="text-xs text-purple-300 hover:text-purple-200 underline cursor-pointer"
                    >
                      جرب رابط عينة سينمائية
                    </button>
                    {externalLink && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>سيتم تحليل الطابع الشكلي</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Storytelling Settings
              <div className={`${themeCardClass} p-6 rounded-3xl border border-opacity-40 space-y-4`}>
                <h4 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                  <Megaphone className="w-6 h-6" />
                  <span>معايير القصة الدرامية المصرية والعربية</span>
                </h4>
                
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                    <span className="text-md font-bold text-white flex items-center gap-1.5">
                      <User className="w-5 h-5 text-blue-300" />
                      ملامح الشخصيات:
                    </span>
                    <p className="text-md text-slate-300">
                      ملامح مصرية أو عربية أصيلة معاصرة تتماشى مع وقار العائلة ورجال الأعمال، خالية تماماً من الرسوم الفرعونية أو التماثيل الكرتونية.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                    <span className="text-md font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-5 h-5 text-blue-300" />
                      طبيعة البيئة والمكان:
                    </span>
                    <p className="text-md text-slate-300">
                      يتم تكييف البيئة (سواء كانت منزلاً عائلياً دافئاً، قصرًا حديثًا، أو شقة عصرية تطل على النيل) تلقائياً بناءً على طبيعة المنتج والمجموعة المستهدفة.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                    <span className="text-md font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-5 h-5 text-blue-300" />
                      البناء السردي:
                    </span>
                    <p className="text-md text-slate-300">
                      يتم تفصيل بداية تجذب الانتباه، وعقدة إنسانية تبرز الاحتياج، وحل يدمج منتجك بأسلوب احترافي لإبراز الختام.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick action info */}
            <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 text-sm text-yellow-300">
              <span className="font-bold block mb-1">💡 نصيحة ذكية:</span>
              بعد رفع الصورة، يمكنك ضبط الملاحظات الإضافية وتحديد الطابع الفني والسينمائي لمنتجك، ثم النقر على الزر العريض أدناه لبدء التوليد والتحليل السينمائي المبتكر بذكاء!
            </div>

          </div>

        </div>

        {/* REVERSE ANALYSIS TRIGGER BUTTON - Big full-width button */}
        <div className="mb-10">
          <button
            onClick={() => triggerAnalysis()}
            disabled={isAnalyzing || uploadedImages.length === 0}
            className={`w-full py-5 rounded-3xl font-extrabold text-2xl transition-all duration-300 flex items-center justify-center gap-4 cursor-pointer relative overflow-hidden ${
              uploadedImages.length === 0
                ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-700 text-white font-black hover:scale-[1.01] shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري معالجة التحليل العكسي بهندسة هوليوود...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-8 h-8 text-yellow-300 fill-yellow-400 animate-bounce" />
                <span>تنفيذ التحليل العكسي وابتكار برومبت الإعلان الكامل</span>
              </>
            )}
          </button>

          {/* PROGRESS PULSE BAR - requirement "شريط الحالة أنيميشن نبض أثناء عملية التحليل" */}
          {isAnalyzing && (
            <div className="mt-4 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-center">
              <div className="flex justify-between text-lg text-purple-300 font-bold mb-2">
                <span>{progressMessage}</span>
                <span className="animate-pulse">جاري التحليل...</span>
              </div>
              <div className="w-full bg-black/40 h-4 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-[pulse_1.5s_infinite] rounded-full w-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* RESULTS AREA */}
        {currentResult ? (
          <div className="space-y-5">
            
            {/* Header of results & Quick Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-blue-900/20 via-black/40 to-purple-900/20 border border-white/10 shadow-xl">
              <div>
                <h3 className="text-2xl font-extrabold text-white mb-1">النتائج وسيناريو الإعلان المبتكر</h3>
                <p className="text-md text-slate-300">تم التوليد ومحاكاة أكبر استوديوهات الإعلانات في العالم بـ 15 مشهداً دقيقاً.</p>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {/* Aggregate copy button */}
                <button
                  onClick={copyAllCombinedScenes}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-md transition-all hover:scale-105 cursor-pointer"
                  title="نسخ كافة المشاهد مجمعة مع النيجاتيف برومبت"
                >
                  {copiedAll ? <Check className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5" />}
                  <span>نسخ المشاهد مجمعة</span>
                </button>

                {/* Word export button */}
                <button
                  onClick={handleSaveProjectFile}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg shadow-md transition-all hover:scale-105 cursor-pointer"
                  title="تصدير إلى ملف وورد قابل للتعديل"
                >
                  <Download className="w-6 h-6" />
                  <span>تصدير (.docx)</span>
                </button>

                {/* Soundtrack download button */}
                <button
                  onClick={downloadCinematicSoundtrack}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg shadow-md transition-all hover:scale-105 cursor-pointer"
                  title="تحميل الموسيقى التصويرية المخصصة للإعلان (دقيقة ونصف)"
                >
                  <Music className="w-5 h-5 animate-bounce" />
                  <span>تحميل موسيقى الإعلان</span>
                </button>

                {/* Cinema presentation simulation button */}
                <button
                  onClick={() => {
                    setIsCinemaModalOpen(true);
                    setCurrentCinemaSceneIdx(0);
                    setIsPlayingCinema(true);
                    startRealtimeCinemaSynth();
                  }}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-lg shadow-md transition-all hover:scale-105 cursor-pointer"
                  title="توليد المشاهد المجمعة بموسيقى"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>توليد المشاهد بموسيقى</span>
                </button>
              </div>
            </div>

            {/* 1. اسم المنتج بخط كبير بدون أي مستطيل عليه */}
            <div className="text-center py-6 relative z-10">
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${
                isDarkMode 
                  ? "from-white via-blue-200 to-purple-300" 
                  : "from-[#000040] via-indigo-900 to-blue-800"
              } tracking-tight drop-shadow-md leading-tight`}>
                {projectName}
              </h2>
            </div>

            {/* بيانات ومكونات المنتج المستخرج في كرت أنيق منفصل */}
            <div className={`${themeCardClass} p-5 rounded-3xl border border-opacity-40 space-y-3 shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {/* بيانات المنتج المستخرج */}
                <div className="bg-black/25 p-4 rounded-2xl border border-white/5 space-y-1">
                  <h4 className="text-lg font-bold text-blue-300 flex items-center gap-1.5">
                    <span className="text-xl">📋</span>
                    <span>بيانات المنتج المستخرج</span>
                  </h4>
                  <p className="text-md text-slate-200 leading-relaxed">
                    {currentResult.productAnalysis.visualDescription}
                  </p>
                </div>

                {/* مكونات المنتج المستخرج */}
                <div className="bg-black/25 p-4 rounded-2xl border border-white/5 space-y-1">
                  <h4 className="text-lg font-bold text-purple-300 flex items-center gap-1.5">
                    <span className="text-xl">🧪</span>
                    <span>مكونات وعناصر المنتج المستخرج (Elements)</span>
                  </h4>
                  <p className="text-md text-slate-200 leading-relaxed">
                    {currentResult.reversePrompt.elements}
                  </p>
                </div>
              </div>
            </div>

            {/* 1.5. توجيهات ومدرسة الإخراج المستوحاة من يوتيوب لمنتجك */}
            {(() => {
              const school = getAppliedYoutubeSchool();
              return (
                <div className={`${themeCardClass} p-6 rounded-3xl border border-yellow-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/40 via-indigo-950/20 to-black/60`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-2xl">
                          <Film className="w-6 h-6 animate-pulse" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest block">مدرستك السينمائية المفضلة</span>
                          <h4 className="text-xl font-extrabold text-white mt-0.5">{school.title}</h4>
                        </div>
                      </div>
                      <a
                        href={`https://www.youtube.com/watch?v=${school.ref}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="self-start sm:self-center text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>مشاهدة الفيديو المرجعي</span>
                      </a>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {school.description} تم محاكاة هندسة هذه اللقطات وموازنتها بدقة متناهية مع شكل وطبيعة منتجك في المشاهد الـ 15 لتخرج بأعلى جودة بصرية وصوتية:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* الإخراج والعدسات */}
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5 text-blue-300 font-bold text-sm">
                          <Video className="w-4 h-4 shrink-0 text-blue-400" />
                          <span>طريقة الإخراج وحركة الكاميرا</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{school.directing}</p>
                      </div>

                      {/* المونتاج والسرعة */}
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5 text-purple-300 font-bold text-sm">
                          <Layers className="w-4 h-4 shrink-0 text-purple-400" />
                          <span>طريقة المونتاج وتلاعب السرعة (Speed Ramping)</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{school.editing}</p>
                      </div>

                      {/* الإضاءة والتدرج */}
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
                          <Sun className="w-4 h-4 shrink-0 text-amber-400" />
                          <span>طريقة الإضاءة والتدرج اللوني</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{school.lighting}</p>
                      </div>

                      {/* هندسة الصوت والمؤثرات */}
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-sm">
                          <Volume2 className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>هندسة الصوت والمؤثرات البيئية الفائقة</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{school.sound}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. عناصر استخراج البرومبت بعرض المنصة */}
            <div className={`${themeCardClass} rounded-3xl border border-opacity-40 overflow-hidden shadow-2xl transition-all duration-300`}>
              <button
                onClick={() => setIsPlatformsExpanded(!isPlatformsExpanded)}
                className="w-full p-5 flex items-center justify-between gap-4 text-right cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h4 className="text-xl font-extrabold text-white">عناصر استخراج البرومبت المخصصة للمنصات العالمية</h4>
                </div>
                {isPlatformsExpanded ? (
                  <ChevronUp className="w-6 h-6 text-slate-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-slate-400 animate-pulse" />
                )}
              </button>

              {isPlatformsExpanded && (
                <div className="p-5 pt-0 border-t border-white/5 space-y-4">
                  <p className="text-sm text-slate-300 mt-3">
                    لقد قمنا بتصميم وصياغة برومبت بطل مجمع يبرز فخامة المنتج ومخصص لكل محرك ذكاء اصطناعي حسب دقة المعاملات ونقاط القوة بعرض المنصة بالكامل:
                  </p>

                  <div className="space-y-3 pt-1">
                    {/* Seedance 2.0 */}
                    <div className="bg-blue-950/20 p-4 rounded-2xl border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <span className="text-md font-bold text-blue-300 block">Seedance 2.0 (أحدث منصات هندسة الإعلان)</span>
                        <p className="font-mono text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/10 break-words text-left direction-ltr">
                          {currentResult.customizedPlatforms.seedance}
                        </p>
                      </div>
                      <button
                        onClick={() => copyPlatformPrompt("seedance", currentResult.customizedPlatforms.seedance)}
                        className="w-full md:w-56 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-md flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 self-end md:self-center"
                      >
                        {copiedPlatform === "seedance" ? <Check className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5" />}
                        <span>نسخ برومبت Seedance</span>
                      </button>
                    </div>

                    {/* Midjourney */}
                    <div className="bg-purple-950/20 p-4 rounded-2xl border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <span className="text-md font-bold text-purple-300 block">Midjourney v6.0 (الصور الإعلانية عالية الجودة)</span>
                        <p className="font-mono text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/10 break-words text-left direction-ltr">
                          {currentResult.customizedPlatforms.midjourney}
                        </p>
                      </div>
                      <button
                        onClick={() => copyPlatformPrompt("midjourney", currentResult.customizedPlatforms.midjourney)}
                        className="w-full md:w-56 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-md flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 self-end md:self-center"
                      >
                        {copiedPlatform === "midjourney" ? <Check className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5" />}
                        <span>نسخ برومبت Midjourney</span>
                      </button>
                    </div>

                    {/* Sora */}
                    <div className="bg-yellow-950/10 p-4 rounded-2xl border border-yellow-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <span className="text-md font-bold text-yellow-300 block">Sora OpenAI (توليد الفيديوهات السينمائية الفائقة)</span>
                        <p className="font-mono text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/10 break-words text-left direction-ltr">
                          {currentResult.customizedPlatforms.sora}
                        </p>
                      </div>
                      <button
                        onClick={() => copyPlatformPrompt("sora", currentResult.customizedPlatforms.sora)}
                        className="w-full md:w-56 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-md flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 self-end md:self-center"
                      >
                        {copiedPlatform === "sora" ? <Check className="w-5 h-5 text-green-800" /> : <Copy className="w-5 h-5" />}
                        <span>نسخ برومبت Sora</span>
                      </button>
                    </div>

                    {/* Runway */}
                    <div className="bg-pink-950/10 p-4 rounded-2xl border border-pink-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <span className="text-md font-bold text-pink-300 block">Runway Gen-3 (التحكم الإبداعي وتأثيرات الكاميرا)</span>
                        <p className="font-mono text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/10 break-words text-left direction-ltr">
                          {currentResult.customizedPlatforms.runway}
                        </p>
                      </div>
                      <button
                        onClick={() => copyPlatformPrompt("runway", currentResult.customizedPlatforms.runway)}
                        className="w-full md:w-56 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-md flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 self-end md:self-center"
                      >
                        {copiedPlatform === "runway" ? <Check className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5" />}
                        <span>نسخ برومبت Runway Gen-3</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. المشاهد بترتيبها مباشرة أسفله */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <Film className="w-7 h-7 text-purple-400" />
                  <span>سيناريو الإعلان المفصل (15 مشهداً احترافياً)</span>
                </h4>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 font-bold text-md border border-purple-500/20">
                  إجمالي مدة العرض: 73 ثانية
                </span>
              </div>

              <div className="space-y-3">
                {currentResult.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      scene.id === 1
                        ? "border-yellow-500/40 bg-gradient-to-r from-[#171610] via-[#241e12] to-[#121c2c] relative"
                        : scene.id === 15
                        ? "border-green-500/40 bg-gradient-to-r from-[#12241b] via-[#101724] to-[#111124] relative"
                        : `${themeCardClass}`
                    }`}
                  >
                    
                    {/* Scene Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-lg font-black px-3 py-1 rounded-xl ${
                          scene.id === 1
                            ? "bg-yellow-500 text-slate-950"
                            : scene.id === 15
                            ? "bg-green-500 text-slate-950"
                            : "bg-purple-600 text-white"
                        }`}>
                          المشهد {scene.id}
                        </span>
                        <div>
                          <h5 className="text-lg font-black text-white">{scene.title}</h5>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {scene.id === 1 && (
                          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            🔥 مشهد الخطاف (The Hook)
                          </span>
                        )}
                        {scene.id === 15 && (
                          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                            👑 لقطة جمالية (Hero & Logo)
                          </span>
                        )}
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                          المدة: {scene.duration}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Long Rectangular Centered Copy Button */}
                    <div className="flex justify-center mb-4">
                      <button
                        onClick={() => copyScenePrompt(scene)}
                        className={`w-full max-w-md py-2.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer transform hover:scale-[1.02] border active:scale-[0.98] ${
                          copiedSceneId === scene.id
                            ? "bg-green-600 hover:bg-green-500 text-white border-green-500 shadow-green-500/20"
                            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white border-indigo-500/30 shadow-indigo-500/35"
                        }`}
                        title="نسخ كامل تفاصيل المشهد والبرومبت"
                      >
                        {copiedSceneId === scene.id ? (
                          <>
                            <Check className="w-5 h-5 text-green-200 stroke-[3]" />
                            <span>تم نسخ المشهد {scene.id} بنجاح!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 animate-pulse text-blue-200" />
                            <span>نسخ سيناريو وبرومبت المشهد {scene.id}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* شرح المشهد بالعربي وجمالياته */}
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-0.5 mb-2.5">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                        <span>شرح المشهد بالعربي وجمالياته:</span>
                      </span>
                      <p className="text-md text-slate-100 font-bold leading-relaxed">
                        {scene.arabicDescription || "شرح وتفاصيل لقطة المنتج الإعلانية والجماليات السينمائية المقترحة بالتكامل مع الهوية الإعلانية للعلامة التجارية."}
                      </p>
                    </div>

                    {/* Scene Specific Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2.5">
                      <div className="p-3 rounded-xl bg-slate-950/20 border border-slate-800 space-y-0.5">
                        <span className="text-xs font-bold text-slate-400 block">حركة الكاميرا وتأثير المونتاج:</span>
                        <p className="text-sm text-slate-200 leading-relaxed">{scene.cameraMovement}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/20 border border-slate-800 space-y-0.5">
                        <span className="text-xs font-bold text-slate-400 block">الإضاءة وتناسق الألوان:</span>
                        <p className="text-sm text-slate-200 leading-relaxed">{scene.lightingStyle}</p>
                      </div>
                    </div>

                    {/* Prompts container */}
                    <div className="space-y-2.5">
                      <div>
                        <span className="text-xs font-bold text-purple-300 block mb-1">برومبت التوليد البصري (Visual Prompt):</span>
                        <p className="font-mono text-[12px] md:text-xs text-slate-100 bg-slate-950/80 p-3 rounded-xl border border-slate-800 break-words text-left direction-ltr">
                          {scene.prompt}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-red-400 block mb-1">البرومبت السلبي (Negative Prompt):</span>
                        <p className="font-mono text-[11px] md:text-[12px] text-red-200 bg-red-950/20 p-2.5 rounded-xl border border-red-900/30 break-words text-left direction-ltr">
                          {scene.negativePrompt}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* 4. تحليل المقاييس والتفاصيل السينمائية أسفل المشاهد */}
            <div className={`${themeCardClass} p-5 rounded-3xl border border-opacity-40 space-y-3 shadow-2xl`}>
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Video className="w-6 h-6 text-purple-400" />
                <h4 className="text-xl font-extrabold text-white">الخصائص الفنية والسينمائية والجمهور المستهدف</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* النمط البصري */}
                <div className="bg-black/25 p-3.5 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-xs font-bold text-purple-300 block">النمط البصري (Art Style):</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentResult.reversePrompt.artStyle}</p>
                </div>

                {/* الإضاءة */}
                <div className="bg-black/25 p-3.5 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-xs font-bold text-blue-300 block">الإضاءة والظلال:</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentResult.reversePrompt.lighting}</p>
                </div>

                {/* أدوات التصوير والعدسة */}
                <div className="bg-black/25 p-3.5 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-xs font-bold text-green-300 block">أدوات التصوير والعدسة والبعد البؤري المقترح:</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentResult.reversePrompt.lensAndCamera}</p>
                </div>

                {/* تحليل الرؤية الحاسوبية للمنتج */}
                <div className="bg-black/25 p-3.5 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-xs font-bold text-yellow-300 block">تحليل الرؤية الحاسوبية للمنتج:</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentResult.productAnalysis.visualDescription}</p>
                </div>

                {/* المزاج المقترح للإعلان */}
                <div className="bg-black/25 p-3.5 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-xs font-bold text-orange-300 block">المزاج المقترح للإعلان:</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentResult.productAnalysis.suggestedMood}</p>
                </div>

                {/* الفئة والجمهور */}
                <div className="bg-black/25 p-3.5 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-xs font-bold text-indigo-300 block">الفئة والجمهور المستهدف:</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentResult.productAnalysis.targetAudience}</p>
                </div>

                {/* السياق والشخصيات العربية */}
                <div className="bg-black/25 p-3.5 rounded-xl border border-white/5 col-span-1 md:col-span-2 space-y-0.5">
                  <span className="text-xs font-bold text-pink-300 block">السياق والشخصيات العربية والمصرية المقترحة:</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentResult.productAnalysis.egyptianArabContext}</p>
                </div>

                {/* اقتراحات تحسين البرومبت */}
                <div className="bg-purple-950/20 p-3.5 rounded-xl border border-purple-500/20 col-span-1 md:col-span-2 space-y-0.5">
                  <span className="text-xs font-bold text-purple-300 block">اقتراحات تحسين البرومبت (Smart Enhancements):</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentResult.smartEnhancements}</p>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* Empty / Initial State */
          <div className={`${themeCardClass} p-12 rounded-3xl border border-opacity-40 text-center space-y-6`}>
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
              <Film className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-white mb-2">أستوديو "فيلم إعلاني" في انتظار منتجك</h4>
              <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
                قم بسحب وإفلات صورة أو فيديو المنتج في منطقة التحميل، واكتب ملاحظاتك واضغط على زر التحليل لابتكار خطة سينمائية ساحرة فوراً.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* HIDDEN HISTORY DRAWER ("قائمة مختبئة وغير ظاهرة") */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Overlay background */}
          <div
            onClick={() => setIsHistoryOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-[#000040] border-l border-white/20 text-white flex flex-col h-full shadow-2xl z-10 p-6 animate-[slideInLeft_0.3s_ease-out]">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <History className="w-7 h-7 text-blue-400" />
                <span>أرشيف إعلانات المنتجات</span>
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* List of projects */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {savedProjects.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <p>لا توجد منتجات محفوظة حالياً.</p>
                  <p className="text-xs">سيتم حفظ أي منتج تقوم بتحليله تلقائياً هنا للرجوع إليه.</p>
                </div>
              ) : (
                savedProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => loadProject(project)}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition-all cursor-pointer relative group flex items-start gap-3"
                  >
                    {/* Thumbnail if available */}
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt="Project mini thumbnail"
                        className="w-16 h-16 object-cover rounded-lg border border-purple-500/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <Film className="w-6 h-6" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-purple-400 block mb-1">
                        {project.adType === "cinematic" ? "إعلان سينمائي" : "قصة درامية"}
                      </span>
                      <h4 className="text-lg font-bold text-white truncate mb-1">{project.projectName}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{project.timestamp}</span>
                      </p>
                    </div>

                    {/* Delete button from history */}
                    <button
                      onClick={(e) => deleteProjectFromHistory(project.id, e)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer self-center"
                      title="حذف من الأرشيف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 pt-4 mt-6 text-center text-xs text-slate-500">
              انقر فوق أي منتج لاسترجاع كامل سيناريوهات المشاهد وجميع الإعدادات تلقائياً.
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-800 border-opacity-40 py-8 text-center text-sm text-slate-400 pb-16">
        <div className="max-w-7xl mx-auto px-4 space-y-2 text-md">
          <p>© 2026 "فيلم إعلاني" - منصة ابتكار الإعلانات السينمائية الاحترافية عبر أقوى تقنيات الرؤية الحاسوبية.</p>
          <p className="text-xs text-slate-500">مبني ومحسّن خصيصاً لمساعدة صناع الإعلانات في العالم العربي بمحاكاة استوديوهات هوليود الكبرى.</p>
        </div>
      </footer>

      {/* SIDE FLOATING TAB - PROJECTS HISTORY */}
      <button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed top-1/2 left-0 -translate-y-1/2 w-8 h-32 bg-blue-600 hover:bg-blue-500 rounded-r-xl flex items-center justify-center cursor-pointer hover:w-10 transition-all z-40 shadow-[0_0_15px_rgba(37,99,235,0.4)] group border-r border-t border-b border-white/20"
        title="مشاريع سابقة"
      >
        <span className="rotate-90 text-[10px] font-bold text-white whitespace-nowrap tracking-widest block transform -translate-x-0.5">
          مشاريع سابقة
        </span>
      </button>

      {/* INTERACTIVE CINEMATIC PRESENTATION WITH SYNTHESIZED SOUNDTRACK */}
      {isCinemaModalOpen && currentResult && (
        <div className="fixed inset-0 z-50 bg-[#000020]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="w-full max-w-5xl bg-gradient-to-b from-[#0a0f2d] to-[#040618] border border-white/20 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.2)] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 animate-pulse">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">العرض السينمائي المدمج لـ: {projectName}</h3>
                  <p className="text-xs text-slate-400">دمج تلقائي للمشاهد الـ 15 المبتكرة مع الموسيقى التصويرية الحية</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCinemaModalOpen(false);
                  setIsPlayingCinema(false);
                  stopRealtimeCinemaSynth();
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 lg:p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Active Screen / Film simulation panel (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Virtual Cinema Screen */}
                <div className="relative aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner text-center">
                  
                  {/* Subtle Scanline Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-black/20 pointer-events-none"></div>
                  
                  {/* Scene ID Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-lg">
                    المشهد {currentCinemaSceneIdx + 1} / 15
                  </div>

                  {/* Audio visualization visualizer overlay if playing */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 border border-white/10">
                    <Volume2 className={`w-4 h-4 text-emerald-400 ${isPlayingCinema ? "animate-bounce" : ""}`} />
                    <span className="text-[10px] font-mono text-slate-300">موسيقى سينمائية نشطة</span>
                    <div className="flex gap-0.5 items-end h-3">
                      <div className={`w-0.5 bg-emerald-400 rounded-full h-2 ${isPlayingCinema ? "animate-[pulse_0.6s_infinite_alternate]" : ""}`}></div>
                      <div className={`w-0.5 bg-emerald-400 rounded-full h-3 ${isPlayingCinema ? "animate-[pulse_0.4s_infinite_alternate]" : ""}`}></div>
                      <div className={`w-0.5 bg-emerald-400 rounded-full h-1.5 ${isPlayingCinema ? "animate-[pulse_0.8s_infinite_alternate]" : ""}`}></div>
                    </div>
                  </div>

                  {/* Simulated Visual Content */}
                  <div className="space-y-4 max-w-lg z-10">
                    <span className="text-xs font-bold text-amber-400 tracking-wider block uppercase">
                      {currentResult.scenes[currentCinemaSceneIdx].duration} | {currentResult.scenes[currentCinemaSceneIdx].title}
                    </span>
                    <p className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed drop-shadow-md">
                      {currentResult.scenes[currentCinemaSceneIdx].arabicDescription}
                    </p>
                    <div className="text-xs font-mono text-slate-400 bg-black/40 p-3 rounded-xl border border-white/5 line-clamp-3 overflow-hidden text-left direction-ltr">
                      {currentResult.scenes[currentCinemaSceneIdx].prompt}
                    </div>
                  </div>
                </div>

                {/* Presentation Controls */}
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                  
                  {/* Prev Button */}
                  <button
                    onClick={() => {
                      setCurrentCinemaSceneIdx((prev) => (prev > 0 ? prev - 1 : 14));
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
                    title="المشهد السابق"
                  >
                    السابق
                  </button>

                  {/* Play/Pause Button */}
                  <button
                    onClick={() => {
                      setIsPlayingCinema(!isPlayingCinema);
                      if (!isPlayingCinema && !synthAudioContext) {
                        startRealtimeCinemaSynth();
                      }
                    }}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {isPlayingCinema ? (
                      <>
                        <Pause className="w-5 h-5 fill-slate-950" />
                        <span>إيقاف مؤقت للفيلم</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-slate-950" />
                        <span>بدء التشغيل التلقائي</span>
                      </>
                    )}
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      setCurrentCinemaSceneIdx((prev) => (prev < 14 ? prev + 1 : 0));
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
                    title="المشهد التالي"
                  >
                    التالي
                  </button>

                </div>

              </div>

              {/* Scene Details Panel (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                
                <div className="space-y-4">
                  
                  {/* Audio rules review */}
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                    <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>خلفية الإعلان الحالية (مؤثرات صوتية فقط)</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      جميع مشاهد السيناريو خالية تماماً من دمج أي ملفات موسيقى داخل تيكست البرومبت، مما يمنع تشويه اللقطة بموجات موسيقية مشوشة، ويركز بنسبة 100% على المؤثرات الصوتية والبيئية التفاعلية الهادفة لكل مشهد.
                    </p>
                  </div>

                  {/* Detail items */}
                  <div className="space-y-3">
                    
                    {/* Camera instruction */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-slate-400 block mb-1">حركة الكاميرا والعدسة:</span>
                      <p className="text-sm font-bold text-slate-200">
                        {currentResult.scenes[currentCinemaSceneIdx].cameraMovement}
                      </p>
                    </div>

                    {/* Lighting Style */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-slate-400 block mb-1">نمط الإضاءة والظلال السينمائية:</span>
                      <p className="text-sm font-bold text-slate-200">
                        {currentResult.scenes[currentCinemaSceneIdx].lightingStyle}
                      </p>
                    </div>

                    {/* Sound Effects Details */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-slate-400 block mb-1">المؤثر البصري والصوت المصاحب للمشهد (SFX):</span>
                      <p className="text-sm font-bold text-amber-300">
                        مؤثرات صوتية سينمائية محيطية متزامنة مع حركة الكاميرا والمنتج وبدون موسيقى مدمجة.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  
                  {/* Download Audio File direct button */}
                  <button
                    onClick={downloadCinematicSoundtrack}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Music className="w-5 h-5 animate-pulse" />
                    <span>تحميل الموسيقى الخاصة بالإعلان (دقيقة ونصف)</span>
                  </button>

                  <button
                    onClick={() => {
                      copyScenePrompt(currentResult.scenes[currentCinemaSceneIdx]);
                    }}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Copy className="w-5 h-5" />
                    <span>نسخ برومبت المشهد {currentCinemaSceneIdx + 1}</span>
                  </button>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* FOOTER ENGINE/STATUS BAR FROM DESIGN HTML */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-black/60 backdrop-blur-sm flex items-center px-6 gap-6 text-[10px] uppercase tracking-widest text-slate-300 z-40 border-t border-white/10 font-mono">
        <span>Engine: Seedance 2.0 / Sora</span>
        <span>Vision: Computer Vision V4</span>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
          <span>Status: Studio Ready</span>
        </div>
      </div>

    </div>
  );
}
