'use client';

import React from 'react';
import {
  Clock,
  Copy,
  Download,
  Filter,
  MoreVertical,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function ConversationsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b">
        <h1 className="text-lg font-semibold md:text-2xl">Conversations (0)</h1>
        <Button variant="outline">Export</Button>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[350px_1fr] lg:grid-cols-[350px_1fr_350px]">
        {/* Left Column: Conversation List */}
        <div className="flex flex-col border-r">
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="pl-8 w-full" />
              </div>
              <Select defaultValue="last-7-days">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-muted-foreground">No Conversations Available</p>
          </div>
        </div>

        {/* Middle Column: Chat Transcript */}
        <div className="flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="flex items-center text-muted-foreground">
                <p>No Messages Available</p>
             </div>
          </div>
           <div className="p-4 border-t bg-background">
             <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span>0:00</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>0:00</span>
                     <Button variant="ghost" size="icon" disabled>
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Details and Actions */}
        <div className="hidden lg:flex flex-col border-l bg-muted/20">
          <div className="p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search..." className="pl-8 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-around">
                     <Button variant="outline" size="icon"><Clock className="h-4 w-4" /></Button>
                     <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
                     <Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button>
                     <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle className="text-base">Note</CardTitle>
                </CardHeader>
                <CardContent>
                     <Textarea placeholder="Leave a note" />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
