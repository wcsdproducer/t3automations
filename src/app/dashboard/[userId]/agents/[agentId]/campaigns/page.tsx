'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export default function CampaignsPage() {
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [date, setDate] = React.useState<Date>();

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b">
        <h1 className="text-lg font-semibold md:text-2xl">Campaigns</h1>
        <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Create a campaign to send messages to your leads.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh]">
                <ScrollArea className="pr-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="campaign-name">Campaign Name</Label>
                                <Input id="campaign-name" defaultValue="My Campaign" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="campaign-start-date">Campaign Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Leads to Call (0)</Label>
                            <div className="grid grid-cols-2 gap-4 items-start">
                                <div className="space-y-4 text-center">
                                    <p className="text-sm text-muted-foreground">Select from existing leads</p>
                                     <div className="flex flex-col gap-2 items-center">
                                        <Button variant="outline" size="sm" className="w-full">All Leads</Button>
                                        <Button variant="outline" size="sm" className="w-full">Untagged Leads</Button>
                                        <Button variant="outline" size="sm" className="w-full">Answered Call</Button>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 text-center">
                                    <p className="text-sm text-muted-foreground">or Upload a CSV of leads</p>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                                <p className="text-xs text-muted-foreground">Drop file here or <br/> click to browse</p>
                                            </div>
                                            <Input id="dropzone-file" type="file" className="hidden" />
                                        </label>
                                    </div> 
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Phone Numbers</Label>
                            <p className="text-sm text-muted-foreground">Select the phone number to use to make the outbound calls. If multiple numbers are selected, the system will cycle through them to make calls.</p>
                            <div className="p-4 bg-muted/50 rounded-md">
                                <p className="text-sm font-semibold text-destructive">No phone numbers available</p>
                                <p className="text-xs text-muted-foreground">(Assign phone numbers for the client under Client Details {'>'} Phone Numbers.)</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Calling Days</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sunday" />
                                    <label htmlFor="sunday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sunday</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="monday" defaultChecked/>
                                    <label htmlFor="monday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Monday</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="tuesday" defaultChecked/>
                                    <label htmlFor="tuesday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tuesday</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="wednesday" defaultChecked/>
                                    <label htmlFor="wednesday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Wednesday</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="thursday" defaultChecked/>
                                    <label htmlFor="thursday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Thursday</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="friday" defaultChecked/>
                                    <label htmlFor="friday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Friday</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="saturday" />
                                    <label htmlFor="saturday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Saturday</label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Calling Hours</Label>
                            <div className="flex items-center gap-2">
                                <Input type="time" defaultValue="09:00" />
                                <span>-</span>
                                <Input type="time" defaultValue="17:00" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Time Zone</Label>
                            <p className="text-sm text-muted-foreground">Auto: Calls made based on each lead's time zone</p>
                        </div>
                    </div>
                </ScrollArea>
                <div className="space-y-4 flex flex-col">
                    <h3 className="font-semibold">Leads Preview</h3>
                    <div className="border rounded-md flex-grow">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Tags</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={3} className="h-full text-center">
                                        <div className="flex items-center justify-center h-48">
                                          <p className="text-sm text-muted-foreground">No leads selected</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={() => setIsCreateCampaignOpen(false)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by campaign name"
              className="pl-8 w-full md:w-1/3"
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-muted-foreground">No campaigns found. Create a campaign to begin.</p>
        </div>
      </div>
    </main>
  );
}
