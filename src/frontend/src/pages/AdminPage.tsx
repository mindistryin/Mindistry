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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  Plus,
  ShieldX,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
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
import { getSessionParameter } from "../utils/urlParams";

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

function AccessDeniedView() {
  const { identity, clear } = useInternetIdentity();
  const { actor } = useActor();
  const principalId = identity?.getPrincipal().toString() ?? "";
  const [copied, setCopied] = useState(false);
  const [tokenInput, setTokenInput] = useState<string>(
    () => getSessionParameter("caffeineAdminToken") ?? "",
  );
  const [isClaiming, setIsClaiming] = useState(false);

  const handleCopy = () => {
    if (!principalId) return;
    void navigator.clipboard.writeText(principalId).then(() => {
      setCopied(true);
      toast.success("Principal ID copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClaimAdmin = async () => {
    if (!actor || !tokenInput.trim()) return;
    setIsClaiming(true);
    try {
      await (actor as any)._initializeAccessControlWithSecret(
        tokenInput.trim(),
      );
      toast.success(
        "Admin claim submitted! If you're a new user with the correct token, reload the page to verify access.",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to claim admin";
      toast.error(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleLogout = () => {
    clear();
    toast.success("Logged out successfully");
  };

  const steps = [
    {
      num: 1,
      text: "Log out of the app using the button below.",
    },
    {
      num: 2,
      text: "Find the admin setup link in your Caffeine dashboard (Project Settings → Admin URL).",
    },
    {
      num: 3,
      text: "Open that link in a new private/incognito browser window.",
    },
    {
      num: 4,
      text: "Log in with your Internet Identity. Admin access is granted on first login via that link.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 py-8 max-w-lg mx-auto"
    >
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-destructive/60" />
        </div>
        <h2 className="font-display font-bold text-2xl text-center">
          Access Denied
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          This section is only accessible to administrators.
        </p>
      </div>

      {/* How to get admin access */}
      <Card
        data-ocid="admin.access_denied.card"
        className="w-full shadow-card border border-border/60 rounded-2xl"
      >
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary/70" />
            How to Get Admin Access
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Admin access is granted on first login via the special admin setup
            link from your Caffeine dashboard. If you already logged in without
            it, follow the steps below.
          </p>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-4">
          {/* Steps */}
          <ol className="space-y-2.5">
            {steps.map((step) => (
              <li key={step.num} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {step.num}
                </span>
                <p className="text-sm text-foreground/80 leading-snug">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Already logged in without the admin link?</strong> You'll
              need to log out and use the admin setup URL in a fresh
              private/incognito session — or contact Caffeine support to
              manually promote your account.
            </p>
          </div>

          <Separator />

          {/* Logout button */}
          {identity && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Step 1 — Log out now:
              </p>
              <Button
                data-ocid="admin.access_denied.button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full rounded-xl gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token claim (for new users arriving via admin URL) */}
      {tokenInput && (
        <Card className="w-full shadow-card border border-border/60 rounded-2xl">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="font-display text-sm">
              Admin Token Detected
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              An admin token was found in your session. If this is your first
              login, clicking "Claim Admin" may grant you admin access.
            </p>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <div>
              <Label className="text-xs">Admin Token</Label>
              <Input
                data-ocid="admin.token.input"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste admin token…"
                className="mt-1 rounded-xl font-mono text-xs"
              />
            </div>
            <Button
              data-ocid="admin.token.submit_button"
              size="sm"
              onClick={() => {
                void handleClaimAdmin();
              }}
              disabled={!tokenInput.trim() || isClaiming || !actor}
              className="rounded-xl font-semibold"
            >
              {isClaiming ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Claim Admin
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Principal ID card */}
      <Card className="w-full shadow-card border border-border/60 rounded-2xl">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            Your Principal ID
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share this with Caffeine support or an existing admin to get your
            role manually assigned.
          </p>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {principalId ? (
            <div className="flex items-center gap-2">
              <code
                data-ocid="admin.principal_id.panel"
                className="flex-1 min-w-0 text-xs font-mono bg-muted rounded-xl px-3 py-2.5 break-all select-all leading-relaxed"
              >
                {principalId}
              </code>
              <Button
                data-ocid="admin.principal_id.button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0 rounded-xl h-9 w-9 p-0"
                title="Copy Principal ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            <p
              data-ocid="admin.principal_id.loading_state"
              className="text-xs text-muted-foreground italic"
            >
              Log in to see your Principal ID
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
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
    return <AccessDeniedView />;
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
