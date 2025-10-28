import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

interface UE {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
}

const UEList = () => {
  const [ues, setUes] = useState<UE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUEs();
  }, []);

  const fetchUEs = async () => {
    try {
      const { data, error } = await supabase
        .from("ues")
        .select("*")
        .eq("visible", true)
        .order("nom");

      if (error) throw error;
      setUes(data || []);
    } catch (error) {
      console.error("Error fetching UEs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Unités d'Enseignement</h1>
          <p className="text-muted-foreground text-lg">
            Sélectionnez une UE pour accéder aux corrigés
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : ues.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">Aucune UE disponible</p>
              <p className="text-muted-foreground">
                Les UEs seront ajoutées prochainement par les administrateurs.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ues.map((ue) => (
              <Link key={ue.id} to={`/ues/${ue.id}`}>
                <Card className="h-full hover:shadow-[var(--shadow-elegant)] transition-all hover:scale-[1.02]">
                  {ue.image_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={ue.image_url}
                        alt={ue.nom}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{ue.nom}</CardTitle>
                    {ue.description && (
                      <CardDescription>{ue.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default UEList;