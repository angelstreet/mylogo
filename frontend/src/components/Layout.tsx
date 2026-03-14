import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Key, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Props {
  children: ReactNode;
  onLogout: () => void;
}

function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEn = !i18n.language?.startsWith('fr');

  return (
    <button
      onClick={() => i18n.changeLanguage(isEn ? 'fr' : 'en')}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
    >
      {isEn ? 'FR' : 'EN'}
    </button>
  );
}

function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mylogo_api_key') || '');
  const [saved, setSaved] = useState(false);

  const isValid = apiKey.startsWith('sk-');

  const save = () => {
    if (!isValid) return;
    localStorage.setItem('mylogo_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clear = () => {
    localStorage.removeItem('mylogo_api_key');
    setApiKey('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" /> {t('settings')}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Key className="w-4 h-4" /> {t('apiKey')}
          </div>
          <Input
            type="password"
            placeholder={t('apiKeyPlaceholder')}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm"
          />
          {apiKey && !isValid && (
            <p className="text-red-400 text-xs">{t('errorApiKey')}</p>
          )}
          <p className="text-text-secondary text-xs">
            {t('apiKeyHintSettings')}
          </p>
          <div className="flex gap-2">
            <Button onClick={save} disabled={!apiKey || !isValid} className="flex-1">
              {saved ? t('saved') : t('saveKey')}
            </Button>
            <Button onClick={clear} variant="outline" disabled={!apiKey}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Layout({ children }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top bar */}
      <header className="flex items-center justify-end gap-1 px-4 md:px-8 py-3">
        <LanguageToggle />
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
          title={t('settings')}
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="px-4 md:px-8 max-w-6xl mx-auto w-full">
        {children}
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
