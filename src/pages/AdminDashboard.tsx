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
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Tableau de bord administrateur</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs, UE et corrigés</p>
        </div>

        <AdminStats />

        <Tabs defaultValue="ufrs" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ufrs">UFRs</TabsTrigger>
            <TabsTrigger value="departements">Départements</TabsTrigger>
            <TabsTrigger value="ues">UEs</TabsTrigger>
            <TabsTrigger value="corriges">Corrigés</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="ufrs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des UFRs</CardTitle>
                <CardDescription>Ajoutez, modifiez ou supprimez des UFRs (ex: SSMT)</CardDescription>
              </CardHeader>
              <CardContent>
                <UFRManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Départements</CardTitle>
                <CardDescription>Ajoutez, modifiez ou supprimez des départements ou filières (ex: Physique Chimie)</CardDescription>
              </CardHeader>
              <CardContent>
                <DepartementsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ues" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des UEs</CardTitle>
                <CardDescription>Ajoutez, modifiez ou supprimez des unités d'enseignement</CardDescription>
              </CardHeader>
              <CardContent>
                <UEManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="corriges" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des corrigés</CardTitle>
                <CardDescription>Ajoutez des TD et examens pour les UEs</CardDescription>
              </CardHeader>
              <CardContent>
                <CorrigesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
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
