'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function TopicsPage() {
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [open, setOpen] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
        setTopicName('');
        setTopicDescription('');
    }
  }, [open]);

  const handleCreateTopic = () => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create a topic.",
        });
        return;
    }
    if (!topicName.trim()) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Topic name is required.",
        });
        return;
    }

    const topicId = crypto.randomUUID();
    const topicRef = doc(firestore, `businessProfiles/${user.uid}/topics`, topicId);
    const topicData = {
        id: topicId,
        businessProfileId: user.uid,
        name: topicName,
        description: topicDescription,
        createdAt: new Date().toISOString(),
    };

    setDoc(topicRef, topicData)
        .then(() => {
             toast({ title: "Topic Created", description: "The new topic has been added." });
             setOpen(false);
        })
        .catch((error) => {
            console.error("Firestore Error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create topic. Please try again.",
            });
        });
  };


  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b">
        <h1 className="text-lg font-semibold md:text-2xl">Topics</h1>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Topic
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Topic</DialogTitle>
                    <DialogDescription>
                        Adding a description about the topic can improve the accuracy of topic assignments by the AI.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="topic-name" className="text-right">
                            Topic Name
                        </Label>
                        <Input 
                            id="topic-name" 
                            value={topicName}
                            onChange={(e) => setTopicName(e.target.value)}
                            className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="topic-description" className="text-right">
                            Topic Description
                        </Label>
                        <Input 
                            id="topic-description" 
                            value={topicDescription}
                            onChange={(e) => setTopicDescription(e.target.value)}
                            className="col-span-3"
                            placeholder="(optional)"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleCreateTopic}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col flex-1">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full md:w-64"
                />
            </div>
            <Select defaultValue="last-7-days">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="last-7-days">Last 7 days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 days</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-muted-foreground">No Topics Available</p>
        </div>
      </div>
    </main>
  );
}

    