import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  Upload,
  FileText,
  Image,
  Video,
  Brain,
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  Copy,
  Mail,
  Eye,
  Camera,
  MessageSquare,
  Zap,
  PlayCircle,
  PauseCircle,
  Square,
  Calendar,
  CheckSquare,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantRequest {
  id: string;
  type: "voice_to_email" | "document_analysis" | "meeting_transcript" | "image_analysis";
  input: {
    audioUrl?: string;
    documentUrl?: string;
    imageUrl?: string;
    transcriptText?: string;
    context?: any;
  };
  output?: {
    extractedText?: string;
    emailDraft?: string;
    actionItems?: string[];
    summary?: string;
    entities?: any[];
  };
  status: "pending" | "processing" | "completed" | "failed";
  confidence?: number;
  processingTime?: number;
  createdAt: string;
  completedAt?: string;
}

interface MultiModalAIProps {
  onEmailDraftGenerated?: (content: string) => void;
  onTasksExtracted?: (tasks: any[]) => void;
  trigger?: "manual" | "auto";
}

export default function MultiModalAI({
  onEmailDraftGenerated,
  onTasksExtracted,
  trigger = "manual",
}: MultiModalAIProps) {
  const [open, setOpen] = useState(trigger === "auto");
  const [activeTab, setActiveTab] = useState<string>("voice");
  const [processing, setProcessing] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<AIAssistantRequest | null>(null);
  const [recentRequests, setRecentRequests] = useState<AIAssistantRequest[]>([]);
  
  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // File Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Text Input
  const [transcriptText, setTranscriptText] = useState("");
  const [analysisContext, setAnalysisContext] = useState("");

  useEffect(() => {
    if (isRecording && intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (!isRecording && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const processRequest = async (type: AIAssistantRequest["type"], input: any) => {
    setProcessing(true);
    
    const request: AIAssistantRequest = {
      id: `req_${Date.now()}`,
      type,
      input,
      status: "processing",
      createdAt: new Date().toISOString(),
    };

    setCurrentRequest(request);

    // Simulate AI processing
    try {
      await simulateAIProcessing(request);
    } catch (error) {
      setCurrentRequest(prev => prev ? { ...prev, status: "failed" } : null);
    } finally {
      setProcessing(false);
    }
  };

  const simulateAIProcessing = async (request: AIAssistantRequest) => {
    // Simulate processing delay
    const delay = 2000 + Math.random() * 3000;
    
    await new Promise(resolve => setTimeout(resolve, delay));

    let output: any = {};
    
    switch (request.type) {
      case "voice_to_email":
        output = {
          extractedText: "Hi John, I wanted to follow up on our meeting yesterday about the Q4 budget proposal. Could you please send me the updated spreadsheet with the revised numbers? I'd like to review it before our presentation to the board next week. Thanks!",
          emailDraft: "Subject: Follow-up: Q4 Budget Proposal\n\nHi John,\n\nI hope this email finds you well. I wanted to follow up on our productive meeting yesterday regarding the Q4 budget proposal.\n\nCould you please send me the updated spreadsheet with the revised numbers we discussed? I'd like to review the changes before our presentation to the board next week.\n\nThanks for your time, and I look forward to hearing from you.\n\nBest regards,",
          actionItems: [
            "Review updated Q4 budget spreadsheet",
            "Prepare for board presentation next week",
            "Follow up with John if no response by Friday"
          ]
        };
        break;
        
      case "document_analysis":
        output = {
          summary: "This document contains a project proposal for implementing a new customer relationship management (CRM) system. Key points include timeline, budget requirements, and expected ROI.",
          actionItems: [
            "Review budget allocation for CRM implementation",
            "Schedule stakeholder meeting for next week",
            "Prepare technical requirements document",
            "Contact vendor for detailed pricing"
          ],
          entities: [
            { type: "date", value: "Q2 2024", context: "Implementation timeline" },
            { type: "budget", value: "$150,000", context: "Total project cost" },
            { type: "person", value: "Sarah Mitchell", context: "Project manager" },
            { type: "company", value: "TechSolutions Inc.", context: "Vendor" }
          ]
        };
        break;
        
      case "meeting_transcript":
        output = {
          summary: "Team meeting discussing project milestones, budget concerns, and upcoming deadlines. Key decisions made regarding resource allocation and timeline adjustments.",
          actionItems: [
            "John to provide budget update by Friday",
            "Sarah to schedule client review meeting",
            "Team to complete user testing by end of month",
            "Mike to update project timeline in Jira"
          ],
          entities: [
            { type: "person", value: "John Smith", context: "Budget owner" },
            { type: "person", value: "Sarah Johnson", context: "Client liaison" },
            { type: "date", value: "Friday", context: "Budget update deadline" },
            { type: "date", value: "End of month", context: "Testing deadline" }
          ]
        };
        break;
        
      case "image_analysis":
        output = {
          extractedText: "Meeting Room A - Q4 Planning Session\nAgenda:\n1. Review current metrics\n2. Discuss budget allocation\n3. Plan marketing initiatives\n4. Set Q1 goals",
          summary: "Whiteboard image showing Q4 planning session agenda with 4 main discussion points covering metrics, budget, marketing, and goal setting.",
          actionItems: [
            "Compile current metrics for review",
            "Prepare budget allocation proposals",
            "Draft marketing initiative plans",
            "Define specific Q1 goals and KPIs"
          ]
        };
        break;
    }

    const completedRequest = {
      ...request,
      output,
      status: "completed" as const,
      confidence: 0.85 + Math.random() * 0.1,
      processingTime: delay,
      completedAt: new Date().toISOString(),
    };

    setCurrentRequest(completedRequest);
    setRecentRequests(prev => [completedRequest, ...prev.slice(0, 4)]);

    // Trigger callbacks
    if (output.emailDraft && onEmailDraftGenerated) {
      onEmailDraftGenerated(output.emailDraft);
    }
    
    if (output.actionItems && onTasksExtracted) {
      const tasks = output.actionItems.map((item: string, index: number) => ({
        id: `ai_task_${Date.now()}_${index}`,
        title: item,
        source: "ai_generated",
        priority: "medium",
        status: "todo",
      }));
      onTasksExtracted(tasks);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Brain className="w-4 h-4 mr-2" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span>Multi-Modal AI Assistant</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="voice" className="flex items-center space-x-2">
              <Mic className="w-4 h-4" />
              <span>Voice to Email</span>
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Document Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Meeting Transcript</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Image Analysis</span>
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <TabsContent value="voice" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Voice to Email</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                      {!isRecording && !audioBlob && (
                        <div>
                          <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Record your voice message and I'll convert it to a professional email
                          </p>
                          <Button onClick={startRecording}>
                            <Mic className="w-4 h-4 mr-2" />
                            Start Recording
                          </Button>
                        </div>
                      )}
                      
                      {isRecording && (
                        <div>
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <MicOff className="w-8 h-8 text-red-500" />
                          </div>
                          <p className="text-lg font-mono mb-2">{formatTime(recordingTime)}</p>
                          <p className="text-sm text-muted-foreground mb-4">Recording in progress...</p>
                          <Button variant="destructive" onClick={stopRecording}>
                            <Square className="w-4 h-4 mr-2" />
                            Stop Recording
                          </Button>
                        </div>
                      )}
                      
                      {audioBlob && !processing && (
                        <div>
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Recording captured ({formatTime(recordingTime)})
                          </p>
                          <div className="flex space-x-2 justify-center">
                            <Button 
                              onClick={() => processRequest("voice_to_email", { audioUrl: "mock_audio.wav" })}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Generate Email
                            </Button>
                            <Button variant="outline" onClick={() => setAudioBlob(null)}>
                              Record Again
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="document" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Document Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {!selectedFile ? (
                        <div>
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload a document for AI analysis (PDF, Word, etc.)
                          </p>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            className="hidden"
                            id="document-upload"
                          />
                          <Label htmlFor="document-upload">
                            <Button asChild>
                              <span>Choose File</span>
                            </Button>
                          </Label>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-center mb-4">
                            {getFileIcon(selectedFile)}
                          </div>
                          <p className="font-medium mb-2">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="flex space-x-2 justify-center">
                            <Button
                              onClick={() => processRequest("document_analysis", {
                                documentUrl: `mock_${selectedFile.name}`,
                              })}
                            >
                              <Brain className="w-4 h-4 mr-2" />
                              Analyze Document
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedFile(null)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transcript" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Meeting Transcript Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="transcript">Paste Meeting Transcript</Label>
                      <Textarea
                        id="transcript"
                        value={transcriptText}
                        onChange={(e) => setTranscriptText(e.target.value)}
                        placeholder="Paste your meeting transcript here..."
                        rows={8}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="context">Context (Optional)</Label>
                      <Input
                        id="context"
                        value={analysisContext}
                        onChange={(e) => setAnalysisContext(e.target.value)}
                        placeholder="e.g., Project planning meeting, Budget review..."
                        className="mt-2"
                      />
                    </div>

                    <Button
                      onClick={() => processRequest("meeting_transcript", {
                        transcriptText,
                        context: analysisContext,
                      })}
                      disabled={!transcriptText.trim()}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Extract Action Items & Summary
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Image Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {!selectedFile ? (
                        <div>
                          <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload an image for AI analysis (whiteboard, document photo, etc.)
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            className="hidden"
                            id="image-upload"
                          />
                          <Label htmlFor="image-upload">
                            <Button asChild>
                              <span>Choose Image</span>
                            </Button>
                          </Label>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-center mb-4">
                            <img
                              src={URL.createObjectURL(selectedFile)}
                              alt="Preview"
                              className="max-w-32 max-h-32 object-cover rounded"
                            />
                          </div>
                          <p className="font-medium mb-2">{selectedFile.name}</p>
                          <div className="flex space-x-2 justify-center">
                            <Button
                              onClick={() => processRequest("image_analysis", {
                                imageUrl: `mock_${selectedFile.name}`,
                              })}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Analyze Image
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedFile(null)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {/* Results Panel */}
            <div className="space-y-4">
              {processing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={60} className="mb-2" />
                    <p className="text-xs text-muted-foreground">Analyzing with AI...</p>
                  </CardContent>
                </Card>
              )}

              {currentRequest?.status === "completed" && currentRequest.output && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Results</span>
                      {currentRequest.confidence && (
                        <Badge variant="outline">
                          {Math.round(currentRequest.confidence * 100)}% confident
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentRequest.output.emailDraft && (
                      <div>
                        <Label className="text-xs font-medium">Generated Email</Label>
                        <div className="bg-accent p-3 rounded text-xs mt-1">
                          <pre className="whitespace-pre-wrap font-sans">
                            {currentRequest.output.emailDraft}
                          </pre>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => onEmailDraftGenerated?.(currentRequest.output!.emailDraft!)}
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Use in Email
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(currentRequest.output!.emailDraft!)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentRequest.output.summary && (
                      <div>
                        <Label className="text-xs font-medium">Summary</Label>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {currentRequest.output.summary}
                        </p>
                      </div>
                    )}

                    {currentRequest.output.actionItems && currentRequest.output.actionItems.length > 0 && (
                      <div>
                        <Label className="text-xs font-medium">Action Items</Label>
                        <div className="space-y-1 mt-1">
                          {currentRequest.output.actionItems.map((item, index) => (
                            <div key={index} className="flex items-start space-x-2 text-xs">
                              <CheckSquare className="w-3 h-3 mt-0.5 text-muted-foreground" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            const tasks = currentRequest.output!.actionItems!.map((item, index) => ({
                              id: `ai_task_${Date.now()}_${index}`,
                              title: item,
                              source: "ai_generated",
                              priority: "medium",
                              status: "todo",
                            }));
                            onTasksExtracted?.(tasks);
                          }}
                        >
                          <CheckSquare className="w-3 h-3 mr-1" />
                          Create Tasks
                        </Button>
                      </div>
                    )}

                    {currentRequest.output.entities && currentRequest.output.entities.length > 0 && (
                      <div>
                        <Label className="text-xs font-medium">Extracted Entities</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentRequest.output.entities.map((entity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {entity.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {recentRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Analyses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {recentRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-accent"
                            onClick={() => setCurrentRequest(request)}
                          >
                            <div className="flex items-center space-x-2">
                              {request.type === "voice_to_email" && <Mic className="w-3 h-3" />}
                              {request.type === "document_analysis" && <FileText className="w-3 h-3" />}
                              {request.type === "meeting_transcript" && <MessageSquare className="w-3 h-3" />}
                              {request.type === "image_analysis" && <Image className="w-3 h-3" />}
                              <span className="text-xs capitalize">
                                {request.type.replace("_", " ")}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
