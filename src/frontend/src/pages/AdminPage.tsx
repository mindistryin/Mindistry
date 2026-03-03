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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import type { Principal } from "@icp-sdk/core/principal";
import { Loader2, Plus, ShieldX, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useIsAdmin } from "../hooks/useQueries";
import {
  type Announcement,
  type Quote,
  addAnnouncement,
  addQuote,
  deleteAnnouncement,
  deleteQuote,
  generateId,
  getAnnouncements,
  getQuotes,
  saveQuotes,
} from "../lib/localStorage";

// Quotes section
function QuotesSection() {
  const [quotes, setQuotes] = useState<Quote[]>(() => getQuotes());
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = () => {
    if (!text.trim()) return;
    const q: Quote = {
      id: generateId(),
      text: text.trim(),
      author: author.trim() || undefined,
    };
    addQuote(q);
    setQuotes(getQuotes());
    setText("");
    setAuthor("");
    toast.success("Quote added!");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteQuote(deleteTarget);
    setQuotes(getQuotes());
    setDeleteTarget(null);
    toast.success("Quote deleted");
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card border-0">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="font-display text-sm">Add Quote</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">
          <div>
            <Label className="text-xs">Quote Text *</Label>
            <Textarea
              data-ocid="admin.quote.textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter a motivational quote…"
              rows={3}
              className="mt-1 rounded-xl resize-none"
            />
          </div>
          <div>
            <Label className="text-xs">Author (optional)</Label>
            <Input
              data-ocid="admin.quote.input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Albert Einstein"
              className="mt-1 rounded-xl"
            />
          </div>
          <Button
            data-ocid="admin.quote.submit_button"
            onClick={handleAdd}
            disabled={!text.trim()}
            size="sm"
            className="bg-lavender text-primary-foreground rounded-xl font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Quote
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {quotes.length === 0 ? (
          <p
            data-ocid="admin.quotes.empty_state"
            className="text-sm text-muted-foreground text-center py-6"
          >
            No quotes yet
          </p>
        ) : (
          quotes.map((q, i) => (
            <Card
              key={q.id}
              data-ocid={`admin.quote.item.${i + 1}`}
              className="shadow-card border-0"
            >
              <CardContent className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm italic font-body">"{q.text}"</p>
                  {q.author && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      — {q.author}
                    </p>
                  )}
                </div>
                <Button
                  data-ocid={`admin.quote.delete_button.${i + 1}`}
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => setDeleteTarget(q.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="admin.quote.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Quote?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This quote will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.quote.delete.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.quote.delete.confirm_button"
              onClick={handleDelete}
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

// Announcements section
function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getAnnouncements(),
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) return;
    addAnnouncement({
      id: generateId(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });
    setAnnouncements(getAnnouncements());
    setTitle("");
    setContent("");
    toast.success("Announcement posted!");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteAnnouncement(deleteTarget);
    setAnnouncements(getAnnouncements());
    setDeleteTarget(null);
    toast.success("Announcement removed");
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card border-0">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="font-display text-sm">
            Post Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input
              data-ocid="admin.announcement.input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              className="mt-1 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-xs">Content *</Label>
            <Textarea
              data-ocid="admin.announcement.textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Announcement details…"
              rows={3}
              className="mt-1 rounded-xl resize-none"
            />
          </div>
          <Button
            data-ocid="admin.announcement.submit_button"
            onClick={handleAdd}
            disabled={!title.trim() || !content.trim()}
            size="sm"
            className="bg-peach text-white rounded-xl font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" /> Post
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {announcements.length === 0 ? (
          <p
            data-ocid="admin.announcements.empty_state"
            className="text-sm text-muted-foreground text-center py-6"
          >
            No announcements yet
          </p>
        ) : (
          [...announcements].reverse().map((ann, i) => (
            <Card
              key={ann.id}
              data-ocid={`admin.announcement.item.${i + 1}`}
              className="shadow-card border-0"
            >
              <CardContent className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm">
                    {ann.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ann.content}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(ann.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  data-ocid={`admin.announcement.delete_button.${i + 1}`}
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => setDeleteTarget(ann.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="admin.announcement.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Announcement?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This announcement will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.announcement.delete.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.announcement.delete.confirm_button"
              onClick={handleDelete}
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

// Role management section
function RoleSection() {
  const { actor } = useActor();
  const [principalStr, setPrincipalStr] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);
  const [isPending, setIsPending] = useState(false);

  const handleAssign = async () => {
    if (!principalStr.trim() || !actor) return;
    setIsPending(true);
    try {
      const principal = PrincipalClass.fromText(
        principalStr.trim(),
      ) as unknown as Principal;
      await actor.assignCallerUserRole(principal, role);
      toast.success("Role assigned!");
      setPrincipalStr("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign role";
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="font-display text-sm">Assign User Role</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        <div>
          <Label className="text-xs">Principal ID</Label>
          <Input
            data-ocid="admin.role.input"
            value={principalStr}
            onChange={(e) => setPrincipalStr(e.target.value)}
            placeholder="e.g. aaaaa-aa"
            className="mt-1 rounded-xl font-mono text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger
              data-ocid="admin.role.select"
              className="mt-1 rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.admin}>Admin</SelectItem>
              <SelectItem value={UserRole.user}>User</SelectItem>
              <SelectItem value={UserRole.guest}>Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          data-ocid="admin.role.submit_button"
          onClick={() => {
            void handleAssign();
          }}
          disabled={!principalStr.trim() || isPending}
          size="sm"
          className="bg-sky text-white rounded-xl font-semibold"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
          Assign Role
        </Button>
      </CardContent>
    </Card>
  );
}

export function AdminPage() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <ShieldX className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="font-display font-bold text-xl">Access Denied</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          This section is only accessible to administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display font-bold text-2xl">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage quotes, announcements, and roles
        </p>
      </motion.div>

      <Tabs defaultValue="quotes">
        <TabsList className="rounded-xl bg-muted mb-6 h-9">
          <TabsTrigger
            data-ocid="admin.quotes.tab"
            value="quotes"
            className="text-xs rounded-lg px-4"
          >
            Quotes
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.announcements.tab"
            value="announcements"
            className="text-xs rounded-lg px-4"
          >
            Announcements
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.roles.tab"
            value="roles"
            className="text-xs rounded-lg px-4"
          >
            Roles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="quotes">
          <QuotesSection />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementsSection />
        </TabsContent>
        <TabsContent value="roles">
          <RoleSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
