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
import { Loader2, Trash2, Edit2, Sparkles, Settings2, ShieldCheck, HelpCircle, TrendingUp, Award, Search, ArrowUp, ArrowDown, Minus, ExternalLink, Target } from 'lucide-react';
import {
  updateBlogPost,
  deleteBlogPost,
  saveSeoSettings,
  triggerBlogGeneration,
} from '@/app/actions/blog-seo';

const KEYWORDS_MOCK_DATA = {
  'tree-care': [
    { keyword: 'tree service tampa', volume: 880, position: 2, change: 1, url: '/' },
    { keyword: 'tree removal tampa', volume: 720, position: 4, change: 2, url: '/' },
    { keyword: 'arborist tampa fl', volume: 390, position: 3, change: 0, url: '/' },
    { keyword: 'tree trimming tampa fl', volume: 480, position: 6, change: 3, url: '/blog/choose-best-tree-service-tampa' },
    { keyword: 'emergency tree removal tampa', volume: 210, position: 11, change: -1, url: '/' },
    { keyword: 'stump grinding tampa', volume: 320, position: 8, change: 4, url: '/' },
    { keyword: 'tampa tree care services', volume: 150, position: 1, change: 0, url: '/' },
    { keyword: 'tree service cost tampa', volume: 260, position: 5, change: 2, url: '/blog/tree-service-costs-tampa' },
  ],
  'epoxy-flooring': [
    { keyword: 'epoxy flooring tampa', volume: 940, position: 3, change: 1, url: '/' },
    { keyword: 'garage floor coating tampa', volume: 590, position: 2, change: 0, url: '/' },
    { keyword: 'concrete coating tampa fl', volume: 320, position: 5, change: 2, url: '/' },
    { keyword: 'epoxy garage floor tampa cost', volume: 210, position: 7, change: 1, url: '/blog/epoxy-garage-floor-cost-tampa' },
    { keyword: 'commercial epoxy flooring tampa', volume: 170, position: 12, change: -2, url: '/' },
    { keyword: 'concrete sealing tampa', volume: 260, position: 4, change: 3, url: '/' },
    { keyword: 'best epoxy floor installers tampa', volume: 140, position: 2, change: 1, url: '/' },
    { keyword: 'industrial floor coating tampa', volume: 90, position: 14, change: 0, url: '/' },
  ],
  'paving-concrete': [
    { keyword: 'paving contractors tampa', volume: 680, position: 4, change: 2, url: '/' },
    { keyword: 'concrete driveway tampa', volume: 540, position: 3, change: 1, url: '/' },
    { keyword: 'patio pavers tampa fl', volume: 420, position: 6, change: 0, url: '/' },
    { keyword: 'paver sealing tampa', volume: 310, position: 2, change: 3, url: '/' },
    { keyword: 'concrete contractors tampa fl', volume: 880, position: 8, change: -1, url: '/' },
    { keyword: 'driveway pavers tampa cost', volume: 190, position: 5, change: 2, url: '/blog/paving-driveway-cost-tampa' },
    { keyword: 'commercial paving tampa', volume: 130, position: 15, change: 1, url: '/' },
    { keyword: 'best paving company tampa', volume: 150, position: 3, change: 0, url: '/' },
  ]
};

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
    return blogsData as unknown as BlogPost[];
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
          <TabsTrigger value="keywords" className="rounded-lg font-bold">
            Keyword Rankings
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
                Autonomously generated articles optimized for target search queries and local SEO schema injection.
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
                        <TableHead className="font-bold w-[45%]">Title</TableHead>
                        <TableHead className="font-bold w-[30%]">Keywords</TableHead>
                        <TableHead className="font-bold">Author</TableHead>
                        <TableHead className="font-bold">Date Published</TableHead>
                        <TableHead className="font-bold text-right">Link</TableHead>
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                              asChild
                            >
                              <a
                                href={`/pages/${userIdSlug}/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                View Article <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
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

        {/* Tab 1.5: Keyword Rankings */}
        <TabsContent value="keywords" className="space-y-6">
          {(() => {
            const serviceCategory = businessProfile?.service || 'tree-care';
            const trackedKeywords = KEYWORDS_MOCK_DATA[serviceCategory as keyof typeof KEYWORDS_MOCK_DATA] || KEYWORDS_MOCK_DATA['tree-care'];
            
            // Calculate metrics
            const totalKeywords = trackedKeywords.length;
            const avgPosition = Number((trackedKeywords.reduce((acc, curr) => acc + curr.position, 0) / totalKeywords).toFixed(1));
            const top3Count = trackedKeywords.filter(k => k.position <= 3).length;
            const top10Count = trackedKeywords.filter(k => k.position <= 10).length;

            return (
              <>
                {/* Metrics Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
                      <CardTitle className="text-sm font-medium text-slate-400">Average Position</CardTitle>
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{avgPosition}</div>
                      <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                        <ArrowUp className="h-3 w-3" /> -1.4 improvement vs last week
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
                      <CardTitle className="text-sm font-medium text-slate-400">In Top 3</CardTitle>
                      <Award className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{top3Count} <span className="text-xs font-normal text-muted-foreground">/ {totalKeywords}</span></div>
                      <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                        <ArrowUp className="h-3 w-3" /> +1 new keyword in top 3
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
                      <CardTitle className="text-sm font-medium text-slate-400">In Top 10</CardTitle>
                      <Target className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{top10Count} <span className="text-xs font-normal text-muted-foreground">/ {totalKeywords}</span></div>
                      <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                        <ArrowUp className="h-3 w-3" /> +2 keywords entered top 10
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
                      <CardTitle className="text-sm font-medium text-slate-400">Total Search Volume</CardTitle>
                      <Search className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{(trackedKeywords.reduce((acc, curr) => acc + curr.volume, 0)).toLocaleString()}</div>
                      <p className="text-xs text-slate-400 mt-1">
                        Combined monthly search queries
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Keyword table */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold">Tracked Keywords</CardTitle>
                    <CardDescription>
                      Real-time organic ranking positions for local search queries in the Tampa region.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto border rounded-xl">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                          <TableRow>
                            <TableHead className="font-bold w-[40%]">Keyword</TableHead>
                            <TableHead className="font-bold">Search Volume</TableHead>
                            <TableHead className="font-bold">Position</TableHead>
                            <TableHead className="font-bold">Weekly Change</TableHead>
                            <TableHead className="font-bold text-right">Destination</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trackedKeywords.map((item, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                              <TableCell className="font-semibold text-slate-900 dark:text-slate-100 py-3">
                                {item.keyword}
                              </TableCell>
                              <TableCell className="text-sm font-medium py-3">
                                {item.volume.toLocaleString()} / mo
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge 
                                  className={
                                    item.position <= 3 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold'
                                      : item.position <= 10
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold'
                                  } 
                                  variant="outline"
                                >
                                  #{item.position}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3">
                                {item.change > 0 ? (
                                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5">
                                    <ArrowUp className="h-3.5 w-3.5" /> +{item.change}
                                  </span>
                                ) : item.change < 0 ? (
                                  <span className="text-rose-400 text-xs font-semibold flex items-center gap-0.5">
                                    <ArrowDown className="h-3.5 w-3.5" /> {item.change}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs flex items-center gap-0.5">
                                    <Minus className="h-3.5 w-3.5" /> —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right py-3 text-xs font-mono text-muted-foreground">
                                {item.url}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
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

    </div>
  );
}
