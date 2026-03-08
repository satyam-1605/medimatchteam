import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Image, Loader2, AlertCircle, CheckCircle2, History, RotateCcw } from "lucide-react";
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
  savedId?: string; // ID from saved_reports table
}

interface SavedReport {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  extracted_text: string | null;
  created_at: string;
}

interface MedicalReportUploadProps {
  reports: UploadedReport[];
  onReportsChange: (reports: UploadedReport[]) => void;
}

const MedicalReportUpload = ({ reports, onReportsChange }: MedicalReportUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Load saved reports on mount
  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setLoadingSaved(true);
    const { data, error } = await supabase
      .from("saved_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSavedReports(data as SavedReport[]);
    }
    setLoadingSaved(false);
  };

  const saveReportToDb = async (report: UploadedReport) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from("saved_reports")
      .insert({
        user_id: session.user.id,
        file_name: report.fileName,
        file_path: report.filePath,
        file_type: report.fileType,
        extracted_text: report.extractedText,
      })
      .select("id")
      .single();

    if (!error && data) {
      // Refresh saved reports list
      loadSavedReports();
      return data.id;
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF, JPG, or PNG file.", variant: "destructive" });
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast({ title: "File too large", description: `Maximum size is ${MAX_SIZE_MB}MB.`, variant: "destructive" });
      return;
    }

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

      if (uploadError) throw new Error(uploadError.message);

      const newReport: UploadedReport = {
        fileName: file.name,
        filePath,
        fileType: file.type,
        extractedText: null,
        extracting: true,
      };

      const updatedReports = [...reports, newReport];
      onReportsChange(updatedReports);

      const { data: extractData, error: extractError } = await supabase.functions.invoke("extract-report", {
        body: { filePath },
      });

      const reportIndex = updatedReports.length - 1;
      const finalReports = [...updatedReports];

      if (extractError || extractData?.error) {
        console.error("Extraction error:", extractError || extractData?.error);
        finalReports[reportIndex] = { ...finalReports[reportIndex], extracting: false, extractedText: null };
        onReportsChange(finalReports);
        toast({ title: "Report uploaded", description: "Could not extract text, but report is attached." });
      } else {
        finalReports[reportIndex] = {
          ...finalReports[reportIndex],
          extracting: false,
          extractedText: extractData?.extractedText || null,
        };
        onReportsChange(finalReports);
        toast({ title: "Report analyzed", description: "Medical report text extracted successfully." });
      }

      // Save to DB
      const savedId = await saveReportToDb(finalReports[reportIndex]);
      if (savedId) {
        const withId = [...finalReports];
        withId[reportIndex] = { ...withId[reportIndex], savedId };
        onReportsChange(withId);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const reuseSavedReport = (saved: SavedReport) => {
    // Check if already added
    if (reports.some((r) => r.filePath === saved.file_path)) {
      toast({ title: "Already added", description: "This report is already attached." });
      return;
    }

    const reused: UploadedReport = {
      fileName: saved.file_name,
      filePath: saved.file_path,
      fileType: saved.file_type,
      extractedText: saved.extracted_text,
      extracting: false,
      savedId: saved.id,
    };

    onReportsChange([...reports, reused]);
    toast({ title: "Report attached", description: `"${saved.file_name}" reused from your saved reports.` });
  };

  const removeReport = async (index: number) => {
    const report = reports[index];
    // Only delete from storage if it's a new upload (not reused from saved)
    if (!report.savedId || !savedReports.some((s) => s.file_path === report.filePath)) {
      await supabase.storage.from("medical-reports").remove([report.filePath]);
    }
    onReportsChange(reports.filter((_, i) => i !== index));
  };

  const deleteSavedReport = async (saved: SavedReport) => {
    await supabase.from("saved_reports").delete().eq("id", saved.id);
    await supabase.storage.from("medical-reports").remove([saved.file_path]);
    setSavedReports((prev) => prev.filter((r) => r.id !== saved.id));
    // Also remove from active reports if attached
    onReportsChange(reports.filter((r) => r.filePath !== saved.file_path));
    toast({ title: "Report deleted", description: "Saved report removed permanently." });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    return FileText;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-3">
      {/* Upload + Saved toggle */}
      <div className="flex items-center gap-3 flex-wrap">
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
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading..." : "Upload New Report"}
        </button>

        {savedReports.length > 0 && (
          <button
            onClick={() => setShowSaved(!showSaved)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
              showSaved
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"
            )}
          >
            <History className="w-4 h-4" />
            Saved Reports ({savedReports.length})
          </button>
        )}

        <span className="text-xs text-muted-foreground/60">PDF, JPG, PNG (max {MAX_SIZE_MB}MB)</span>
      </div>

      {/* Saved Reports Panel */}
      <AnimatePresence>
        {showSaved && savedReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Previously uploaded reports — click to reuse</p>
              {savedReports.map((saved) => {
                const Icon = getFileIcon(saved.file_type);
                const isAttached = reports.some((r) => r.filePath === saved.file_path);
                return (
                  <div
                    key={saved.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      isAttached
                        ? "bg-primary/10 border-primary/30"
                        : "bg-card/50 border-border/30 hover:border-primary/30 cursor-pointer hover:bg-primary/5"
                    )}
                    onClick={() => !isAttached && reuseSavedReport(saved)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{saved.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(saved.created_at)}
                        {saved.extracted_text && ` · ${saved.extracted_text.length} chars extracted`}
                      </p>
                    </div>
                    {isAttached ? (
                      <span className="text-xs text-primary font-medium px-2 py-1 rounded-full bg-primary/10">Attached</span>
                    ) : (
                      <RotateCcw className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSavedReport(saved); }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      title="Delete permanently"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Currently attached files */}
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
                    {report.savedId && (
                      <span className="text-xs text-muted-foreground ml-2">· Saved</span>
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
