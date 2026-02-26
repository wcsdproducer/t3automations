'use client';

import React from 'react';
import {
  Import,
  ListFilter,
  Search,
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
                <Button variant="ghost" size="icon">
                    <ListFilter className="h-4 w-4"/>
                </Button>
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
