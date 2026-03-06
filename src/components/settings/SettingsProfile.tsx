import { useState, useEffect } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Pencil, Check, X, Camera } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";

const AVATAR_OPTIONS = [
  { id: 'default', icon: 'panda', label: 'Panda' },
  { id: 'cat', icon: 'cat', label: 'Cat' },
  { id: 'dog', icon: 'dog', label: 'Dog' },
  { id: 'fox', icon: 'fox', label: 'Fox' },
  { id: 'bear', icon: 'bear', label: 'Bear' },
  { id: 'rabbit', icon: 'rabbit', label: 'Rabbit' },
  { id: 'koala', icon: 'koala', label: 'Koala' },
  { id: 'lion', icon: 'lion', label: 'Lion' },
];

export const SettingsProfile = () => {
  const { isGuestMode, session } = useAuth();
  const { profile, updateProfile } = useSupabaseData();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('default');
  const [isSaving, setIsSaving] = useState(false);

  const isLocalOnlyGuest = isGuestMode && !session;

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSelectedAvatar(profile.avatar_url || 'default');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ display_name: displayName.trim(), avatar_url: selectedAvatar });
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (_error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.display_name || '');
    setSelectedAvatar(profile?.avatar_url || 'default');
    setIsEditing(false);
  };

  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  if (isLocalOnlyGuest) return null;

  return (
    <div className="settings-card">
      <div className="settings-section-title">
        <div className="settings-section-icon"><User /></div>
        <span>Profile</span>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="settings-avatar-ring">
              <PixelIcon name={currentAvatar.icon} size={42} />
            </div>
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center border-2 border-[hsl(var(--background))]">
                <Camera className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={cn(
                    "settings-avatar-option",
                    selectedAvatar === avatar.id ? "settings-avatar-option--selected" : "settings-avatar-option--unselected"
                  )}
                  title={avatar.label}
                >
                  <PixelIcon name={avatar.icon} size={24} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-xs text-[hsl(var(--muted-foreground))]">Display Name</Label>
          {isEditing ? (
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="h-10 rounded-lg bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              maxLength={30}
            />
          ) : (
            <div className="settings-row">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                {profile?.display_name || 'Not set'}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg transition-all active:scale-95 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.15)]"
              >
                <Pencil className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={isSaving} className="flex-1 settings-btn-secondary text-xs py-2">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex-1 settings-btn-primary text-xs py-2">
              <Check className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
