import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Image, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface UploadedReport {
  fileName: string;
  filePath: string;
  fileType: string;
  extractedText: string | null;
  extracting: boolean;
}

interface MedicalReportUploadProps {
  reports: UploadedReport[];
  onReportsChange: (reports: UploadedReport[]) => void;
}

const MedicalReportUpload = ({ reports, onReportsChange }: MedicalReportUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF, JPG, or PNG file.", variant: "destructive" });
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      toast({ title: "File too large", description: `Maximum size is ${MAX_SIZE_MB}MB.`, variant: "destructive" });
      return;
    }

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Not logged in", description: "Please sign in to upload reports.", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const newReport: UploadedReport = {
        fileName: file.name,
        filePath,
        fileType: file.type,
        extractedText: null,
        extracting: true,
      };

      const updatedReports = [...reports, newReport];
      onReportsChange(updatedReports);

      // Extract text from report
      const { data: extractData, error: extractError } = await supabase.functions.invoke("extract-report", {
        body: { filePath },
      });

      const reportIndex = updatedReports.length - 1;
      if (extractError || extractData?.error) {
        console.error("Extraction error:", extractError || extractData?.error);
        const finalReports = [...updatedReports];
        finalReports[reportIndex] = { ...finalReports[reportIndex], extracting: false, extractedText: null };
        onReportsChange(finalReports);
        toast({ title: "Report uploaded", description: "Could not extract text, but report is attached." });
      } else {
        const finalReports = [...updatedReports];
        finalReports[reportIndex] = {
          ...finalReports[reportIndex],
          extracting: false,
          extractedText: extractData?.extractedText || null,
        };
        onReportsChange(finalReports);
        toast({ title: "Report analyzed", description: "Medical report text extracted successfully." });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeReport = async (index: number) => {
    const report = reports[index];
    // Delete from storage
    await supabase.storage.from("medical-reports").remove([report.filePath]);
    onReportsChange(reports.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    return FileText;
  };

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
            uploading
              ? "bg-muted/50 border-border text-muted-foreground cursor-wait"
              : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"
          )}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading..." : "Upload Medical Report"}
        </button>
        <span className="text-xs text-muted-foreground/60">PDF, JPG, PNG (max {MAX_SIZE_MB}MB)</span>
      </div>

      {/* Uploaded files */}
      <AnimatePresence>
        {reports.map((report, index) => {
          const Icon = getFileIcon(report.fileType);
          return (
            <motion.div
              key={report.filePath}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{report.fileName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {report.extracting ? (
                      <>
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                        <span className="text-xs text-primary">Extracting text with AI...</span>
                      </>
                    ) : report.extractedText ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <span className="text-xs text-success">Text extracted ({report.extractedText.length} chars)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-warning" />
                        <span className="text-xs text-warning">Text extraction unavailable</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeReport(index)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default MedicalReportUpload;
export type { UploadedReport };
