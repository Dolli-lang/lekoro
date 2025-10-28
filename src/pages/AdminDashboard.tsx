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
import AdminStats from "@/components/admin/AdminStats";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
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

        <Tabs defaultValue="ues" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ues">UEs</TabsTrigger>
            <TabsTrigger value="corriges">Corrigés</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

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
