import { Heart, ExternalLink, MessageCircle, Shield, FileText, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SettingsAbout = () => {
  const navigate = useNavigate();
  const appVersion = "1.0.0";

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      {/* App Info Hero */}
      <div className="settings-about-hero">
        <div className="settings-about-icon">
          <img src="/app-icon.png" alt="BotBlock" width={42} height={42} className="rounded-lg" draggable={false} />
        </div>

        <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-1">BotBlock</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Put down your phone, grow your island</p>

        {/* Version Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full"
          style={{ background: 'rgba(26,46,35,0.6)', border: '1px solid rgba(76,167,113,0.12)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            <span className="text-xs font-bold text-[hsl(var(--primary))]">v{appVersion}</span>
          </div>
          <div className="w-px h-4" style={{ background: 'rgba(76,167,113,0.2)' }} />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">Live</span>
        </div>

        {/* Tagline */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(76,167,113,0.12)' }}>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Focus. Collect. Grow.</p>
        </div>
      </div>

      {/* Legal */}
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><Shield /></div>
          <span>Legal</span>
        </div>

        <div className="space-y-2">
          <button onClick={() => navigate('/privacy')} className="settings-link-row">
            <FileText className="w-5 h-5 text-[hsl(var(--primary))]" />
            <span className="flex-1 text-left">Privacy Policy</span>
            <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          </button>

          <button onClick={() => navigate('/terms')} className="settings-link-row">
            <ScrollText className="w-5 h-5 text-[hsl(var(--primary))]" />
            <span className="flex-1 text-left">Terms of Service</span>
            <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          </button>

          <button onClick={() => openLink('mailto:support@fonoinc.com')} className="settings-link-row">
            <MessageCircle className="w-5 h-5 text-[hsl(var(--primary))]" />
            <span className="flex-1 text-left">Contact Support</span>
            <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          </button>

          <button onClick={() => openLink('https://fonoinc.com')} className="settings-btn-primary text-sm">
            <Heart className="w-5 h-5" />
            <span className="font-bold flex-1 text-left">Visit BotBlock Inc.</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-3">
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
          &copy; {new Date().getFullYear()} BotBlock Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};
