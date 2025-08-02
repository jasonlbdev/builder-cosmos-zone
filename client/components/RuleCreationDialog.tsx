import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Info } from 'lucide-react';

interface GraphAPIField {
  id: string;
  name: string;
  apiField: string;
  description: string;
  type: 'string' | 'boolean' | 'number' | 'array';
  conditions: string[];
  examples: string[];
}

const graphAPIFields: GraphAPIField[] = [
  {
    id: 'sender',
    name: 'Sender Email',
    apiField: 'from/emailAddress/address',
    description: 'The email address of the person who sent the message',
    type: 'string',
    conditions: ['contains', 'equals', 'starts_with', 'ends_with', 'regex'],
    examples: ['john@company.com', 'notifications@service.com', '@important-domain.com']
  },
  {
    id: 'senderName',
    name: 'Sender Name',
    apiField: 'from/emailAddress/name',
    description: 'The display name of the person who sent the message',
    type: 'string',
    conditions: ['contains', 'equals', 'starts_with', 'ends_with', 'regex'],
    examples: ['John Smith', 'Marketing Team', 'CEO']
  },
  {
    id: 'toRecipients',
    name: 'To Recipients',
    apiField: 'toRecipients/emailAddress/address',
    description: 'Email addresses in the To field',
    type: 'array',
    conditions: ['contains', 'equals', 'is_null', 'is_not_null'],
    examples: ['me@company.com', 'team@company.com']
  },
  {
    id: 'ccRecipients',
    name: 'CC Recipients',
    apiField: 'ccRecipients/emailAddress/address',
    description: 'Email addresses in the CC field',
    type: 'array',
    conditions: ['contains', 'equals', 'is_null', 'is_not_null'],
    examples: ['me@company.com', 'team@company.com']
  },
  {
    id: 'subject',
    name: 'Subject Line',
    apiField: 'subject',
    description: 'The subject line of the email',
    type: 'string',
    conditions: ['contains', 'equals', 'starts_with', 'ends_with', 'regex'],
    examples: ['Meeting', 'Re: Project Update', 'FYI: System Maintenance']
  },
  {
    id: 'importance',
    name: 'Importance Level',
    apiField: 'importance',
    description: 'The importance level set by the sender',
    type: 'string',
    conditions: ['equals'],
    examples: ['low', 'normal', 'high']
  },
  {
    id: 'hasAttachments',
    name: 'Has Attachments',
    apiField: 'hasAttachments',
    description: 'Whether the email has file attachments',
    type: 'boolean',
    conditions: ['equals'],
    examples: ['true', 'false']
  },
  {
    id: 'conversationId',
    name: 'Conversation Thread',
    apiField: 'conversationId',
    description: 'Unique identifier for the conversation thread',
    type: 'string',
    conditions: ['is_null', 'is_not_null', 'equals'],
    examples: ['AAQkAGQ3Y2ZlOTI...', 'null']
  },
  {
    id: 'categories',
    name: 'Outlook Categories',
    apiField: 'categories',
    description: 'Categories assigned in Outlook',
    type: 'array',
    conditions: ['contains', 'equals', 'is_null', 'is_not_null'],
    examples: ['Red Category', 'Important', 'Follow Up']
  },
  {
    id: 'flag',
    name: 'Follow-up Flag',
    apiField: 'flag',
    description: 'Follow-up flag status',
    type: 'string',
    conditions: ['is_null', 'is_not_null', 'equals'],
    examples: ['flagged', 'complete', 'null']
  },
  {
    id: 'messageClass',
    name: 'Message Class',
    apiField: 'messageClass',
    description: 'The type/class of the message',
    type: 'string',
    conditions: ['equals', 'starts_with'],
    examples: ['IPM.Note', 'IPM.Note.Marketing', 'IPM.Appointment']
  },
  {
    id: 'bodyPreview',
    name: 'Body Preview',
    apiField: 'bodyPreview',
    description: 'First 255 characters of the email body',
    type: 'string',
    conditions: ['contains', 'starts_with', 'regex'],
    examples: ['Thank you for', 'Please review', 'This is an automated']
  }
];

const conditionLabels: Record<string, string> = {
  contains: 'Contains',
  equals: 'Equals',
  starts_with: 'Starts with',
  ends_with: 'Ends with',
  regex: 'Matches regex',
  is_null: 'Is empty',
  is_not_null: 'Is not empty',
  greater_than: 'Greater than',
  less_than: 'Less than'
};

interface RuleCreationDialogProps {
  onCreateRule: (rule: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RuleCreationDialog({ onCreateRule, open, onOpenChange }: RuleCreationDialogProps) {
  const [selectedField, setSelectedField] = useState<GraphAPIField | null>(null);
  const [condition, setCondition] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleFieldSelect = (fieldId: string) => {
    const field = graphAPIFields.find(f => f.id === fieldId);
    if (field) {
      setSelectedField(field);
      setCondition('');
      setValue('');
      setDescription(field.description);
    }
  };

  const handleCreateRule = () => {
    if (!selectedField || !condition) return;

    const rule = {
      type: selectedField.id,
      condition,
      value,
      enabled: true,
      apiField: selectedField.apiField,
      description: description || selectedField.description
    };

    onCreateRule(rule);
    
    // Reset form
    setSelectedField(null);
    setCondition('');
    setValue('');
    setDescription('');
    onOpenChange(false);
  };

  const getAvailableConditions = () => {
    return selectedField?.conditions || [];
  };

  const needsValue = () => {
    return condition && !['is_null', 'is_not_null'].includes(condition);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Email Rule</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Field Selection */}
          <div className="space-y-2">
            <Label htmlFor="field-select">Email Field</Label>
            <Select onValueChange={handleFieldSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select an email field to analyze" />
              </SelectTrigger>
              <SelectContent>
                {graphAPIFields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    <div className="flex items-center space-x-2">
                      <span>{field.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedField && (
              <div className="flex items-start space-x-2 p-3 bg-muted rounded-md">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {selectedField.description}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    API Field: {selectedField.apiField}
                  </p>
                  {selectedField.examples.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs text-muted-foreground">Examples:</span>
                      {selectedField.examples.map((example, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Condition Selection */}
          {selectedField && (
            <div className="space-y-2">
              <Label htmlFor="condition-select">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a condition" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableConditions().map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {conditionLabels[cond] || cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Value Input */}
          {needsValue() && (
            <div className="space-y-2">
              <Label htmlFor="value-input">Value</Label>
              {selectedField?.type === 'boolean' ? (
                <Select value={value} onValueChange={setValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : selectedField?.id === 'importance' ? (
                <Select value={value} onValueChange={setValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="value-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={`Enter ${selectedField?.name.toLowerCase()} value...`}
                  />
                  {selectedField?.id === 'sender' && (
                    <p className="text-xs text-muted-foreground">
                      Tip: Use comma-separated values for multiple emails (e.g., "boss@company.com, hr@company.com")
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Custom Description */}
          <div className="space-y-2">
            <Label htmlFor="description-input">Description (Optional)</Label>
            <Textarea
              id="description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a custom description for this rule..."
              rows={2}
            />
          </div>

          {/* Rule Preview */}
          {selectedField && condition && (needsValue() ? value : true) && (
            <div className="p-3 bg-accent rounded-md">
              <h4 className="text-sm font-medium mb-2">Rule Preview</h4>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline">{selectedField.name}</Badge>
                <span>{conditionLabels[condition]}</span>
                {needsValue() && (
                  <code className="bg-background px-2 py-1 rounded text-xs">
                    {value}
                  </code>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-2">{description}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRule}
            disabled={!selectedField || !condition || (needsValue() && !value)}
          >
            Create Rule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
