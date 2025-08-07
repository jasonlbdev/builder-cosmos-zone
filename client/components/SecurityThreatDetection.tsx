import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  Link,
  FileText,
  Globe,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scan,
  Brain,
  Target,
  Zap,
  Lock,
  Unlock,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SecurityThreat, SecurityIndicator } from "../../shared/api";

interface SecurityThreatDetectionProps {
  emailId?: string;
  emailContent?: string;
  emailSender?: string;
  emailSubject?: string;
  attachments?: any[];
  onThreatDetected?: (threat: SecurityThreat) => void;
  trigger?: "manual" | "auto";
}

export default function SecurityThreatDetection({
  emailId,
  emailContent,
  emailSender,
  emailSubject,
  attachments = [],
  onThreatDetected,
  trigger = "manual"
}: SecurityThreatDetectionProps) {
  const [open, setOpen] = useState(trigger === "auto");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedThreat, setDetectedThreat] = useState<SecurityThreat | null>(null);
  const [scanHistory, setScanHistory] = useState<SecurityThreat[]>([]);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [scanDetails, setScanDetails] = useState<any>(null);

  useEffect(() => {
    if (emailId && autoScanEnabled && open) {
      performSecurityScan();
    }
  }, [emailId, autoScanEnabled, open]);

  const performSecurityScan = async () => {
    if (!emailId) return;

    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate progressive scanning
    const scanSteps = [
      { step: "Analyzing sender reputation", progress: 20 },
      { step: "Scanning content for malicious patterns", progress: 40 },
      { step: "Checking URLs and links", progress: 60 },
      { step: "Analyzing attachments", progress: 80 },
      { step: "Final threat assessment", progress: 100 }
    ];

    for (const step of scanSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanProgress(step.progress);
    }

    // Simulate threat detection based on email content
    const threat = generateMockThreat();
    
    if (threat) {
      setDetectedThreat(threat);
      setScanHistory(prev => [threat, ...prev.slice(0, 4)]);
      onThreatDetected?.(threat);
    }

    // Generate detailed scan results
    setScanDetails({
      scanTime: new Date().toISOString(),
      checksPerformed: [
        {
          name: "Sender Reputation",
          status: "passed",
          details: "Sender domain has good reputation",
          riskLevel: "low"
        },
        {
          name: "Content Analysis",
          status: threat ? "failed" : "passed",
          details: threat ? "Suspicious content patterns detected" : "No malicious content found",
          riskLevel: threat ? "high" : "low"
        },
        {
          name: "URL Scanning",
          status: threat?.type === "phishing" ? "failed" : "passed",
          details: threat?.type === "phishing" ? "Suspicious URLs detected" : "All URLs appear safe",
          riskLevel: threat?.type === "phishing" ? "medium" : "low"
        },
        {
          name: "Attachment Check",
          status: "passed",
          details: attachments.length > 0 ? "Attachments scanned successfully" : "No attachments to scan",
          riskLevel: "low"
        }
      ],
      totalIssues: threat ? 1 : 0,
      riskScore: threat ? calculateRiskScore(threat) : 15
    });

    setIsScanning(false);
  };

  const generateMockThreat = (): SecurityThreat | null => {
    // Simulate threat detection based on content analysis
    const suspiciousPatterns = [
      "urgent action required",
      "verify your account",
      "click here immediately",
      "suspended",
      "confirm identity"
    ];

    const contentLower = (emailContent || emailSubject || "").toLowerCase();
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      contentLower.includes(pattern)
    );

    const fromSuspiciousDomain = emailSender && !emailSender.includes("@company.com");
    
    if (hasSuspiciousContent || Math.random() > 0.7) {
      const threatTypes = ["phishing", "scam", "spam", "suspicious"] as const;
      const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      
      return {
        id: `threat_${Date.now()}`,
        emailId: emailId!,
        type: threatType,
        severity: threatType === "phishing" ? "high" : "medium",
        confidence: 0.75 + Math.random() * 0.2,
        indicators: generateIndicators(threatType),
        status: "detected",
        detectedAt: new Date().toISOString()
      };
    }

    return null;
  };

  const generateIndicators = (threatType: string): SecurityIndicator[] => {
    const indicators: SecurityIndicator[] = [];

    if (threatType === "phishing") {
      indicators.push({
        type: "content_analysis",
        description: "Email contains urgent language typical of phishing attempts",
        severity: "high",
        details: { patterns: ["urgent action", "verify account"] }
      });
      indicators.push({
        type: "sender_reputation",
        description: "Sender domain has low trust score",
        severity: "medium",
        details: { trustScore: 0.3, domainAge: "2 days" }
      });
      indicators.push({
        type: "url_scan",
        description: "Contains suspicious redirects",
        severity: "high",
        details: { suspiciousUrls: 2, redirectChains: 1 }
      });
    }

    if (threatType === "scam") {
      indicators.push({
        type: "content_analysis",
        description: "Contains money-related scam indicators",
        severity: "medium",
        details: { keywords: ["money", "prize", "winner"] }
      });
    }

    return indicators;
  };

  const calculateRiskScore = (threat: SecurityThreat): number => {
    let score = 20; // Base score
    
    threat.indicators.forEach(indicator => {
      if (indicator.severity === "high") score += 30;
      else if (indicator.severity === "medium") score += 20;
      else score += 10;
    });

    return Math.min(100, score);
  };

  const getThreatColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-700 bg-red-50 border-red-200";
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-orange-600 bg-orange-50 border-orange-200";
      case "low": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "phishing": return <ShieldX className="w-5 h-5" />;
      case "scam": return <AlertTriangle className="w-5 h-5" />;
      case "malware": return <ShieldAlert className="w-5 h-5" />;
      case "spam": return <Mail className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleQuarantine = () => {
    if (detectedThreat) {
      // Simulate quarantine action
      console.log("Quarantining email:", emailId);
      setDetectedThreat(prev => prev ? { ...prev, actionTaken: "quarantine" } : null);
    }
  };

  const handleMarkSafe = () => {
    if (detectedThreat) {
      // Simulate marking as safe
      console.log("Marking email as safe:", emailId);
      setDetectedThreat(prev => prev ? { ...prev, status: "false_positive" } : null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="w-4 h-4 mr-2" />
          Security Scan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span>Security Threat Detection</span>
            {emailSubject && (
              <Badge variant="outline" className="ml-2">
                {emailSubject}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="scan" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scan">Active Scan</TabsTrigger>
            <TabsTrigger value="threats">Detected Threats</TabsTrigger>
            <TabsTrigger value="details">Scan Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                {isScanning ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Scan className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-semibold">Scanning Email for Threats</h3>
                        <Progress value={scanProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground">
                          Analyzing content, links, and attachments...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : detectedThreat ? (
                  <Alert className={cn("border-l-4", getThreatColor(detectedThreat.severity))}>
                    <div className="flex items-start space-x-3">
                      {getThreatIcon(detectedThreat.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center space-x-2">
                          <span className="capitalize">{detectedThreat.type} Detected</span>
                          <Badge className={cn("ml-2", getThreatColor(detectedThreat.severity))}>
                            {detectedThreat.severity} risk
                          </Badge>
                        </h4>
                        <AlertDescription className="mt-2">
                          This email has been identified as a potential {detectedThreat.type} with{" "}
                          {Math.round(detectedThreat.confidence * 100)}% confidence.
                        </AlertDescription>
                        
                        <div className="mt-4 space-y-2">
                          <h5 className="text-sm font-medium">Security Indicators:</h5>
                          {detectedThreat.indicators.map((indicator, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500" />
                              <div>
                                <span className="font-medium">{indicator.type.replace("_", " ")}:</span>
                                <span className="ml-1">{indicator.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleQuarantine}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Quarantine
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkSafe}
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Mark as Safe
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Alert>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Email Appears Safe</h3>
                      <p className="text-muted-foreground">
                        No security threats detected in this email.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={performSecurityScan}
                  disabled={isScanning}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Run Security Scan
                    </>
                  )}
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-3 bg-accent rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {scanHistory.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Scans</div>
                  </div>
                  
                  <div className="text-center p-3 bg-accent rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {scanHistory.filter(t => t.status === "confirmed").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Threats Found</div>
                  </div>

                  <div className="text-center p-3 bg-accent rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {scanDetails?.riskScore ? 100 - scanDetails.riskScore : 85}%
                    </div>
                    <div className="text-xs text-muted-foreground">Safety Score</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {scanHistory.length > 0 ? scanHistory.map(threat => (
                  <Card key={threat.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getThreatIcon(threat.type)}
                        <div>
                          <h4 className="font-medium capitalize">{threat.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Detected {new Date(threat.detectedAt).toLocaleString()}
                          </p>
                          <Badge className={cn("mt-1", getThreatColor(threat.severity))}>
                            {threat.severity} severity
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {threat.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Threats Detected</h3>
                      <p className="text-muted-foreground">
                        All scanned emails appear to be safe.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {scanDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Scan Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Scan Time:</span>
                        <span>{new Date(scanDetails.scanTime).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Issues Found:</span>
                        <span>{scanDetails.totalIssues}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Risk Score:</span>
                        <span className={cn(
                          "font-medium",
                          scanDetails.riskScore > 70 ? "text-red-600" :
                          scanDetails.riskScore > 40 ? "text-yellow-600" : "text-green-600"
                        )}>
                          {scanDetails.riskScore}/100
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overall Risk</span>
                          <Badge className={cn(
                            scanDetails.riskScore > 70 ? "bg-red-100 text-red-800" :
                            scanDetails.riskScore > 40 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                          )}>
                            {scanDetails.riskScore > 70 ? "High" :
                             scanDetails.riskScore > 40 ? "Medium" : "Low"}
                          </Badge>
                        </div>
                        <Progress 
                          value={scanDetails.riskScore} 
                          className={cn(
                            "h-2",
                            scanDetails.riskScore > 70 ? "[&>div]:bg-red-500" :
                            scanDetails.riskScore > 40 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Security Checks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scanDetails.checksPerformed.map((check: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-accent rounded">
                          <div className="flex items-center space-x-3">
                            {getCheckIcon(check.status)}
                            <div>
                              <span className="text-sm font-medium">{check.name}</span>
                              <p className="text-xs text-muted-foreground">{check.details}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              check.riskLevel === "high" ? "text-red-600" :
                              check.riskLevel === "medium" ? "text-yellow-600" : "text-green-600"
                            )}
                          >
                            {check.riskLevel} risk
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Scan Data</h3>
                  <p className="text-muted-foreground">
                    Run a security scan to see detailed results here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-scan emails</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically scan emails for threats when opened
                    </p>
                  </div>
                  <Switch
                    checked={autoScanEnabled}
                    onCheckedChange={setAutoScanEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Real-time protection</Label>
                    <p className="text-xs text-muted-foreground">
                      Scan emails as they arrive
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Quarantine threats</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically quarantine high-risk emails
                    </p>
                  </div>
                  <Switch checked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Team notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Alert team members about security threats
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
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
