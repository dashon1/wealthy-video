import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video, Loader2, Download, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function VideoGenerator({ template, onUpdate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Poll for video status if processing
  useEffect(() => {
    if (template?.video_status === "processing" && template?.video_project_id) {
      const interval = setInterval(async () => {
        try {
          const { data } = await base44.functions.invoke("checkVideoStatus", {
            templateId: template.id
          });
          
          if (data.status === "done" || data.status === "error") {
            onUpdate();
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error checking video status:", err);
          // Don't spam errors, just log and continue
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [template?.video_status, template?.video_project_id, template?.id, onUpdate]);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await base44.functions.invoke("generateVideo", {
        templateId: template.id
      });

      console.log("Video generation response:", response.data);

      if (response.data.error) {
        setError(JSON.stringify(response.data.details || response.data.error));
      } else if (response.data.success) {
        // Video generation started successfully
        onUpdate();
      }
    } catch (err) {
      console.error("Video generation error:", err);
      setError(err.response?.data?.error || err.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusDisplay = () => {
    switch (template?.video_status) {
      case "processing":
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-blue-400" />,
          text: "Generating video...",
          color: "text-blue-400"
        };
      case "completed":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
          text: "Video ready!",
          color: "text-green-400"
        };
      case "failed":
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          text: "Generation failed",
          color: "text-red-400"
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm"
    >
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Video Generation</h3>
              <p className="text-sm text-slate-400">
                Convert JSON to video using JSON2Video API
              </p>
            </div>
          </div>

          {statusDisplay && (
            <div className={`flex items-center gap-2 ${statusDisplay.color}`}>
              {statusDisplay.icon}
              <span className="text-sm font-medium">{statusDisplay.text}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {template?.video_status === "completed" && template?.video_url && (
          <div className="space-y-3">
            <video 
              controls 
              className="w-full rounded-lg bg-black"
              src={template.video_url}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(template.video_url, "_blank")}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = template.video_url;
                  a.download = `${template.title || "video"}.mp4`;
                  a.click();
                }}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}

        {!template?.video_status || template?.video_status === "failed" ? (
          <Button
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Generation...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        ) : null}

        {template?.video_status === "processing" && (
          <div className="text-center text-sm text-slate-400">
            This may take a few minutes. We'll update automatically when ready.
          </div>
        )}
      </div>
    </motion.div>
  );
}