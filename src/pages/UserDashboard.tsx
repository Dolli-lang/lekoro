import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import UESelection from "@/components/user/UESelection";
import UserHistory from "@/components/user/UserHistory";
import UserProfile from "@/components/user/UserProfile";

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mon espace</h1>
          <p className="text-muted-foreground">Accédez aux corrigés et gérez votre profil</p>
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
