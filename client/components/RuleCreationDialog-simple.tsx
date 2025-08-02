import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RuleCreationDialogProps {
  onCreateRule: (rule: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RuleCreationDialog({ onCreateRule, open, onOpenChange }: RuleCreationDialogProps) {
  const [title, setTitle] = useState('');

  const handleCreateRule = () => {
    onCreateRule({
      type: 'keywords',
      condition: 'contains',
      value: title,
      enabled: true
    });
    setTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Simple Rule</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="rule-title">Rule Value</Label>
            <Input
              id="rule-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter rule value..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateRule} disabled={!title}>
            Create Rule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
