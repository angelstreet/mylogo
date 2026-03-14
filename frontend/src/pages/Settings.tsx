import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Trash2 } from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mylogo_api_key') || '');
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem('mylogo_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clear = () => {
    localStorage.removeItem('mylogo_api_key');
    setApiKey('');
  };

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Key className="w-4 h-4" /> OpenAI API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-text-secondary text-xs">
            Your key is stored locally in your browser. Never sent to our server — only directly to OpenAI.
          </p>
          <div className="flex gap-2">
            <Button onClick={save} disabled={!apiKey} className="flex-1">
              {saved ? 'Saved!' : 'Save key'}
            </Button>
            <Button onClick={clear} variant="outline" disabled={!apiKey}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
