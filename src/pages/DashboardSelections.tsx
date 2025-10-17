import { useState } from 'react';
import Layout from '@/components/Layout';
import { useAllSelections } from '@/hooks/useAllSelections';
import { useGalleries } from '@/hooks/useGalleries';
import { useGuestManagement } from '@/hooks/useGuestManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search } from 'lucide-react';
import { exportSelectionsToCSV } from '@/lib/csv-export';
import { format } from 'date-fns';

const DashboardSelections = () => {
  const { data: selections, isLoading } = useAllSelections();
  const { data: galleries } = useGalleries();
  const { data: guests } = useGuestManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGallery, setSelectedGallery] = useState<string>('all');
  const [selectedGuest, setSelectedGuest] = useState<string>('all');

  // Filter selections based on criteria
  const filteredSelections = selections?.filter((selection: any) => {
    const matchesSearch = 
      selection.photos?.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      selection.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      selection.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGallery = selectedGallery === 'all' || 
      selection.photos?.galleries?.id === selectedGallery;

    const matchesGuest = selectedGuest === 'all' || 
      selection.reviewer_id === selectedGuest;

    return matchesSearch && matchesGallery && matchesGuest;
  }) || [];

  const handleExport = () => {
    if (filteredSelections.length > 0) {
      exportSelectionsToCSV(filteredSelections);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">All Selections</h1>
            <p className="mt-2 text-muted-foreground">
              {filteredSelections.length} selection{filteredSelections.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Button 
            onClick={handleExport} 
            disabled={filteredSelections.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export {filteredSelections.length > 0 && `(${filteredSelections.length})`}
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search photos, guests, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedGallery} onValueChange={setSelectedGallery}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by gallery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Galleries</SelectItem>
              {galleries?.map((gallery) => (
                <SelectItem key={gallery.id} value={gallery.id}>
                  {gallery.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedGuest} onValueChange={setSelectedGuest}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by guest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Guests</SelectItem>
              {guests?.map((guest) => (
                <SelectItem key={guest.id} value={guest.id}>
                  {guest.full_name || guest.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Gallery</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Selected At</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredSelections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No selections found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSelections.map((selection: any) => (
                  <TableRow key={selection.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <img
                          src={selection.photos?.thumbnail_url}
                          alt={selection.photos?.filename}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <span className="text-sm">{selection.photos?.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell>{selection.photos?.galleries?.name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{selection.profiles?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{selection.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(selection.selected_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {selection.notes ? (
                        <span className="text-sm">{selection.notes}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No notes</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardSelections;
