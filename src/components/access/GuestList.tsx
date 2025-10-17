import { Guest } from '@/lib/gallery-types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface GuestWithAccess extends Guest {
  hasAccess: boolean;
}

interface GuestListProps {
  guests: GuestWithAccess[];
  onToggle: (guestId: string, currentAccess: boolean) => void;
  disabled?: boolean;
}

export const GuestList = ({ guests, onToggle, disabled }: GuestListProps) => {
  return (
    <div className="space-y-3">
      {guests.map((guest) => (
        <div
          key={guest.id}
          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
        >
          <div className="flex-1">
            <p className="font-medium">{guest.full_name || 'No name'}</p>
            <p className="text-sm text-muted-foreground">{guest.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`guest-${guest.id}`}
              checked={guest.hasAccess}
              onCheckedChange={() => onToggle(guest.id, guest.hasAccess)}
              disabled={disabled}
            />
            <Label
              htmlFor={`guest-${guest.id}`}
              className="cursor-pointer text-sm font-normal"
            >
              {guest.hasAccess ? 'Has access' : 'No access'}
            </Label>
          </div>
        </div>
      ))}
    </div>
  );
};
