'use client';

import React from 'react';
import {
  Search,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function KnowledgeBasePage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b">
        <h1 className="text-lg font-semibold md:text-2xl">Knowledge Base (0)</h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
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
  );
}
