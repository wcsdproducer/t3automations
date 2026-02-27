
'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Search, Upload, File as FileIcon, Link as LinkIcon, FileText, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser, useFirestore, useStorage, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function KnowledgeBasePage() {
  const params = useParams();
  const userId = params.userId as string;
  const agentId = params.agentId as string;
  const [isTextUploadOpen, setIsTextUploadOpen] = useState(false);
  const [isUrlUploadOpen, setIsUrlUploadOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);

  const [textName, setTextName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const knowledgeBaseQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `businessProfiles/${user.uid}/knowledgeBase`);
  }, [user, firestore]);

  const { data: knowledgeBaseItems, isLoading } = useCollection(knowledgeBaseQuery);


  const handleTextUpload = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    if (!textName.trim() || !textContent.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Text name and content are required." });
      return;
    }

    const id = crypto.randomUUID();
    const docRef = doc(firestore, `businessProfiles/${user.uid}/knowledgeBase`, id);
    const data = {
      id,
      businessProfileId: user.uid,
      name: textName,
      type: 'text',
      content: textContent,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, data);
      toast({ title: "Text Uploaded", description: "The text has been added to the knowledge base." });
      setIsTextUploadOpen(false);
      setTextName('');
      setTextContent('');
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to upload text." });
    }
  };

  const handleUrlUpload = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    if (!url.trim()) {
      toast({ variant: "destructive", title: "Error", description: "URL is required." });
      return;
    }

    try {
      new URL(url);
    } catch (_) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a valid URL." });
      return;
    }
    
    const id = crypto.randomUUID();
    const docRef = doc(firestore, `businessProfiles/${user.uid}/knowledgeBase`, id);
    const data = {
      id,
      businessProfileId: user.uid,
      name: url,
      type: 'url',
      content: url,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, data);
      toast({ title: "URL Uploaded", description: "The URL has been added to the knowledge base." });
      setIsUrlUploadOpen(false);
      setUrl('');
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to upload URL." });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 50 * 1024 * 1024) { // 50MB
        toast({ variant: 'destructive', title: 'File too large', description: 'Maximum file size is 50 MB.' });
        return;
      }
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "Error", description: "Please select a file to upload." });
      return;
    }
    if (!user || !firestore || !storage) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }

    setIsUploading(true);
    
    const filePath = `businessProfiles/${user.uid}/knowledgeBase/files/${crypto.randomUUID()}-${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);

    try {
        await uploadBytes(fileStorageRef, file);
        const downloadURL = await getDownloadURL(fileStorageRef);

        const id = crypto.randomUUID();
        const docRef = doc(firestore, `businessProfiles/${user.uid}/knowledgeBase`, id);
        const data = {
            id,
            businessProfileId: user.uid,
            name: file.name,
            type: 'file',
            content: downloadURL,
            createdAt: new Date().toISOString(),
        };

        await setDoc(docRef, data);
        toast({ title: "File Uploaded", description: "The file has been added to the knowledge base." });
        setIsFileUploadOpen(false);
        setFile(null);
    } catch (error: any) {
        console.error(error);
        toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Could not upload file." });
    } finally {
        setIsUploading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `businessProfiles/${user.uid}/knowledgeBase`, itemId);
    try {
      await deleteDoc(docRef);
      toast({ title: 'Item deleted', description: 'The knowledge base item has been removed.' });
    } catch (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete item.' });
    }
  };
  
  const renderIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileIcon className="h-5 w-5 text-muted-foreground" />;
      case 'url':
        return <LinkIcon className="h-5 w-5 text-muted-foreground" />;
      case 'text':
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      default:
        return <FileIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };


  return (
    <>
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b">
          <h1 className="text-lg font-semibold md:text-2xl">Knowledge Base ({knowledgeBaseItems?.length || 0})</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsFileUploadOpen(true)}>File</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsUrlUploadOpen(true)}>URL</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsTextUploadOpen(true)}>
                Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col flex-1">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full md:w-1/3"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : knowledgeBaseItems && knowledgeBaseItems.length > 0 ? (
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {knowledgeBaseItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{renderIcon(item.type)}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {item.type === 'url' ? (
                          <a href={item.content} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {item.content}
                          </a>
                        ) : (
                          item.content
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(item.createdAt), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-muted-foreground">No Data Sources Available</p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isTextUploadOpen} onOpenChange={setIsTextUploadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Plain Text</DialogTitle>
          </DialogHeader>
          <div className="grid gap-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="text-name">Text Name</Label>
                <Input id="text-name" value={textName} onChange={(e) => setTextName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="text-content">Text Content</Label>
                <Textarea id="text-content" value={textContent} onChange={(e) => setTextContent(e.target.value)} rows={5} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleTextUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUrlUploadOpen} onOpenChange={setIsUrlUploadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload URL</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input id="url" placeholder="https://example.com/about" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleUrlUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                {file ? (
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <FileIcon className='h-6 w-6' />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground">Drop file here or</p>
                    <Button variant="outline" className="mt-2" asChild><span>Browse</span></Button>
                  </>
                )}
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileSelect} />
            </label>
            <p className="text-sm text-muted-foreground mt-2">Maximum file size: 50 MB</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleFileUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
