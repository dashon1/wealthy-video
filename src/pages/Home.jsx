import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, History, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import GeneratorForm from "@/components/generator/GeneratorForm";
import JsonPreview from "@/components/generator/JsonPreview";
import TemplateHistory from "@/components/generator/TemplateHistory";
import VideoGenerator from "@/components/generator/VideoGenerator";

const defaultFormData = {
  topic: "",
  keywords: "",
  angle: "",
  audience: "",
  platform: "youtube_longform",
  targetMinutes: 12,
  tone: "documentary",
  voiceModel: "azure",
  voiceName: "en-US-JennyNeural",
  channelHandle: "@yourhandle",
  ctaLine: "Follow for Part 2 • Save • Share",
  bgMusicUrl: "",
  visualStylePrompt: "",
  brollMode: "prompt_only",
  brollUrls: "",
  complianceMode: "general"
};

export default function Home() {
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.Template.list("-created_date", 20),
    refetchInterval: 3000
  });

  // Auto-select the first completed template if none selected
  useEffect(() => {
    if (!selectedTemplate && templates.length > 0) {
      const firstCompleted = templates.find(t => t.status === "completed" && t.json_output);
      if (firstCompleted) {
        setSelectedTemplate(firstCompleted);
      }
    }
  }, [templates, selectedTemplate]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Template.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Template.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
    }
  });

  const generateTemplate = async () => {
    if (!formData.topic) return;
    setIsGenerating(true);

    // Create a placeholder template
    const templateRecord = await createMutation.mutateAsync({
      title: formData.topic,
      topic: formData.topic,
      keywords: formData.keywords,
      platform: formData.platform,
      target_minutes: formData.targetMinutes,
      status: "generating",
      json_output: ""
    });

    try {
      const prompt = buildPrompt(formData);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      // Parse if it's a string, otherwise stringify directly
      let jsonOutput;
      let parsedJson;
      if (typeof response === 'string') {
        // Try to extract JSON if wrapped in markdown
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : response;
        // Validate it's proper JSON
        parsedJson = JSON.parse(jsonStr);
      } else {
        parsedJson = response;
      }

      // CRITICAL FIX: Replace "name" with "comment" in all scenes
      if (parsedJson.scenes && Array.isArray(parsedJson.scenes)) {
        parsedJson.scenes = parsedJson.scenes.map(scene => {
          if (scene.name) {
            const { name, ...rest } = scene;
            return { comment: name, ...rest };
          }
          return scene;
        });
      }

      jsonOutput = JSON.stringify(parsedJson, null, 2);

      await updateMutation.mutateAsync({
        id: templateRecord.id,
        data: {
          json_output: jsonOutput,
          status: "completed"
        }
      });

      setSelectedTemplate({
        ...templateRecord,
        json_output: jsonOutput,
        status: "completed"
      });

    } catch (error) {
      await updateMutation.mutateAsync({
        id: templateRecord.id,
        data: {
          status: "failed",
          json_output: JSON.stringify({ error: error.message })
        }
      });
    }

    setIsGenerating(false);
  };

  const buildPrompt = (data) => {
    return `You are a JSON2Video template + script generator.
Your job: generate a complete, production-ready JSON2Video JSON for a ${data.targetMinutes}-minute viral longform video using the structure: HOOK → ROADMAP → MAIN BODY (iterate segments) → OUTRO.

INPUTS:
- TOPIC: ${data.topic}
- KEYWORDS: ${data.keywords || "none specified"}
- ANGLE / BIG CLAIM: ${data.angle || "generate a compelling angle"}
- AUDIENCE: ${data.audience || "general audience"}
- PLATFORM: ${data.platform}
- TARGET_MINUTES: ${data.targetMinutes}
- TONE: ${data.tone}
- VOICE_MODEL: ${data.voiceModel}
- VOICE_NAME: ${data.voiceName}
- CHANNEL_HANDLE: ${data.channelHandle}
- CTA_LINE: ${data.ctaLine}
- BG_MUSIC_URL: ${data.bgMusicUrl || "https://example.com/music.mp3"}
- VISUAL_STYLE_PROMPT: ${data.visualStylePrompt || "generate cinematic style matching the topic"}
- BROLL_MODE: ${data.brollMode}
${data.brollMode === "use_urls" ? `- BROLL_URLS: ${data.brollUrls.split("\n").filter(u => u.trim()).join(", ")}` : ""}
- COMPLIANCE_MODE: ${data.complianceMode}

⚠️ CRITICAL JSON2VIDEO REQUIREMENTS - READ CAREFULLY ⚠️

SCENES MUST USE "comment" NOT "name":
❌ WRONG: {"name": "HOOK", "duration": 12, "elements": [...]}
✅ CORRECT: {"comment": "HOOK scene", "duration": 12, "elements": [...]}

EVERY scene object MUST include "elements" array with actual content!
Do NOT generate placeholder scenes without elements!

REQUIRED OUTPUT STRUCTURE:
{
  "resolution": "1080x1920" for shorts/reels/tiktok or "1920x1080" for youtube_longform,
  "quality": "high",
  "draft": false,
  "variables": {
    "channel_handle": string,
    "title_main": string (HOOK headline),
    "title_sub": string (open loop promise),
    "series_tagline": string (roadmap line),
    "cta_line": string,
    "bg_music_url": string,
    "bg_music_volume": 0.25,
    "visual_style_prompt": string,
    "segments": [
      {
        "duration": number (10-12s each),
        "narration": string (~25-35 words for 10-12s),
        "on_screen": string (punchy, short caption),
        "broll_url": string (empty if not using URLs),
        "broll_seek": 0,
        "image_prompt": string (detailed prompt for AI image),
        "sfx_url": string (optional),
        "sfx_start": 0.2,
        "sfx_volume": 0.9,
        "pop_text": string (optional pattern interrupt)
      }
    ]
  },
  "elements": [
    {
      "type": "audio",
      "src": "{{bg_music_url}}",
      "volume": "{{bg_music_volume}}",
      "duration": -1
    },
    {
      "type": "text",
      "text": "{{channel_handle}}",
      "style": "watermark",
      "position": "bottom-right"
    },
    {
      "type": "subtitles",
      "settings": {
        "font": "Montserrat",
        "size": 48,
        "color": "#FFFFFF",
        "position": "center"
      }
    }
  ],
  "scenes": [
    {
      "comment": "HOOK scene - use comment NOT name",
      "duration": 12,
      "elements": [
        {
          "type": "image",
          "prompt": "{{title_main}} - dramatic cinematic scene, {{visual_style_prompt}}"
        },
        {
          "type": "text",
          "text": "{{title_main}}",
          "style": "title-large",
          "position": "center"
        },
        {
          "type": "text",
          "text": "{{title_sub}}",
          "style": "subtitle",
          "position": "bottom-center"
        }
      ]
    },
    {
      "comment": "ROADMAP scene - use comment NOT name",
      "duration": 10,
      "elements": [
        {
          "type": "text",
          "text": "{{series_tagline}}",
          "style": "title",
          "position": "center"
        }
      ]
    },
    {
      "comment": "MAIN_BODY scene - use comment NOT name",
      "iterate": "segments",
      "elements": [
        {
          "type": "image",
          "prompt": "{{image_prompt}}, {{visual_style_prompt}}"
        },
        {
          "type": "text",
          "text": "{{on_screen}}",
          "style": "caption-bold",
          "position": "center"
        },
        {
          "type": "audio",
          "tts": {
            "text": "{{narration}}",
            "voice": "${data.voiceName}",
            "model": "${data.voiceModel}"
          }
        }
      ]
    },
    {
      "comment": "OUTRO scene - use comment NOT name",
      "duration": 10,
      "elements": [
        {
          "type": "text",
          "text": "{{cta_line}}",
          "style": "title",
          "position": "center"
        }
      ]
    }
    ]
    }

    REMEMBER: Use "comment" in ALL scenes, NEVER "name"

CONTENT REQUIREMENTS:
1. HOOK must include curiosity gap + open loop
2. ROADMAP tells viewer what they'll learn
3. MAIN BODY needs ~${Math.ceil((data.targetMinutes * 60 - 32) / 11)} segments
4. Include pattern interrupts (pop_text) every 45-70 seconds
5. Add mini-recaps every ~2 minutes
6. OUTRO includes CTA + Part 2 tease

${data.complianceMode !== "general" ? `
COMPLIANCE: Add disclaimer: "${data.complianceMode === "health_education" ? "Educational only — not medical advice." : data.complianceMode === "finance_education" ? "Educational only — not financial advice." : "Educational only — not legal advice."}"
` : ""}

Generate a complete, engaging script that will captivate viewers for the full ${data.targetMinutes} minutes. Make narration conversational and punchy. On-screen text should be dramatic and scroll-stopping.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">JSON2Video Generator</h1>
                <p className="text-sm text-slate-400">Create viral longform video templates</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Template Configuration</h2>
              </div>
              <GeneratorForm
                formData={formData}
                setFormData={setFormData}
                onGenerate={generateTemplate}
                isGenerating={isGenerating}
              />
            </motion.div>

            {/* JSON Output */}
            {selectedTemplate && (
              <motion.div
                key={selectedTemplate.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <JsonPreview
                  jsonOutput={selectedTemplate.json_output || "{}"}
                  title={selectedTemplate.title || selectedTemplate.topic}
                />
                <VideoGenerator
                  template={selectedTemplate}
                  onUpdate={() => queryClient.invalidateQueries({ queryKey: ["templates"] })}
                />
              </motion.div>
            )}
          </div>

          {/* Right Column - History */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">History</h2>
            </div>
            <TemplateHistory
              templates={templates}
              onSelect={setSelectedTemplate}
              onDelete={(id) => deleteMutation.mutate(id)}
              selectedId={selectedTemplate?.id}
            />
          </div>
        </div>
      </main>
    </div>
  );
}