export interface Scene {
  id: number;
  title: string;
  duration: string;
  prompt: string;
  negativePrompt: string;
  cameraMovement: string;
  lightingStyle: string;
  arabicDescription: string;
}

export interface AnalysisResult {
  productAnalysis: {
    suggestedProductName: string;
    visualDescription: string;
    suggestedMood: string;
    targetAudience: string;
    egyptianArabContext: string;
  };
  reversePrompt: {
    elements: string;
    lighting: string;
    lensAndCamera: string;
    artStyle: string;
  };
  cameraMotion: string;
  smartEnhancements: string;
  scenes: Scene[];
  customizedPlatforms: {
    seedance: string;
    midjourney: string;
    sora: string;
    runway: string;
  };
}

export interface SavedProject {
  id: string;
  projectName: string;
  timestamp: string;
  notes: string;
  externalLink?: string;
  adType: "cinematic" | "storytelling";
  cinematicTheme?: string;
  result: AnalysisResult;
  images: string[];
}
