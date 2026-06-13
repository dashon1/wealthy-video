import React from "react";
import { format } from "date-fns";
import { Clock, FileJson, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function TemplateHistory({ templates, onSelect, onDelete, selectedId }) {
  if (!templates || templates.length === 0) {
    return (
      <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 p-8 text-center">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No templates generated yet</p>
        <p className="text-sm text-slate-500 mt-1">Your generated templates will appear here</p>
      </div>
    );
  }

  const completedTemplates = templates.filter(t => t.status === "completed" && t.json_output);

  const platformColors = {
    youtube_longform: "bg-red-500/20 text-red-400",
    tiktok: "bg-cyan-500/20 text-cyan-400",
    youtube_shorts: "bg-red-500/20 text-red-400",
    instagram_reels: "bg-pink-500/20 text-pink-400"
  };

  return (
    <div className="space-y-3">
      {completedTemplates.length === 0 && (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6 text-center">
          <p className="text-slate-400 text-sm">Generate your first template to get started</p>
        </div>
      )}
      <AnimatePresence>
        {completedTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-slate-800/50 rounded-xl border transition-all duration-200 cursor-pointer ${
              selectedId === template.id
                ? "border-violet-500/50 shadow-lg shadow-violet-500/10 bg-slate-800/80"
                : "border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(template);
            }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileJson className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <h4 className="font-medium text-white truncate">
                      {template.title || template.topic}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1 mb-2">
                    {template.keywords || "No keywords"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={platformColors[template.platform] || "bg-slate-500/20 text-slate-400"}>
                      {template.platform?.replace("_", " ") || "Unknown"}
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      {template.target_minutes || 12} min
                    </Badge>
                    {template.status === "generating" && (
                      <Badge className="bg-amber-500/20 text-amber-400">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Generating
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-slate-500">
                    {template.created_date && format(new Date(template.created_date), "MMM d, h:mm a")}
                  </span>
                  <div className="flex gap-1">

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(template.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}