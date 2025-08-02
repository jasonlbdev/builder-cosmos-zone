import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  const [testState, setTestState] = useState('test');

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your email categories, AI rules, and preferences
            </p>
          </div>
          <Button onClick={() => setTestState('clicked')}>
            Test Button
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Debug Settings</CardTitle>
              <CardDescription>This is a minimal settings page for debugging</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Current state: {testState}</p>
              <p>If you can see this, the basic Settings component works.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
