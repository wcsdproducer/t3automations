'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  useUser,
  useFirestore,
  useDoc,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit2, Sparkles, Settings2, ShieldCheck, HelpCircle } from 'lucide-react';
import {
  updateBlogPost,
  deleteBlogPost,
  saveSeoSettings,
  triggerBlogGeneration,
} from '@/app/actions/blog-seo';

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  keywords?: string[];
  createdAt?: string;
  updatedAt?: string;
  status: 'published' | 'draft';
}

export default function BlogSeoPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const params = useParams();
  const userIdSlug = params.userId as string;

  // Tabs state
  const [activeTab, setActiveTab] = useState('blogs');

  // Edit post modal states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    keywords: '',
  });

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);

  // SEO form states
  const [seoForm, setSeoForm] = useState({
    metaTitle: '',
    metaDescription: '',
    googleAnalyticsMeasurementId: '',
    blogTargetCount: 1,
  });

  // 1. Fetch Business Profile
  const profileDocRef = useMemoFirebase(() => {
    if (!userIdSlug || !firestore) return null;
    return doc(firestore, 'businessProfiles', userIdSlug);
  }, [userIdSlug, firestore]);

  const { data: businessProfile, isLoading: isProfileLoading } = useDoc<any>(profileDocRef);

  // Sync profile values to SEO settings form
  useEffect(() => {
    if (businessProfile) {
      setSeoForm({
        metaTitle: businessProfile.metaTitle || '',
        metaDescription: businessProfile.metaDescription || '',
        googleAnalyticsMeasurementId: businessProfile.googleAnalyticsMeasurementId || '',
        blogTargetCount: businessProfile.blogTargetCount !== undefined ? Number(businessProfile.blogTargetCount) : 1,
      });
    }
  }, [businessProfile]);

  // 2. Fetch Blogs Collection (ordered by date)
  const blogsRef = useMemoFirebase(() => {
    if (!user || !firestore || !userIdSlug) return null;
    const blogsCol = collection(firestore, `businessProfiles/${userIdSlug}/blogs`);
    return query(blogsCol, orderBy('createdAt', 'desc'));
  }, [user, firestore, userIdSlug]);

  const { data: blogsData, isLoading: isBlogsLoading } = useCollection(blogsRef);

  const posts = useMemo(() => {
    if (!blogsData) return [];
    return blogsData.map(doc => doc.data() as BlogPost);
  }, [blogsData]);

  // Handle opening edit dialog
  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      keywords: post.keywords ? post.keywords.join(', ') : '',
    });
    setIsEditDialogOpen(true);
  };

  // Handle saving edited blog post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsSubmitting(true);
    const parsedKeywords = editForm.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const res = await updateBlogPost(userIdSlug, editingPost.slug, {
      title: editForm.title,
      excerpt: editForm.excerpt,
      content: editForm.content,
      author: editForm.author,
      keywords: parsedKeywords,
    });

    setIsSubmitting(false);
    if (res.success) {
      toast({ title: 'Success', description: 'Blog post updated successfully' });
      setIsEditDialogOpen(false);
      setEditingPost(null);
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to update blog post', variant: 'destructive' });
    }
  };

  // Handle deleting blog post
  const handleDeletePost = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    const res = await deleteBlogPost(userIdSlug, slug);
    if (res.success) {
      toast({ title: 'Deleted', description: 'Blog post has been deleted' });
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to delete blog post', variant: 'destructive' });
    }
  };

  // Handle manual blog generation trigger
  const handleTriggerGeneration = async () => {
    setIsGenerating(true);
    setGenerationLogs(['Initiating automated content marketing flow...', 'Connecting to Gemini AI content engine...']);
    
    const res = await triggerBlogGeneration(userIdSlug);
    setIsGenerating(false);

    if (res.success) {
      if (res.logs && res.logs.length > 0) {
        setGenerationLogs(res.logs);
      } else {
        setGenerationLogs(['Job completed. Database count verified.']);
      }
      toast({ title: 'Blog posts generated!', description: 'Content successfully written and published.' });
    } else {
      setGenerationLogs(prev => [...prev, `[FAIL] Error occurred: ${res.error}`]);
      toast({ title: 'Generation Failed', description: res.error || 'Check logs below.', variant: 'destructive' });
    }
  };

  // Handle saving global SEO/AEO configurations
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await saveSeoSettings(userIdSlug, {
      metaTitle: seoForm.metaTitle,
      metaDescription: seoForm.metaDescription,
      googleAnalyticsMeasurementId: seoForm.googleAnalyticsMeasurementId,
      blogTargetCount: Number(seoForm.blogTargetCount),
    });

    setIsSubmitting(false);
    if (res.success) {
      toast({ title: 'Settings Saved', description: 'Global SEO parameters have been updated' });
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to update SEO settings', variant: 'destructive' });
    }
  };

  const currentHourEst = () => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date());
  };

  return (
    <div className="flex flex-col gap-6 w-full text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Blog & SEO Control Panel</h1>
          <p className="text-muted-foreground mt-1">
            Configure automated daily local content marketing (AEO) and search engine optimization index parameters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={isGenerating}
            onClick={handleTriggerGeneration}
            className="border-primary/30 hover:border-primary text-foreground font-semibold flex items-center gap-2 transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                <span>Generate Article Now</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl w-fit">
          <TabsTrigger value="blogs" className="rounded-lg font-bold">
            Blog Articles ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="autoposter" className="rounded-lg font-bold">
            Autoposter Schedule
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg font-bold">
            SEO & AEO Metadata
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Blog Articles Manager */}
        <TabsContent value="blogs" className="space-y-6">
          {isGenerating && (
            <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  AI Content Generation Progress Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xs text-slate-600 dark:text-slate-400 max-h-48 overflow-y-auto space-y-1 bg-slate-900/5 dark:bg-slate-950/50 p-4 rounded-lg border">
                  {generationLogs.map((log, idx) => (
                    <div key={idx} className={log.startsWith('[FAIL]') ? 'text-rose-500 font-bold' : ''}>
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Published Articles</CardTitle>
              <CardDescription>
                Review, edit, and maintain local SEO posts generated for your sites.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isBlogsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm">Fetching blog database...</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                  <Sparkles className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">No blog posts found</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                    Your scheduled autopilot task has not run yet. Click "Generate Article Now" to write your first local post.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl">
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                      <TableRow>
                        <TableHead className="font-bold w-[40%]">Title</TableHead>
                        <TableHead className="font-bold w-[25%]">Keywords</TableHead>
                        <TableHead className="font-bold">Author</TableHead>
                        <TableHead className="font-bold">Date Published</TableHead>
                        <TableHead className="font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.slug} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100 align-top py-4">
                            <div className="flex flex-col gap-1">
                              <span>{post.title}</span>
                              <span className="text-xs font-mono text-muted-foreground font-normal">
                                /{post.slug}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <div className="flex flex-wrap gap-1">
                              {post.keywords?.map((kw, idx) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] font-normal px-2 py-0">
                                  {kw}
                                </Badge>
                              )) || <span className="text-muted-foreground text-xs">—</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium align-top py-4">{post.author}</TableCell>
                          <TableCell className="text-xs text-muted-foreground align-top py-4">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Just now'}
                          </TableCell>
                          <TableCell className="text-right align-top py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEdit(post)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePost(post.slug)}
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Autoposter Settings */}
        <TabsContent value="autoposter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Autopilot Posting Limit</CardTitle>
                  <CardDescription>
                    Configure the maximum frequency of automated AI blog publishing for each site.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSeo} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="blogTargetCount" className="font-bold text-sm">
                        Daily Post Frequency
                      </Label>
                      <Select
                        value={String(seoForm.blogTargetCount)}
                        onValueChange={(val) => setSeoForm(prev => ({ ...prev, blogTargetCount: Number(val) }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 Posts per day (Disabled)</SelectItem>
                          <SelectItem value="1">1 Post per day (Starting at 8 AM EST)</SelectItem>
                          <SelectItem value="2">2 Posts per day (Staggered at 8 AM & 1 PM EST)</SelectItem>
                          <SelectItem value="3">3 Posts per day (Staggered at 8 AM, 1 PM & 6 PM EST)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground leading-normal mt-1.5">
                        Our scheduling agent uses slot target math. It compares active postings generated today against your selected threshold limit. If it falls short, a new article is drafted automatically.
                      </p>
                    </div>

                    <div className="border-t pt-5">
                      <Button type="submit" disabled={isSubmitting} className="font-bold">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Autopilot Limits
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Autoposter System Architecture</CardTitle>
                  <CardDescription>
                    How the serverless publishing schedule executes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 bg-muted/50 p-4 rounded-xl border">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Scheduled Cloud Trigger Cron Info:</h4>
                      <p className="text-muted-foreground leading-normal">
                        Your production system triggers automated checks via Cloud Scheduler running at:
                      </p>
                      <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        0 8,13,18 * * * (8:00 AM, 1:00 PM, 6:00 PM EST daily)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground leading-relaxed">
                      Every time the cron triggers, Next.js executes a dynamic query:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-400 leading-normal pl-2">
                      <li>Calculates the current hour in Eastern Time.</li>
                      <li>Finds all generated blogs in the Firestore tenant collection created today (after midnight EST).</li>
                      <li>Checks existing article slugs to prevent duplicate title matching or content cannibalization.</li>
                      <li>Triggers Gemini to write an exclusive local SEO article if the current count falls below target slot thresholds.</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar info card */}
            <div className="space-y-6">
              <Card className="border-border shadow-sm bg-slate-50/50 dark:bg-slate-900/10">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Settings2 className="h-4.5 w-4.5 text-primary" />
                    Scheduler Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-4">
                  <div>
                    <span className="text-muted-foreground block">Current System Time (EST):</span>
                    <span className="font-bold text-sm text-foreground">{currentHourEst()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Cron Verification Endpoint:</span>
                    <span className="font-mono text-[11px] select-all bg-muted border p-2 rounded-md block mt-1 break-all">
                      /api/cron/generate-blogs
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-muted-foreground leading-normal">
                      Use the <strong>"Generate Article Now"</strong> action to bypass scheduler cron intervals and publish immediately.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: SEO & AEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Global Metadata & Tracking</CardTitle>
                  <CardDescription>
                    Configure fallback browser headers, metadata tags, and analytics IDs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSeo} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="metaTitle" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Default Meta Title Fallback
                      </Label>
                      <Input
                        id="metaTitle"
                        placeholder="e.g. Local Paving Specialists | Best Paving Concrete"
                        value={seoForm.metaTitle}
                        onChange={(e) => setSeoForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Recommended length: Under 60 characters.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="metaDescription" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Default Meta Description Fallback
                      </Label>
                      <Textarea
                        id="metaDescription"
                        rows={3}
                        placeholder="Describe services, local credentials, and immediate availability..."
                        value={seoForm.metaDescription}
                        onChange={(e) => setSeoForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Recommended length: Under 160 characters. Optimized for snippets.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="googleAnalyticsMeasurementId" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Google Analytics Measurement ID
                      </Label>
                      <Input
                        id="googleAnalyticsMeasurementId"
                        placeholder="G-XXXXXXXXXX"
                        value={seoForm.googleAnalyticsMeasurementId}
                        onChange={(e) => setSeoForm(prev => ({ ...prev, googleAnalyticsMeasurementId: e.target.value }))}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Triggers dynamic gtag page tracking script injections.
                      </p>
                    </div>

                    <div className="border-t pt-5">
                      <Button type="submit" disabled={isSubmitting} className="font-bold">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Settings
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Answer Engine Optimization (AEO) Status</CardTitle>
                  <CardDescription>
                    Active structured entity details dynamically fed to AI search parsers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2 text-muted-foreground leading-relaxed">
                    <p>
                      Your landing page uses structured schema markup inside the page headers dynamically. This ensures that when search tools like ChatGPT Search or Google Gemini crawl the pages, key data is delivered programmatically:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-400 pl-2">
                      <li><strong>Business Entity:</strong> Declared as a qualified local provider in Tampa, FL.</li>
                      <li><strong>Contact details:</strong> Explicit links to telephone and quote actions.</li>
                      <li><strong>FAQs Schema (AEO):</strong> Parsed questions/answers are structured directly as crawlable schema objects.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar status */}
            <div className="space-y-6">
              <Card className="border-border shadow-sm bg-slate-50/50 dark:bg-slate-900/10">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                    Structured Schemas
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-3">
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-muted-foreground">LocalBusiness JSON-LD:</span>
                    <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-muted-foreground">FAQPage JSON-LD:</span>
                    <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                      Template 3
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Language Tag:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">en-US</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Blog Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setIsEditDialogOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Blog Article</DialogTitle>
            <DialogDescription>
              Modify article layout and SEO target meta attributes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePost} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="edit-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Article Title
              </Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-excerpt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Short Excerpt
              </Label>
              <Textarea
                id="edit-excerpt"
                rows={2}
                value={editForm.excerpt}
                onChange={(e) => setEditForm(prev => ({ ...prev, excerpt: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-content" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Body Content (HTML copy)
              </Label>
              <Textarea
                id="edit-content"
                rows={10}
                className="font-mono text-xs"
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-author" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Author
                </Label>
                <Input
                  id="edit-author"
                  value={editForm.author}
                  onChange={(e) => setEditForm(prev => ({ ...prev, author: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-keywords" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Keywords (comma separated)
                </Label>
                <Input
                  id="edit-keywords"
                  value={editForm.keywords}
                  onChange={(e) => setEditForm(prev => ({ ...prev, keywords: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="font-bold">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
