import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Mail, BookOpen, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import UESelection from "@/components/user/UESelection";
import UserHistory from "@/components/user/UserHistory";
import UserProfile from "@/components/user/UserProfile";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const contactSchema = z.object({
  subject: z.string().trim().min(3, "Le sujet doit contenir au moins 3 caractères").max(200),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères").max(2000),
});

const UserDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contactOpen, setContactOpen] = useState(false);
  const [contactData, setContactData] = useState({ subject: "", message: "" });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactErrors({});

    try {
      contactSchema.parse(contactData);

      const body = `De: ${profile?.full_name || "Utilisateur"} (${profile?.email || user?.email || ""})\n\n${contactData.message}`;
      const mailtoLink = `mailto:ninopaket@gmail.com?subject=${encodeURIComponent(
        contactData.subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoLink;

      toast({
        title: "Ouverture de votre client mail",
        description: "Un nouveau brouillon est prêt à être envoyé à l'administration.",
      });

      setContactOpen(false);
      setContactData({ subject: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setContactErrors(newErrors);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-accent mx-auto" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="mt-4 text-muted-foreground animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <Navbar />
      <PWAInstallPrompt />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Welcome header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary via-[hsl(280_70%_55%)] to-accent bg-clip-text text-transparent animate-text-gradient">
              Bonjour, {profile?.full_name?.split(' ')[0] || "Utilisateur"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Prêt à réviser aujourd'hui ?</p>
          </div>
          <Dialog open={contactOpen} onOpenChange={setContactOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 hover-lift glass border-primary/20">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Contacter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="border-primary/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Contacter l'administration
                </DialogTitle>
                <DialogDescription>
                  Envoyez un message à l'équipe administrative
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    placeholder="Objet de votre message"
                    value={contactData.subject}
                    onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                    disabled={sending}
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {contactErrors.subject && (
                    <p className="text-sm text-destructive">{contactErrors.subject}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Votre message..."
                    rows={6}
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    disabled={sending}
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {contactErrors.message && (
                    <p className="text-sm text-destructive">{contactErrors.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={sending} className="flex-1 bg-gradient-to-r from-primary to-[hsl(280_70%_60%)]">
                    {sending ? "Envoi..." : "Envoyer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setContactOpen(false);
                      setContactData({ subject: "", message: "" });
                      setContactErrors({});
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="ues" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full grid-cols-3 bg-card/80 glass p-1.5 rounded-xl shadow-lg border border-primary/10">
            <TabsTrigger 
              value="ues"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-[hsl(280_70%_60%)] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">UEs & Corrigés</span>
              <span className="sm:hidden">UEs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 gap-2"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Historique</span>
              <span className="sm:hidden">Récent</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal data-[state=active]:to-emerald-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 gap-2"
            >
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ues" className="mt-6 animate-slide-up">
            <Card className="border-0 shadow-xl bg-card/80 glass overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-[hsl(280_70%_60%)] to-primary" />
              <CardContent className="pt-6">
                <UESelection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6 animate-slide-up">
            <Card className="border-0 shadow-xl bg-card/80 glass overflow-hidden hover-lift">
              <div className="h-1 bg-gradient-to-r from-accent via-yellow-400 to-accent" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Clock className="w-5 h-5" />
                  Historique de consultation
                </CardTitle>
                <CardDescription>Vos corrigés récemment consultés</CardDescription>
              </CardHeader>
              <CardContent>
                <UserHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6 animate-slide-up">
            <Card className="border-0 shadow-xl bg-card/80 glass overflow-hidden hover-lift">
              <div className="h-1 bg-gradient-to-r from-teal via-emerald-400 to-teal" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-teal">
                  <User className="w-5 h-5" />
                  Mon profil
                </CardTitle>
                <CardDescription>Gérez vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfile />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
