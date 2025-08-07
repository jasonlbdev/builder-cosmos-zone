import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  Star,
  Users,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilter {
  field: string;
  operator: string;
  value: string;
  type: "text" | "date" | "boolean" | "select";
}

interface SearchResult {
  id: string;
  type: "email" | "message" | "task" | "event";
  title: string;
  content: string;
  sender?: string;
  platform?: string;
  platformLogo?: string;
  time: string;
  avatar: string;
  category?: string;
  categoryColor?: string;
  matchedFields: string[];
  relevanceScore: number;
  highlights: {
    field: string;
    matches: Array<{ text: string; isMatch: boolean }>;
  }[];
}

interface SearchResultsViewProps {
  results: SearchResult[];
  query: string;
  filters: SearchFilter[];
  onResultSelect: (result: SearchResult) => void;
  onClearFilter: (filterIndex: number) => void;
  onClearAllFilters: () => void;
  isLoading?: boolean;
  className?: string;
}

const getResultTypeIcon = (type: string) => {
  switch (type) {
    case "email":
      return <Mail className="w-4 h-4" />;
    case "message":
      return <MessageSquare className="w-4 h-4" />;
    case "task":
      return <Clock className="w-4 h-4" />;
    case "event":
      return <Calendar className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getResultTypeColor = (type: string) => {
  switch (type) {
    case "email":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "message":
      return "bg-green-100 text-green-800 border-green-200";
    case "task":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "event":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const HighlightedText = ({ 
  highlights, 
  maxLength = 200 
}: { 
  highlights: Array<{ text: string; isMatch: boolean }>; 
  maxLength?: number;
}) => {
  const fullText = highlights.map(h => h.text).join("");
  const truncated = fullText.length > maxLength;
  const displayText = truncated ? fullText.substring(0, maxLength) + "..." : fullText;
  
  // Re-create highlights for truncated text
  let currentPos = 0;
  const truncatedHighlights: Array<{ text: string; isMatch: boolean }> = [];
  
  for (const highlight of highlights) {
    if (currentPos >= maxLength) break;
    
    const remainingLength = maxLength - currentPos;
    const textToAdd = highlight.text.substring(0, remainingLength);
    
    if (textToAdd) {
      truncatedHighlights.push({
        text: textToAdd,
        isMatch: highlight.isMatch
      });
      currentPos += textToAdd.length;
    }
  }
  
  return (
    <span>
      {truncatedHighlights.map((highlight, index) => (
        <span
          key={index}
          className={cn(
            highlight.isMatch && "bg-yellow-200 text-yellow-900 font-medium px-1 rounded"
          )}
        >
          {highlight.text}
        </span>
      ))}
      {truncated && <span className="text-muted-foreground">...</span>}
    </span>
  );
};

const SearchResultItem = ({ 
  result, 
  onSelect, 
  viewMode 
}: { 
  result: SearchResult; 
  onSelect: (result: SearchResult) => void;
  viewMode: "list" | "grid";
}) => {
  const titleHighlight = result.highlights.find(h => h.field === "title" || h.field === "subject");
  const contentHighlight = result.highlights.find(h => h.field === "content" || h.field === "preview");
  
  if (viewMode === "grid") {
    return (
      <div
        className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
        onClick={() => onSelect(result)}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">{result.avatar}</AvatarFallback>
              </Avatar>
              <Badge variant="outline" className={cn("text-xs", getResultTypeColor(result.type))}>
                {getResultTypeIcon(result.type)}
                <span className="ml-1 capitalize">{result.type}</span>
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {Math.round(result.relevanceScore * 100)}% match
              </Badge>
            </div>
          </div>
          
          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-2">
            {titleHighlight ? (
              <HighlightedText highlights={titleHighlight.matches} maxLength={80} />
            ) : (
              result.title
            )}
          </h4>
          
          {/* Content Preview */}
          <p className="text-xs text-muted-foreground line-clamp-3">
            {contentHighlight ? (
              <HighlightedText highlights={contentHighlight.matches} maxLength={150} />
            ) : (
              result.content
            )}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              {result.platform && (
                <span className="flex items-center space-x-1">
                  <span>{result.platformLogo}</span>
                  <span>{result.platform}</span>
                </span>
              )}
              {result.sender && <span>• {result.sender}</span>}
            </div>
            <span>{result.time}</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className="p-4 border-b border-border hover:bg-accent cursor-pointer transition-colors"
      onClick={() => onSelect(result)}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs">{result.avatar}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={cn("text-xs", getResultTypeColor(result.type))}>
                {getResultTypeIcon(result.type)}
                <span className="ml-1 capitalize">{result.type}</span>
              </Badge>
              
              {result.platform && (
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">{result.platformLogo}</span>
                  {result.platform}
                </Badge>
              )}
              
              <Badge variant="secondary" className="text-xs">
                {Math.round(result.relevanceScore * 100)}% match
              </Badge>
            </div>
            
            <span className="text-xs text-muted-foreground">{result.time}</span>
          </div>
          
          {/* Title */}
          <h4 className="font-medium text-sm">
            {titleHighlight ? (
              <HighlightedText highlights={titleHighlight.matches} maxLength={120} />
            ) : (
              result.title
            )}
          </h4>
          
          {/* Content */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {contentHighlight ? (
              <HighlightedText highlights={contentHighlight.matches} />
            ) : (
              result.content
            )}
          </p>
          
          {/* Matched Fields */}
          {result.matchedFields.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">Matches in:</span>
              {result.matchedFields.map((field, index) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Sender */}
          {result.sender && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{result.sender}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SearchResultsView({
  results,
  query,
  filters,
  onResultSelect,
  onClearFilter,
  onClearAllFilters,
  isLoading = false,
  className,
}: SearchResultsViewProps) {
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "sender">("relevance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterType, setFilterType] = useState<"all" | "email" | "message" | "task" | "event">("all");
  
  // Group results by type
  const resultsByType = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);
  
  // Filter and sort results
  let filteredResults = filterType === "all" ? results : results.filter(r => r.type === filterType);
  
  filteredResults = filteredResults.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "relevance":
        comparison = b.relevanceScore - a.relevanceScore;
        break;
      case "date":
        comparison = new Date(b.time).getTime() - new Date(a.time).getTime();
        break;
      case "sender":
        comparison = (a.sender || "").localeCompare(b.sender || "");
        break;
    }
    
    return sortOrder === "asc" ? -comparison : comparison;
  });
  
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Searching across platforms...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <h3 className="font-medium">Search Results</h3>
            <Badge variant="secondary">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-r-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Sort Controls */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="sender">Sender</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Query and Filters */}
        {(query || filters.length > 0) && (
          <div className="space-y-2">
            {query && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Query:</span>
                <Badge variant="outline">{query}</Badge>
              </div>
            )}
            
            {filters.length > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Filters:</span>
                <div className="flex flex-wrap gap-1">
                  {filters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {filter.field} {filter.operator} {filter.value}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => onClearFilter(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAllFilters}
                    className="h-6 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Results by Type Tabs */}
      <Tabs value={filterType} onValueChange={(value: any) => setFilterType(value)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({results.length})
          </TabsTrigger>
          {Object.entries(resultsByType).map(([type, typeResults]) => (
            <TabsTrigger key={type} value={type}>
              <div className="flex items-center space-x-1">
                {getResultTypeIcon(type)}
                <span className="capitalize">{type}s ({typeResults.length})</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={filterType} className="mt-4">
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No results found for your search criteria.</p>
              <p className="text-sm">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)]">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.map((result) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      onSelect={onResultSelect}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredResults.map((result) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      onSelect={onResultSelect}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
