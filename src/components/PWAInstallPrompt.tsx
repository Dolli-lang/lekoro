import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed recently
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Don't show for 7 days after dismissal
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Check if standalone (already installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Show prompt after 3 seconds on the dashboard
    const timer = setTimeout(() => {
      if (isIOSDevice) {
        setShowDialog(true);
      }
    }, 3000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show dialog after 3 seconds
      setTimeout(() => setShowDialog(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
    setShowDialog(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
    setShowDialog(false);
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Installer l'application
          </DialogTitle>
          <DialogDescription>
            Installez Le Koro sur votre appareil pour un accès rapide, même hors-ligne !
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isIOS ? (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Pour installer sur iOS :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Appuyez sur le bouton <strong>Partager</strong> en bas</li>
                <li>Sélectionnez <strong>"Sur l'écran d'accueil"</strong></li>
                <li>Confirmez en appuyant sur <strong>Ajouter</strong></li>
              </ol>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Accédez à vos corrigés plus rapidement avec l'application installée sur votre téléphone.
            </p>
          )}
          <div className="flex gap-2">
            {!isIOS && deferredPrompt && (
              <Button onClick={handleInstall} className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Installer
              </Button>
            )}
            <Button variant="outline" onClick={handleDismiss} className="flex-1">
              Plus tard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
