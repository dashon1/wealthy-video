import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Mic, Video, Settings, Shield, Loader2 } from "lucide-react";
import InputSection from "./InputSection";

export default function GeneratorForm({ formData, setFormData, onGenerate, isGenerating }) {
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Core Content */}
      <InputSection title="Core Content" icon={FileText} defaultOpen={true}>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Topic *</Label>
            <Input
              placeholder="e.g., The Dark Psychology of Social Media Algorithms"
              value={formData.topic}
              onChange={(e) => updateField("topic", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>
          <div>
            <Label className="text-slate-300 mb-2 block">Keywords (comma-separated)</Label>
            <Input
              placeholder="e.g., dopamine, addiction, engagement, manipulation"
              value={formData.keywords}
              onChange={(e) => updateField("keywords", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>
          <div>
            <Label className="text-slate-300 mb-2 block">Angle / Big Claim (optional)</Label>
            <Textarea
              placeholder="e.g., What they don't want you to know about..."
              value={formData.angle}
              onChange={(e) => updateField("angle", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-slate-300 mb-2 block">Target Audience (optional)</Label>
            <Input
              placeholder="e.g., Gen Z interested in self-improvement"
              value={formData.audience}
              onChange={(e) => updateField("audience", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>
        </div>
      </InputSection>

      {/* Video Settings */}
      <InputSection title="Video Settings" icon={Video} defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Platform</Label>
            <Select value={formData.platform} onValueChange={(v) => updateField("platform", v)}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="youtube_longform">YouTube Longform</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube_shorts">YouTube Shorts</SelectItem>
                <SelectItem value="instagram_reels">Instagram Reels</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 mb-2 block">Tone</Label>
            <Select value={formData.tone} onValueChange={(v) => updateField("tone", v)}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="documentary">Documentary</SelectItem>
                <SelectItem value="storytime">Storytime</SelectItem>
                <SelectItem value="high-energy">High Energy</SelectItem>
                <SelectItem value="calm-explainer">Calm Explainer</SelectItem>
                <SelectItem value="motivational">Motivational</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-slate-300 mb-3 block">
            Target Duration: <span className="text-violet-400 font-semibold">{formData.targetMinutes} minutes</span>
          </Label>
          <Slider
            value={[formData.targetMinutes]}
            onValueChange={([v]) => updateField("targetMinutes", v)}
            min={10}
            max={25}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>10 min</span>
            <span>25 min</span>
          </div>
        </div>
      </InputSection>

      {/* Voice Settings */}
      <InputSection title="Voice Settings" icon={Mic} defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Voice Model</Label>
            <Select value={formData.voiceModel} onValueChange={(v) => updateField("voiceModel", v)}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="azure">Azure</SelectItem>
                <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 mb-2 block">Voice Name</Label>
            <Input
              placeholder="e.g., en-US-JennyNeural"
              value={formData.voiceName}
              onChange={(e) => updateField("voiceName", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>
        </div>
      </InputSection>

      {/* Branding & CTA */}
      <InputSection title="Branding & CTA" icon={Settings} defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Channel Handle</Label>
            <Input
              placeholder="@yourhandle"
              value={formData.channelHandle}
              onChange={(e) => updateField("channelHandle", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>
          <div>
            <Label className="text-slate-300 mb-2 block">CTA Line</Label>
            <Input
              placeholder="Follow for Part 2 • Save • Share"
              value={formData.ctaLine}
              onChange={(e) => updateField("ctaLine", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>
        </div>
        <div>
          <Label className="text-slate-300 mb-2 block">Background Music URL (optional)</Label>
          <Input
            placeholder="https://example.com/music.mp3"
            value={formData.bgMusicUrl}
            onChange={(e) => updateField("bgMusicUrl", e.target.value)}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500"
          />
        </div>
        <div>
          <Label className="text-slate-300 mb-2 block">Visual Style Prompt (optional)</Label>
          <Textarea
            placeholder="e.g., Cinematic dark moody aesthetic, dramatic lighting..."
            value={formData.visualStylePrompt}
            onChange={(e) => updateField("visualStylePrompt", e.target.value)}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 min-h-[80px]"
          />
        </div>
      </InputSection>

      {/* B-Roll Settings */}
      <InputSection title="B-Roll Settings" icon={Video} defaultOpen={false}>
        <div>
          <Label className="text-slate-300 mb-2 block">B-Roll Mode</Label>
          <Select value={formData.brollMode} onValueChange={(v) => updateField("brollMode", v)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="prompt_only">AI Image Prompts Only</SelectItem>
              <SelectItem value="use_urls">Use Custom URLs</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.brollMode === "use_urls" && (
          <div>
            <Label className="text-slate-300 mb-2 block">B-Roll URLs (one per line)</Label>
            <Textarea
              placeholder="https://example.com/video1.mp4&#10;https://example.com/video2.mp4"
              value={formData.brollUrls}
              onChange={(e) => updateField("brollUrls", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 min-h-[100px] font-mono text-sm"
            />
          </div>
        )}
      </InputSection>

      {/* Compliance */}
      <InputSection title="Compliance" icon={Shield} defaultOpen={false}>
        <div>
          <Label className="text-slate-300 mb-2 block">Compliance Mode</Label>
          <Select value={formData.complianceMode} onValueChange={(v) => updateField("complianceMode", v)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="health_education">Health Education</SelectItem>
              <SelectItem value="finance_education">Finance Education</SelectItem>
              <SelectItem value="legal_education">Legal Education</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-2">
            Educational modes will add appropriate disclaimers and avoid definitive advice.
          </p>
        </div>
      </InputSection>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={!formData.topic || isGenerating}
        className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg rounded-xl shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Template...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate JSON Template
          </>
        )}
      </Button>
    </div>
  );
}