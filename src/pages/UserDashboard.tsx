import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import UESelection from "@/components/user/UESelection";
import UserHistory from "@/components/user/UserHistory";
import UserProfile from "@/components/user/UserProfile";

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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactErrors({});

    try {
      contactSchema.parse(contactData);
      setSending(true);

      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: profile?.full_name || "Utilisateur",
          email: profile?.email || user?.email || "unknown@example.com",
          message: `Sujet: ${contactData.subject}\n\n${contactData.message}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé à l'administration",
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
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer le message",
          variant: "destructive",
        });
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Bienvenue, {profile?.full_name || "Utilisateur"}
            </h1>
            <p className="text-muted-foreground">Accédez aux corrigés et gérez votre profil</p>
          </div>
          <Dialog open={contactOpen} onOpenChange={setContactOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Contacter l'admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contacter l'administration</DialogTitle>
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
                  />
                  {contactErrors.message && (
                    <p className="text-sm text-destructive">{contactErrors.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={sending} className="flex-1">
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

        <Tabs defaultValue="ues" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger 
              value="ues"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              UEs & Corrigés
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Historique
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ues" className="mt-6">
            <Card className="border-l-4 border-l-primary shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02] bg-gradient-to-br from-[hsl(var(--highlight-blue))] to-card animate-fade-in">
              <CardHeader>
              <CardTitle className="text-primary">Disciplines et UEs</CardTitle>
                <CardDescription>Sélectionnez un UFR, puis un département, puis une UE pour accéder aux TD et examens</CardDescription>
              </CardHeader>
              <CardContent>
                <UESelection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="border-l-4 border-l-[hsl(var(--accent))] shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02] bg-gradient-to-br from-[hsl(var(--highlight-yellow))] to-card animate-fade-in">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--accent))]">Historique de consultation</CardTitle>
                <CardDescription>Corrigés récemment consultés</CardDescription>
              </CardHeader>
              <CardContent>
                <UserHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card className="border-l-4 border-l-teal-500 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02] bg-gradient-to-br from-[hsl(var(--highlight-teal))] to-card animate-fade-in">
              <CardHeader>
                <CardTitle className="text-teal-600 dark:text-teal-400">Mon profil</CardTitle>
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
