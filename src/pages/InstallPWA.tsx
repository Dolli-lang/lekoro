import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Apple, CheckCircle } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Installer Le Koro | Application Mobile & Desktop</title>
        <meta name="description" content="Installez Le Koro sur votre appareil pour un accès rapide aux corrigés universitaires. Disponible sur Android, iOS, Windows et Mac." />
        <link rel="canonical" href="https://lekoro.lovable.app/install" />
      </Helmet>

      <Navbar />

      <main className="flex-1 container py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Installer Le Koro</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Accédez à vos corrigés universitaires directement depuis votre écran d'accueil, 
            même hors connexion.
          </p>
        </header>

        {isInstalled ? (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Application installée !</h2>
              <p className="text-muted-foreground">
                Le Koro est déjà installé sur votre appareil. 
                Vous pouvez y accéder depuis votre écran d'accueil.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Android / Chrome */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Android</CardTitle>
                <CardDescription>Chrome, Edge, Samsung Internet</CardDescription>
              </CardHeader>
              <CardContent>
                {deferredPrompt ? (
                  <Button onClick={handleInstallClick} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Installer maintenant
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>1. Appuyez sur le menu ⋮ du navigateur</p>
                    <p>2. Sélectionnez "Installer l'application"</p>
                    <p>3. Confirmez l'installation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* iOS */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <Apple className="h-6 w-6 text-gray-700" />
                </div>
                <CardTitle>iPhone / iPad</CardTitle>
                <CardDescription>Safari uniquement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>1. Ouvrez ce site dans Safari</p>
                  <p>2. Appuyez sur le bouton Partager ↑</p>
                  <p>3. Sélectionnez "Sur l'écran d'accueil"</p>
                  <p>4. Appuyez sur "Ajouter"</p>
                </div>
              </CardContent>
            </Card>

            {/* Desktop */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Monitor className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>PC / Mac</CardTitle>
                <CardDescription>Chrome, Edge</CardDescription>
              </CardHeader>
              <CardContent>
                {deferredPrompt ? (
                  <Button onClick={handleInstallClick} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Installer maintenant
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>1. Cliquez sur l'icône ⊕ dans la barre d'adresse</p>
                    <p>2. Ou menu → "Installer Le Koro"</p>
                    <p>3. Confirmez l'installation</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Benefits */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Avantages de l'application</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Accès rapide</h3>
                <p className="text-muted-foreground text-sm">
                  Lancez Le Koro directement depuis votre écran d'accueil
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Mode hors-ligne</h3>
                <p className="text-muted-foreground text-sm">
                  Consultez les corrigés déjà visités sans connexion
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Expérience native</h3>
                <p className="text-muted-foreground text-sm">
                  Interface plein écran, sans barre d'adresse
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Mises à jour automatiques</h3>
                <p className="text-muted-foreground text-sm">
                  Toujours la dernière version, sans téléchargement
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default InstallPWA;
