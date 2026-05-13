'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit2, Plus, Phone, Mail, FileText, User } from 'lucide-react';
import { Lead, LeadStatus, LeadSource } from '@/types/crm';

const formatPhoneNumber = (phone: string | undefined | null) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function LeadsManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    phone: '',
    email: '',
    source: 'manual',
    status: 'new',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized so useCollection gets a stable ref — prevents infinite re-render loop
  const leadsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `businessProfiles/${user.uid}/leads`);
  }, [user, firestore]);

  const { data: leads, isLoading } = useCollection(leadsRef);

  const handleOpenDialog = (lead?: Lead) => {
    if (lead) {
      setEditingLeadId(lead.id);
      setFormData(lead);
    } else {
      setEditingLeadId(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        source: 'manual',
        status: 'new',
        notes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveLead = async () => {
    if (!user || !firestore) return;
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Name is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const leadId = editingLeadId || crypto.randomUUID();
      const docRef = doc(firestore, `businessProfiles/${user.uid}/leads/${leadId}`);
      
      const payload: Partial<Lead> & { businessProfileId?: string } = {
        ...formData,
        id: leadId,
        businessProfileId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (!editingLeadId) {
        payload.createdAt = new Date().toISOString();
        payload.agentSummary = '';
      }

      await setDocumentNonBlocking(docRef, payload, { merge: true });

      toast({
        title: editingLeadId ? 'Lead Updated' : 'Lead Added',
        description: 'The lead has been saved successfully.',
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!user || !firestore) return;
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const docRef = doc(firestore, `businessProfiles/${user.uid}/leads/${leadId}`);
      await deleteDoc(docRef);
      toast({
        title: 'Lead Deleted',
        description: 'The lead has been permanently removed.',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const leadsList = leads as Lead[] | undefined;

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Leads</CardTitle>
          <CardDescription>
            View and manage all captured leads from your landing pages and inbound calls.
          </CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </CardHeader>
      <CardContent>
        {leadsList && leadsList.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsList.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {lead.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {formatPhoneNumber(lead.phone)}
                          </span>
                        )}
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {lead.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                        {lead.source.replace('-', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`capitalize text-sm px-2 py-1 rounded-full font-medium ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(lead)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLead(lead.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-lg border border-dashed">
            <User className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No leads found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              You haven't captured any leads yet. Once visitors submit the form on your landing page or call your AI agent, they will appear here.
            </p>
            <Button onClick={() => handleOpenDialog()} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add your first lead manually
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingLeadId ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
              <DialogDescription>
                {editingLeadId ? 'Update the details for this lead below.' : 'Manually enter a new lead into your CRM.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    value={formData.name || ''} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(val: LeadStatus) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    value={formData.phone || ''} 
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })} 
                    placeholder="+1 (555) 000-0000" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    value={formData.email || ''} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <Select 
                  value={formData.source} 
                  onValueChange={(val: LeadSource) => setFormData({ ...formData, source: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                    <SelectItem value="inbound-call">Inbound Call</SelectItem>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea 
                  value={formData.notes || ''} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                  placeholder="Additional context or conversation notes..." 
                  rows={3}
                />
              </div>
              {formData.agentSummary && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" /> 
                    AI Agent Summary
                  </label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {formData.agentSummary}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSaveLead} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
