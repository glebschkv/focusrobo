import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";
import { PixelIcon } from "@/components/ui/PixelIcon";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPetsEarned: number;
  timeAwayMinutes: number;
}

export const RewardModal = ({ isOpen, onClose, newPetsEarned, timeAwayMinutes }: RewardModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-gradient-sky border-primary/20 shadow-glow">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <PixelIcon name="trophy" size={24} />
            Welcome Back!
            <PixelIcon name="trophy" size={24} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Time Away Display */}
          <Card className="bg-card border-border">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PixelIcon name="clock" size={20} />
                <span className="font-semibold text-foreground">Time Away</span>
              </div>
              <div className="text-3xl font-bold text-primary mb-1">
                {formatMinutes(timeAwayMinutes)}
              </div>
              <div className="text-sm text-muted-foreground">
                Great job staying off your phone!
              </div>
            </div>
          </Card>

          {/* New Pets Earned */}
          <Card className="bg-card border-border">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <PixelIcon name="sparkles" size={24} />
                <span className="text-lg font-bold text-foreground">New Pets Discovered!</span>
                <PixelIcon name="sparkles" size={24} />
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <PixelIcon name="heart" size={32} />
                <span className="text-4xl font-bold text-secondary">+{newPetsEarned}</span>
                <PixelIcon name="heart" size={32} />
              </div>
              
              <div className="text-sm text-muted-foreground mb-4">
                {newPetsEarned === 1 
                  ? "A new friend has appeared on your island!" 
                  : `${newPetsEarned} adorable pets have joined your island!`
                }
              </div>

              <div className="grid grid-cols-3 gap-2 justify-items-center">
                {Array.from({ length: Math.min(newPetsEarned, 6) }, (_, i) => (
                  <div key={i} className="animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                    <PixelIcon name={['cat', 'dog', 'rabbit', 'fox', 'bear', 'panda'][i % 6]} size={40} />
                  </div>
                ))}
                {newPetsEarned > 6 && (
                  <span className="text-lg text-muted-foreground col-span-3">
                    +{newPetsEarned - 6} more pets!
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-ocean shadow-glow text-lg py-3 flex items-center justify-center gap-2"
          >
            Explore Your Island! <PixelIcon name="island" size={20} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};