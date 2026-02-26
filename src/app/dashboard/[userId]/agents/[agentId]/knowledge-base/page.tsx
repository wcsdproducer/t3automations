'use client';

import React, { useState } from 'react';
import {
  Search,
  Upload,
} from 'lucide-react';
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

export default function KnowledgeBasePage() {
  const [isTextUploadOpen, setIsTextUploadOpen] = useState(false);
  const [isUrlUploadOpen, setIsUrlUploadOpen] = useState(false);

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
              <DropdownMenuItem>File</DropdownMenuItem>
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
                <Input id="text-name" placeholder="" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="text-content">Text Content</Label>
                <Textarea id="text-content" placeholder="" rows={5} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={() => setIsTextUploadOpen(false)}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUrlUploadOpen} onOpenChange={setIsUrlUploadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload URL</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input id="url" placeholder="https://example.com/about" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={() => setIsUrlUploadOpen(false)}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
