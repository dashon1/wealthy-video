import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, FileJson } from "lucide-react";
import { motion } from "framer-motion";

export default function JsonPreview({ jsonOutput, title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "template"}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Try to parse and format the JSON
  let formattedJson = jsonOutput;
  let isValidJson = true;
  try {
    const parsed = JSON.parse(jsonOutput);
    formattedJson = JSON.stringify(parsed, null, 2);
  } catch {
    isValidJson = false;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 rounded-lg">
            <FileJson className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">Generated Template</h3>
            <p className="text-sm text-slate-400">
              {isValidJson ? "Valid JSON • Ready to use" : "Output generated"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* JSON Content */}
      <div className="p-4 max-h-[600px] overflow-auto">
        <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap break-words">
          <code>{formattedJson}</code>
        </pre>
      </div>
    </motion.div>
  );
}