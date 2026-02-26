'use client';

import React from 'react';
import {
  Import,
  ListFilter,
  Search,
  Settings,
  Copy,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";


export default function LeadsPage() {

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b">
        <h1 className="text-lg font-semibold md:text-2xl">Leads (0)</h1>
        <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground hidden md:block">Items per page</div>
            <Select defaultValue="25">
                <SelectTrigger className="w-auto">
                    <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                </SelectContent>
            </Select>
            <Button>
                <Import className="mr-2 h-4 w-4" />
                Import
            </Button>
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search by phone number"
                className="pl-8 w-full md:w-64"
                />
            </div>
            <Button variant="outline">Export</Button>
          </div>
        </div>
        <div className="p-4 border-b">
            <div className="flex items-center gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4"/>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Lead Tags</DialogTitle>
                            <DialogDescription>
                                Create and manage tag options for your leads.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-8">
                            <div className="space-y-2">
                                <Input id="add-tag" placeholder="Add a tag..." />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Tagging Webhook</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Automate lead tagging by sending requests to this webhook URL. You can use this URL in your CRM or other tools to automatically tag leads based on your criteria.
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="bg-slate-950 text-slate-100 p-4 rounded-md text-sm font-mono overflow-x-auto">
                                        <pre>
                                            <code className="text-xs sm:text-sm">
                                                <span className="text-sky-400">POST</span> /agents/6942f9ebe0e8bc65d913034b/leads/attach-tags<br /><br />
                                                <span>Headers:</span><br />
                                                Authorization: "CD.CL.48d07c31e6bdb02ba2111e2e13de0197"<br /><br />
                                                <span>Body:</span><br />
                                                {`{
  "leadPhoneNumber": "string",
  "tagId": "string"
}`}
                                            </code>
                                        </pre>
                                    </div>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:bg-slate-800">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Send a POST request to the above endpoint with the phone number of the lead and the ID of the corresponding tag you want to attach to the lead in the request body.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Checkbox id="select-all" />
            </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-xl font-semibold">No Leads</h3>
          <p className="text-muted-foreground">Import leads to get started.</p>
        </div>
      </div>
    </main>
  );
}
