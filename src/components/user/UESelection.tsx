import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Loader2, ArrowLeft } from "lucide-react";

interface UFR { id: string; nom: string; }
interface Departement { id: string; nom: string; description: string | null; image_url: string | null; }
interface UE { id: string; nom: string; description: string | null; }
interface Exercice { id: string; numero: number; type: string; annee: string; }

const UESelection = () => {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [selectedUFR, setSelectedUFR] = useState<UFR | null>(null);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [ues, setUes] = useState<UE[]>([]);
  const [exercices, setExercices] = useState<Exercice[]>([]);

  const [selectedDepartement, setSelectedDepartement] = useState<Departement | null>(null);
  const [selectedUE, setSelectedUE] = useState<UE | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [annees, setAnnees] = useState<string[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState("");

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!profile?.ufr_id) return;
      const { data: ufr } = await supabase.from("ufrs").select("*").eq("id", profile.ufr_id).single();
      const { data: deps } = await supabase.from("departements").select("*").eq("ufr_id", profile.ufr_id).eq("visible", true);
      setSelectedUFR(ufr);
      setDepartements(deps || []);
      setLoading(false);
    };
    init();
  }, [profile]);

  const loadUEs = async (dept: Departement) => {
    setSelectedDepartement(dept);
    const { data } = await supabase.from("ues").select("*").eq("discipline_id", dept.id).eq("visible", true);
    setUes(data || []);
  };

  const handleTypeSelect = async (type: string) => {
    setSelectedType(type);
    setSelectedAnnee("");
    setAnnees([]);
    if (!selectedUE) return;
    const { data } = await supabase.from("exercices").select("annee").eq("ue_id", selectedUE.id).eq("type", type).eq("visible", true);
    if (data) setAnnees([...new Set(data.map(e => e.annee))].sort().reverse());
  };

  const loadExercices = async (ue: UE, type: string, annee: string) => {
    const { data } = await supabase.from("exercices").select("*").eq("ue_id", ue.id).eq("type", type).eq("annee", annee).eq("visible", true).order("numero");
    setExercices(data || []);
  };

  const openCorrige = async (exerciceId: string) => {
    const { data } = await supabase.from("corriges").select("image_urls").eq("exercice_id", exerciceId).eq("visible", true).single();
    if (data?.image_urls) {
      setImages(data.image_urls);
      setLightboxIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 font-bold text-xl">Le Koro — Corrigés</header>
      <main className="container mx-auto px-4 py-6">
        {loading ? <Loader2 className="animate-spin w-10 h-10 mx-auto" /> : (
          <>
            {!selectedDepartement && (
              <>
                <h2 className="text-2xl font-bold mb-6">{selectedUFR?.nom}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {departements.map(d => (
                    <Card key={d.id} onClick={() => loadUEs(d)}>
                      <CardHeader>
                        <CardTitle className="flex gap-2 items-center"><BookOpen className="w-5 h-5" /> {d.nom}</CardTitle>
                        {d.description && <CardDescription>{d.description}</CardDescription>}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {selectedDepartement && !selectedUE && (
              <>
                <Button variant="ghost" onClick={() => setSelectedDepartement(null)}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Retour
                </Button>
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  {ues.map(ue => (
                    <Card key={ue.id} onClick={() => setSelectedUE(ue)}>
                      <CardHeader>
                        <CardTitle className="flex gap-2 items-center"><FileText className="w-5 h-5" /> {ue.nom}</CardTitle>
                        {ue.description && <CardDescription>{ue.description}</CardDescription>}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {selectedUE && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => handleTypeSelect("TD")}>TD</Button>
                  <Button onClick={() => handleTypeSelect("Examen")}>Examen</Button>
                </div>

                {annees.length > 0 && (
                  <select
                    className="border px-3 py-2"
                    value={selectedAnnee}
                    onChange={(e) => {
                      setSelectedAnnee(e.target.value);
                      loadExercices(selectedUE, selectedType, e.target.value);
                    }}
                  >
                    <option value="">Choisir une année</option>
                    {annees.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                )}

                <div className="space-y-2 mt-4">
                  {exercices.map(ex => (
                    <Button key={ex.id} variant="outline" onClick={() => openCorrige(ex.id)}>Exercice {ex.numero}</Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ================= LIGHTBOX SIMPLE ================= */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center overflow-auto" onClick={() => setLightboxIndex(null)}>
          <div className="relative max-w-5xl w-full p-4" onClick={e => e.stopPropagation()}>
            <Button onClick={() => setLightboxIndex(null)} className="absolute top-2 right-2">Fermer</Button>
            <img src={images[lightboxIndex]} alt="Corrigé" className="w-full h-auto block mx-auto bg-white" />
            <div className="flex justify-between mt-2">
              <Button disabled={lightboxIndex === 0} onClick={() => setLightboxIndex(i => i! - 1)}>←</Button>
              <Button disabled={lightboxIndex === images.length - 1} onClick={() => setLightboxIndex(i => i! + 1)}>→</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UESelection;
