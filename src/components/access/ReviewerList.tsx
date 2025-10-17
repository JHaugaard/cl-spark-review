import { Reviewer } from '@/lib/gallery-types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ReviewerWithAccess extends Reviewer {
  hasAccess: boolean;
}

interface ReviewerListProps {
  reviewers: ReviewerWithAccess[];
  onToggle: (reviewerId: string, currentAccess: boolean) => void;
  disabled?: boolean;
}

export const ReviewerList = ({ reviewers, onToggle, disabled }: ReviewerListProps) => {
  return (
    <div className="space-y-3">
      {reviewers.map((reviewer) => (
        <div
          key={reviewer.id}
          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
        >
          <div className="flex-1">
            <p className="font-medium">{reviewer.full_name || 'No name'}</p>
            <p className="text-sm text-muted-foreground">{reviewer.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`reviewer-${reviewer.id}`}
              checked={reviewer.hasAccess}
              onCheckedChange={() => onToggle(reviewer.id, reviewer.hasAccess)}
              disabled={disabled}
            />
            <Label
              htmlFor={`reviewer-${reviewer.id}`}
              className="cursor-pointer text-sm font-normal"
            >
              {reviewer.hasAccess ? 'Has access' : 'No access'}
            </Label>
          </div>
        </div>
      ))}
    </div>
  );
};
