import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API } from '@/config';
import { Sparkles, Download, RotateCcw, Key, Loader2, ArrowLeft, FileImage } from 'lucide-react';
import logoImg from '/logo.png';

type Step = 'idle' | 'generating-prompt' | 'review-prompt' | 'generating-image' | 'done';

export default function Generator() {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mylogo_api_key') || '');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('idle');

  useEffect(() => {
    if (apiKey) localStorage.setItem('mylogo_api_key', apiKey);
  }, [apiKey]);

  const generatePrompt = async () => {
    if (!apiKey.startsWith('sk-')) {
      setError(t('errorApiKey'));
      return;
    }
    setError('');
    setStep('generating-prompt');

    try {
      const res = await fetch(`${API}/generate-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrompt(data.prompt);
      setStep('review-prompt');
    } catch (e: any) {
      setError(e.message);
      setStep('idle');
    }
  };

  const generateImage = async () => {
    setError('');
    setStep('generating-image');

    try {
      const res = await fetch(`${API}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImage(data.image);
      setStep('done');
    } catch (e: any) {
      setError(e.message);
      setStep('review-prompt');
    }
  };

  const reset = () => {
    setDescription('');
    setPrompt('');
    setImage('');
    setError('');
    setStep('idle');
  };

  const goBack = () => {
    setStep('review-prompt');
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${image}`;
    a.download = 'mylogo.png';
    a.click();
  };

  const downloadSvg = async () => {
    try {
      const res = await fetch(`${API}/convert-svg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const a = document.createElement('a');
      a.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.svg)}`;
      a.download = 'mylogo.svg';
      a.click();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const downloadIco = async () => {
    try {
      const res = await fetch(`${API}/convert-ico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const a = document.createElement('a');
      a.href = `data:image/x-icon;base64,${data.ico}`;
      a.download = 'favicon.ico';
      a.click();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="py-4 max-w-2xl mx-auto space-y-4">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-0">
          <img src={logoImg} alt="MyLogo" className="h-10 w-auto" />
          <h1 className="text-3xl font-bold"><span className="text-accent">y</span><span className="text-gold">Logo</span></h1>
        </div>
        <p className="text-text-secondary text-sm mt-4">{t('tagline')}</p>
        {!apiKey && (
          <p className="text-text-secondary/70 text-xs mt-2">{t('requiresOpenai')}</p>
        )}
      </div>

      {/* API Key — only show if not configured */}
      {!apiKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Key className="w-4 h-4" />
              {t('apiKey')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              placeholder={t('apiKeyPlaceholder')}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-text-secondary text-xs mt-2">
              {t('apiKeyHint')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Describe */}
      {(step === 'idle' || step === 'generating-prompt') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('describeYourLogo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full min-h-[120px] rounded-md bg-[#12131f] border border-[#2a2b3e] p-3 text-sm text-[#e4e4e7] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={step === 'generating-prompt'}
            />
            <Button
              onClick={generatePrompt}
              disabled={!description.trim() || step === 'generating-prompt'}
              className="w-full"
            >
              {step === 'generating-prompt' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('craftingPrompt')}</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> {t('generatePrompt')}</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review prompt */}
      {(step === 'review-prompt' || step === 'generating-image') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('aiGeneratedPrompt')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full min-h-[120px] rounded-md bg-[#12131f] border border-[#2a2b3e] p-3 text-sm text-[#e4e4e7] focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={step === 'generating-image'}
            />
            <p className="text-text-secondary text-xs">{t('editPromptHint')}</p>
            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" /> {t('startOver')}
              </Button>
              <Button
                onClick={generateImage}
                disabled={step === 'generating-image'}
                className="flex-1"
              >
                {step === 'generating-image' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('generatingImage')}</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> {t('generateLogo')}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Result */}
      {step === 'done' && image && (
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden border border-[#2a2b3e] bg-[#1a1b2e] flex items-center justify-center p-3">
            <img
              src={`data:image/png;base64,${image}`}
              alt="Generated logo"
              className="max-w-full max-h-[40vh] object-contain"
              style={{ background: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px' }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={goBack} variant="outline" size="sm" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> {t('back')}
            </Button>
            <Button onClick={generateImage} variant="outline" size="sm" className="flex-1">
              <Sparkles className="w-4 h-4 mr-1" /> {t('alternative')}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadImage} size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-1" /> {t('downloadPng')}
            </Button>
            <Button onClick={downloadSvg} variant="outline" size="sm" className="flex-1">
              <FileImage className="w-4 h-4 mr-1" /> {t('downloadSvg')}
            </Button>
            <Button onClick={downloadIco} variant="outline" size="sm" className="flex-1">
              <FileImage className="w-4 h-4 mr-1" /> {t('downloadIco')}
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
