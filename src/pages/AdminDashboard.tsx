import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UsersManagement from "@/components/admin/UsersManagement";
import UEManagement from "@/components/admin/UEManagement";
import CorrigesManagement from "@/components/admin/CorrigesManagement";
import UFRManagement from "@/components/admin/UFRManagement";
import DepartementsManagement from "@/components/admin/DepartementsManagement";
import AdminStats from "@/components/admin/AdminStats";
import { HeroImageManagement } from "@/components/admin/HeroImageManagement";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Ne pas rediriger automatiquement pour éviter les allers-retours pendant la vérification du rôle
  useEffect(() => {
    // L'état isAdmin sera évalué ci-dessous pour afficher soit le contenu admin, soit un message d'accès refusé
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>Veuillez vous connecter pour accéder à l'administration.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>Votre compte n'a pas les droits administrateur.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-subtle)" }}>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Administration
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
            Tableau de bord
          </h1>
          <p className="text-muted-foreground text-lg">Gérez les utilisateurs, UEs et corrigés</p>
        </div>

        <AdminStats />

        <Tabs defaultValue="hero" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-card p-1.5 rounded-xl gap-1 shadow-[var(--shadow-card)]">
            <TabsTrigger 
              value="hero"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-[hsl(280_70%_65%)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
            >
              🏠 Accueil
            </TabsTrigger>
            <TabsTrigger 
              value="ufrs"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(217_91%_55%)] data-[state=active]:to-[hsl(200_91%_60%)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
            >
              🏫 UFRs
            </TabsTrigger>
            <TabsTrigger 
              value="departements"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-[hsl(35_95%_55%)] data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all duration-300"
            >
              📚 Dépts
            </TabsTrigger>
            <TabsTrigger 
              value="ues"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(152_76%_40%)] data-[state=active]:to-[hsl(175_70%_41%)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
            >
              📖 UEs
            </TabsTrigger>
            <TabsTrigger 
              value="corriges"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(262_83%_58%)] data-[state=active]:to-[hsl(280_70%_65%)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
            >
              📝 Corrigés
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(330_80%_55%)] data-[state=active]:to-[hsl(280_70%_65%)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
            >
              👥 Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="mt-6">
            <HeroImageManagement />
          </TabsContent>

          <TabsContent value="ufrs" className="mt-6">
            <Card className="border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300 bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[hsl(217_91%_55%)] to-[hsl(200_91%_60%)]" />
              <CardHeader className="bg-gradient-to-br from-[hsl(var(--highlight-blue))] to-transparent">
                <CardTitle className="text-[hsl(217_91%_55%)] flex items-center gap-2">🏫 Gestion des UFRs</CardTitle>
                <CardDescription>Ajoutez, modifiez ou supprimez des UFRs (ex: SSMT)</CardDescription>
              </CardHeader>
              <CardContent>
                <UFRManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departements" className="mt-6">
            <Card className="border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300 bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-accent to-[hsl(35_95%_55%)]" />
              <CardHeader className="bg-gradient-to-br from-[hsl(var(--highlight-orange))] to-transparent">
                <CardTitle className="text-accent flex items-center gap-2">📚 Gestion des Départements</CardTitle>
                <CardDescription>Ajoutez, modifiez ou supprimez des départements ou filières</CardDescription>
              </CardHeader>
              <CardContent>
                <DepartementsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ues" className="mt-6">
            <Card className="border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300 bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[hsl(152_76%_40%)] to-[hsl(175_70%_41%)]" />
              <CardHeader className="bg-gradient-to-br from-[hsl(var(--highlight-teal))] to-transparent">
                <CardTitle className="text-[hsl(var(--color-green))] flex items-center gap-2">📖 Gestion des UEs</CardTitle>
                <CardDescription>Ajoutez, modifiez ou supprimez des unités d'enseignement</CardDescription>
              </CardHeader>
              <CardContent>
                <UEManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="corriges" className="mt-6">
            <Card className="border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300 bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-[hsl(280_70%_65%)]" />
              <CardHeader className="bg-gradient-to-br from-[hsl(var(--highlight-purple))] to-transparent">
                <CardTitle className="text-primary flex items-center gap-2">📝 Gestion des corrigés</CardTitle>
                <CardDescription>Ajoutez des TD et examens pour les UEs</CardDescription>
              </CardHeader>
              <CardContent>
                <CorrigesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300 bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[hsl(330_80%_55%)] to-[hsl(280_70%_65%)]" />
              <CardHeader className="bg-gradient-to-br from-[hsl(var(--highlight-pink))] to-transparent">
                <CardTitle className="text-[hsl(var(--color-pink))] flex items-center gap-2">👥 Gestion des utilisateurs</CardTitle>
                <CardDescription>Gérez les utilisateurs et leurs rôles</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
