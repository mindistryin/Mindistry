import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Download,
  File,
  FileImage,
  FileText,
  HardDrive,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { FileMeta } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useDeleteFile as useDeleteFileQuery,
  useFiles as useFilesQuery,
  useSubjects as useSubjectsQuery,
} from "../hooks/useQueries";
import { bigIntNsToDate } from "../lib/localStorage";

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return FileImage;
  if (fileType === "application/pdf") return FileText;
  return File;
}

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function FileCard({
  file,
  index,
  subjectMap,
  onDelete,
}: {
  file: FileMeta;
  index: number;
  subjectMap: Map<string, { name: string; color: string }>;
  onDelete: (f: FileMeta) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const subject = file.subjectId ? subjectMap.get(file.subjectId) : null;
  const Icon = getFileIcon(file.fileType);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = file.blob.getDirectURL();
      const a = document.createElement("a");
      a.href = url;
      a.download = file.fileName;
      a.target = "_blank";
      a.click();
    } catch {
      toast.error("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      data-ocid={`storage.item.${index}`}
    >
      <Card className="shadow-card border-0 hover:shadow-pastel transition-all">
        <CardContent className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-pale flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-sky" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body font-medium text-sm truncate">
              {file.fileName}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {formatBytes(file.fileSize)}
              </span>
              {subject && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${subject.color}25`,
                    color: subject.color,
                  }}
                >
                  {subject.name}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {bigIntNsToDate(file.uploadedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              data-ocid={`storage.download.button.${index}`}
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 text-muted-foreground hover:text-sky"
              onClick={() => {
                void handleDownload();
              }}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              data-ocid={`storage.delete_button.${index}`}
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(file)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StoragePage() {
  const { data: files = [], isLoading } = useFilesQuery();
  const { data: subjects = [] } = useSubjectsQuery();
  const { mutateAsync: deleteFile } = useDeleteFileQuery();
  const { actor } = useActor();

  const [deleteTarget, setDeleteTarget] = useState<FileMeta | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSubject, setUploadSubject] = useState<string>("__none__");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const s of subjects) map.set(s.id, { name: s.name, color: s.color });
    return map;
  }, [subjects]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!actor) {
        toast.error("Not connected to backend");
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
        const subjectId = uploadSubject === "__none__" ? null : uploadSubject;
        await actor.addFile(
          file.name,
          file.type,
          BigInt(file.size),
          subjectId,
          blob,
        );
        toast.success(`${file.name} uploaded!`);
        // Invalidate files query
        window.dispatchEvent(new Event("storage-refresh"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        toast.error(msg);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [actor, uploadSubject],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      for (const f of droppedFiles) {
        await uploadFile(f);
      }
    },
    [uploadFile],
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    for (const f of selected) await uploadFile(f);
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFile(deleteTarget.id);
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteTarget(null);
  };

  const totalSize = files.reduce((acc, f) => acc + f.fileSize, BigInt(0));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Storage</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {files.length} file{files.length !== 1 ? "s" : ""} ·{" "}
            {formatBytes(totalSize)}
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div className="mb-4 flex gap-2 items-center">
        <Select value={uploadSubject} onValueChange={setUploadSubject}>
          <SelectTrigger
            data-ocid="storage.subject.select"
            className="w-36 h-9 text-xs rounded-xl"
          >
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No subject</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dropzone */}
      <div
        data-ocid="storage.dropzone"
        onDrop={(e) => {
          void handleDrop(e);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) {
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload files - click or drag and drop"
        className={`
          mb-6 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${
            isDragOver
              ? "border-sky bg-sky-pale"
              : "border-border hover:border-sky/50 hover:bg-sky-pale/50"
          }
          ${uploading ? "pointer-events-none" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFileInput(e);
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-sky animate-spin" />
            <p className="font-body text-sm text-muted-foreground">
              Uploading… {uploadProgress}%
            </p>
            <div className="w-full max-w-[200px] h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-sky rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-sky mx-auto mb-3" />
            <p className="font-display font-semibold text-sm text-foreground">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, images, documents supported
            </p>
          </>
        )}
      </div>
      <Button
        data-ocid="storage.upload_button"
        className="mb-6 bg-sky text-white rounded-xl font-display font-semibold"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="w-4 h-4 mr-1" />
        {uploading ? "Uploading…" : "Upload File"}
      </Button>

      {/* File list */}
      {isLoading ? (
        <div data-ocid="storage.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div
          data-ocid="storage.empty_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <HardDrive className="w-10 h-10 text-muted-foreground/30" />
          <p className="font-display font-semibold text-muted-foreground">
            No files yet
          </p>
          <p className="text-sm text-muted-foreground/60">
            Upload files to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="storage.list">
          <AnimatePresence mode="popLayout">
            {files.map((file, i) => (
              <FileCard
                key={file.id}
                file={file}
                index={i + 1}
                subjectMap={subjectMap}
                onDelete={setDeleteTarget}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="storage.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete File?
            </AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.fileName}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="storage.delete.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="storage.delete.confirm_button"
              onClick={() => {
                void handleDelete();
              }}
              className="rounded-xl bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
