import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowLeft } from "lucide-react";

interface Discipline {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
}

interface UE {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  discipline_id: string | null;
}

const UEList = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [ues, setUes] = useState<UE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const fetchDisciplines = async () => {
    try {
      const { data, error } = await supabase
        .from("disciplines")
        .select("*")
        .eq("visible", true)
        .order("nom");

      if (error) throw error;
      setDisciplines(data || []);
    } catch (error) {
      console.error("Error fetching disciplines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisciplineClick = async (discipline: Discipline) => {
    setSelectedDiscipline(discipline);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("ues")
        .select("*")
        .eq("discipline_id", discipline.id)
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

  const handleBackToDisciplines = () => {
    setSelectedDiscipline(null);
    setUes([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-12">
        {!selectedDiscipline ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Disciplines</h1>
              <p className="text-muted-foreground text-lg">
                Sélectionnez une discipline pour voir les UEs disponibles
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-32 w-full mb-3" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : disciplines.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-xl font-semibold mb-2">Aucune discipline disponible</p>
                  <p className="text-muted-foreground">
                    Les disciplines seront ajoutées prochainement par les administrateurs.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {disciplines.map((discipline) => (
                  <Card 
                    key={discipline.id}
                    className="cursor-pointer hover:shadow-[var(--shadow-elegant)] transition-all hover:scale-[1.02]"
                    onClick={() => handleDisciplineClick(discipline)}
                  >
                    {discipline.image_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={discipline.image_url}
                          alt={discipline.nom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {discipline.nom}
                      </CardTitle>
                      {discipline.description && (
                        <CardDescription>{discipline.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Voir les UEs
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <Button 
              variant="ghost" 
              onClick={handleBackToDisciplines}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux disciplines
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{selectedDiscipline.nom}</h1>
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
                    Les UEs seront ajoutées prochainement pour cette discipline.
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
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default UEList;