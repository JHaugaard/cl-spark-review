import Papa from 'papaparse';
import { PhotoSelectionWithDetails } from './gallery-types';
import { format } from 'date-fns';

export const exportSelectionsToCSV = (selections: PhotoSelectionWithDetails[]) => {
  const csvData = selections.map((selection: any) => ({
    'Photo Filename': selection.photos?.filename || '',
    'Gallery Name': selection.photos?.galleries?.name || '',
    'Reviewer Name': selection.profiles?.full_name || '',
    'Reviewer Email': selection.profiles?.email || '',
    'Selected At': format(new Date(selection.selected_at), 'yyyy-MM-dd HH:mm:ss'),
    'Notes': selection.notes || '',
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `photo-selections-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
