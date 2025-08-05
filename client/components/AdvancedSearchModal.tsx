import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  X,
  CalendarIcon,
  Filter,
  Plus,
  Minus,
  FileText,
  Mail,
  MessageSquare,
  Users,
  Tag,
  Calendar as CalendarIconOutline,
  Clock,
  Star,
  Archive,
  Trash,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchFilter {
  field: string;
  operator: string;
  value: string;
  type: "text" | "date" | "boolean" | "select";
}

interface AdvancedSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilter[], query: string) => void;
  initialQuery?: string;
}

const searchFields = [
  { value: "sender", label: "Sender", type: "text", icon: Users },
  { value: "subject", label: "Subject", type: "text", icon: FileText },
  { value: "content", label: "Content", type: "text", icon: Mail },
  { value: "platform", label: "Platform", type: "select", icon: MessageSquare },
  { value: "category", label: "Category", type: "select", icon: Tag },
  { value: "date", label: "Date", type: "date", icon: CalendarIconOutline },
  { value: "hasAttachments", label: "Has Attachments", type: "boolean", icon: FileText },
  { value: "isUnread", label: "Unread", type: "boolean", icon: Mail },
  { value: "isImportant", label: "Important", type: "boolean", icon: Star },
  { value: "labels", label: "Labels", type: "text", icon: Tag },
];

const operators = {
  text: [
    { value: "contains", label: "Contains" },
    { value: "equals", label: "Equals" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "notContains", label: "Does not contain" },
  ],
  date: [
    { value: "equals", label: "On" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
  ],
  boolean: [
    { value: "is", label: "Is" },
    { value: "isNot", label: "Is not" },
  ],
  select: [
    { value: "equals", label: "Is" },
    { value: "notEquals", label: "Is not" },
  ],
};

const platformOptions = [
  { value: "Gmail", label: "Gmail", icon: "📧" },
  { value: "Outlook", label: "Outlook", icon: "📨" },
  { value: "Slack", label: "Slack", icon: "💼" },
  { value: "WhatsApp", label: "WhatsApp", icon: "💬" },
  { value: "Telegram", label: "Telegram", icon: "📨" },
];

const categoryOptions = [
  { value: "To Respond", label: "To Respond", color: "bg-red-500" },
  { value: "FYI", label: "FYI", color: "bg-blue-500" },
  { value: "Important", label: "Important", color: "bg-yellow-500" },
  { value: "Marketing", label: "Marketing", color: "bg-purple-500" },
  { value: "Updates", label: "Updates", color: "bg-indigo-500" },
  { value: "Promotions", label: "Promotions", color: "bg-green-500" },
];

const savedSearches = [
  { name: "Unread from team", filters: 2, lastUsed: "2h ago" },
  { name: "Important emails this week", filters: 3, lastUsed: "1d ago" },
  { name: "Client communications", filters: 1, lastUsed: "3d ago" },
];

export default function AdvancedSearchModal({
  open,
  onClose,
  onSearch,
  initialQuery = "",
}: AdvancedSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [activeTab, setActiveTab] = useState("filters");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showCalendar, setShowCalendar] = useState(false);

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        field: "sender",
        operator: "contains",
        value: "",
        type: "text",
      },
    ]);
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    
    // Update operator and type when field changes
    if (updates.field) {
      const fieldConfig = searchFields.find(f => f.value === updates.field);
      if (fieldConfig) {
        newFilters[index].type = fieldConfig.type as SearchFilter['type'];
        newFilters[index].operator = operators[fieldConfig.type as keyof typeof operators][0].value;
        newFilters[index].value = "";
      }
    }
    
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    const allFilters = [...filters];
    
    // Add platform filters
    if (selectedPlatforms.length > 0) {
      selectedPlatforms.forEach(platform => {
        allFilters.push({
          field: "platform",
          operator: "equals",
          value: platform,
          type: "select",
        });
      });
    }
    
    // Add category filters
    if (selectedCategories.length > 0) {
      selectedCategories.forEach(category => {
        allFilters.push({
          field: "category",
          operator: "equals",
          value: category,
          type: "select",
        });
      });
    }
    
    // Add date range filters
    if (dateRange.from) {
      allFilters.push({
        field: "date",
        operator: dateRange.to ? "between" : "after",
        value: dateRange.to 
          ? `${format(dateRange.from, "yyyy-MM-dd")}|${format(dateRange.to, "yyyy-MM-dd")}`
          : format(dateRange.from, "yyyy-MM-dd"),
        type: "date",
      });
    }
    
    onSearch(allFilters, query);
    onClose();
  };

  const clearAll = () => {
    setQuery("");
    setFilters([]);
    setSelectedPlatforms([]);
    setSelectedCategories([]);
    setDateRange({});
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Advanced Search</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Search Query */}
          <div className="space-y-2">
            <Label>Search Query</Label>
            <Input
              placeholder="Enter your search terms..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="filters">Custom Filters</TabsTrigger>
              <TabsTrigger value="quick">Quick Filters</TabsTrigger>
              <TabsTrigger value="saved">Saved Searches</TabsTrigger>
              <TabsTrigger value="cross-platform">Cross-Platform</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Search Filters</Label>
                <Button size="sm" onClick={addFilter}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Filter
                </Button>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Select
                        value={filter.field}
                        onValueChange={(value) => updateFilter(index, { field: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {searchFields.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              <div className="flex items-center space-x-2">
                                <field.icon className="w-4 h-4" />
                                <span>{field.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(index, { operator: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators[filter.type].map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {filter.type === "text" && (
                        <Input
                          placeholder="Value..."
                          value={filter.value}
                          onChange={(e) => updateFilter(index, { value: e.target.value })}
                          className="flex-1"
                        />
                      )}

                      {filter.type === "select" && filter.field === "platform" && (
                        <Select
                          value={filter.value}
                          onValueChange={(value) => updateFilter(index, { value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select platform..." />
                          </SelectTrigger>
                          <SelectContent>
                            {platformOptions.map((platform) => (
                              <SelectItem key={platform.value} value={platform.value}>
                                <div className="flex items-center space-x-2">
                                  <span>{platform.icon}</span>
                                  <span>{platform.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {filter.type === "select" && filter.field === "category" && (
                        <Select
                          value={filter.value}
                          onValueChange={(value) => updateFilter(index, { value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center space-x-2">
                                  <div className={cn("w-3 h-3 rounded", category.color)} />
                                  <span>{category.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {filter.type === "boolean" && (
                        <Select
                          value={filter.value}
                          onValueChange={(value) => updateFilter(index, { value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select value..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFilter(index)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {filters.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No filters added yet. Click "Add Filter" to start.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="quick" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Platforms */}
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="space-y-2">
                    {platformOptions.map((platform) => (
                      <div key={platform.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`platform-${platform.value}`}
                          checked={selectedPlatforms.includes(platform.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, platform.value]);
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.value));
                            }
                          }}
                        />
                        <label htmlFor={`platform-${platform.value}`} className="flex items-center space-x-2 cursor-pointer">
                          <span>{platform.icon}</span>
                          <span>{platform.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="space-y-2">
                    {categoryOptions.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.value}`}
                          checked={selectedCategories.includes(category.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category.value]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category.value));
                            }
                          }}
                        />
                        <label htmlFor={`category-${category.value}`} className="flex items-center space-x-2 cursor-pointer">
                          <div className={cn("w-3 h-3 rounded", category.color)} />
                          <span>{category.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                      onSelect={(range) => setDateRange(range || {})}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <div className="space-y-2">
                <Label>Saved Searches</Label>
                <div className="space-y-2">
                  {savedSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <div>
                        <p className="font-medium">{search.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {search.filters} filter{search.filters !== 1 ? 's' : ''} • Last used {search.lastUsed}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">Load</Button>
                        <Button size="sm" variant="outline">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cross-platform" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <Label>Cross-Platform Search</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Search across multiple platforms and document types simultaneously.
                </p>
                
                <div className="space-y-2">
                  <Label>Search in:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="search-emails" defaultChecked />
                      <label htmlFor="search-emails" className="flex items-center space-x-2 cursor-pointer">
                        <Mail className="w-4 h-4" />
                        <span>Emails</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="search-messages" defaultChecked />
                      <label htmlFor="search-messages" className="flex items-center space-x-2 cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        <span>Messages</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="search-tasks" />
                      <label htmlFor="search-tasks" className="flex items-center space-x-2 cursor-pointer">
                        <Clock className="w-4 h-4" />
                        <span>Tasks</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="search-calendar" />
                      <label htmlFor="search-calendar" className="flex items-center space-x-2 cursor-pointer">
                        <CalendarIconOutline className="w-4 h-4" />
                        <span>Calendar Events</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Summary */}
          {(filters.length > 0 || selectedPlatforms.length > 0 || selectedCategories.length > 0 || dateRange.from) && (
            <div className="space-y-2">
              <Label>Search Summary</Label>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {searchFields.find(f => f.value === filter.field)?.label} {filter.operator} "{filter.value}"
                  </Badge>
                ))}
                {selectedPlatforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    Platform: {platform}
                  </Badge>
                ))}
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    Category: {category}
                  </Badge>
                ))}
                {dateRange.from && (
                  <Badge variant="secondary" className="text-xs">
                    Date: {format(dateRange.from, "MMM dd")}
                    {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
