
'use client';

import React, { useState } from 'react';
import { Search, Upload, File as FileIcon } from 'lucide-react';
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
import { useUser, useFirestore, useStorage } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function KnowledgeBasePage() {
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
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to upload text." });
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
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to upload URL." });
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
    
    const filePath = `knowledgeBase/${user.uid}/${crypto.randomUUID()}-${file.name}`;
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
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload file." });
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <>
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b">
          <h1 className="text-lg font-semibold md:text-2xl">Knowledge Base (0)</h1>
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
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-muted-foreground">No Data Sources Available</p>
          </div>
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
            <p className="text-sm text-muted-foreground mt-2">Maximum size: 50 MB</p>
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
