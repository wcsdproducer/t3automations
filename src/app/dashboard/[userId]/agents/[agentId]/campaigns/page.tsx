'use client';

import React from 'react';
import {
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CampaignsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b">
        <h1 className="text-lg font-semibold md:text-2xl">Campaigns</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      </div>
      <div className="flex-1 flex flex-col">
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
