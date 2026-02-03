import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

// --- INTERFACES ---
interface UFR { id: string; nom: string; description: string | null; image_url: string | null; }
interface Departement { id: string; nom: string; description: string | null; image_url: string | null; ufr_id: string | null; }
interface UE { id: string; nom: string; description: string | null; discipline_id: string | null; }
interface Exercice { id: string; numero: number; type: string; annee: string; description: string | null; }

const UESelection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [selectedUFR, setSelectedUFR] = useState<UFR | null>(null);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [selectedDepartement, setSelectedDepartement] = useState<Departement | null>(null);
  const [ues, setUes] = useState<UE[]>([]);
  const [selectedUE, setSelectedUE] = useState<UE | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedAnnee, setSelectedAnnee] = useState<string>("");
  const [selectedExercice, setSelectedExercice] = useState<Exercice | null>(null);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [annees, setAnnees] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exercicesDialogOpen, setExercicesDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Précharger les images
  const preloadImages = (urls: string[]) => {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!profile?.ufr_id) {
        setLoading(false);
        return;
      }

      const { data: ufrData } = await supabase.from("ufrs").select("*").eq("id", profile.ufr_id).maybeSingle();
      if (ufrData) setSelectedUFR(ufrData);

      const { data } = await supabase
        .from("departements")
        .select("*")
        .eq("ufr_id", profile.ufr_id)
        .eq("visible", true)
        .order("nom");
      if (data) setDepartements(data);

      setLoading(false);
    };

    if (profile) fetchInitialData();
  }, [profile]);

  const handleDepartementClick = async (dept: Departement) => {
    setSelectedDepartement(dept);
    setLoading(true);

    const { data } = await supabase.from("ues").select("*").eq("discipline_id", dept.id).eq("visible", true).order("nom");
    if (data) setUes(data);
    setLoading(false);
  };

  const handleUEClick = (ue: UE) => {
    setSelectedUE(ue);
    setSelectedType("");
    setSelectedAnnee("");
    setDialogOpen(true);
  };

  const handleTypeSelect = async (type: string) => {
    setSelectedType(type);
    if (!selectedUE) return;

    const { data } = await supabase
      .from("exercices")
      .select("annee")
      .eq("ue_id", selectedUE.id)
      .eq("type", type)
      .eq("visible", true);

    if (data) setAnnees([...new Set(data.map(e => e.annee))].sort().reverse());
  };

  const handleAnneeSelect = async (annee: string) => {
    setSelectedAnnee(annee);
    if (!selectedUE || !selectedType) return;

    const { data } = await supabase
      .from("exercices")
      .select("*")
      .eq("ue_id", selectedUE.id)
      .eq("type", selectedType)
      .eq("annee", annee)
      .eq("visible", true)
      .order("numero");

    if (data) {
      setExercices(data);
      setExercicesDialogOpen(true);
      setDialogOpen(false);
    }
  };

  const handleExerciceSelect = async (ex: Exercice) => {
    setSelectedExercice(ex);
    const { data } = await supabase.from("corriges").select("*").eq("exercice_id", ex.id).eq("visible", true);

    if (data && data.length > 0) {
      const images = data.flatMap(c => c.image_urls || []);
      setAllImages(images);
      preloadImages(images);
      setExercicesDialogOpen(false);
      setLightboxIndex(0);
      setLightboxOpen(true);
      await supabase.from("consultations").insert({ corrige_id: data[0].id, user_id: profile?.id });
    }
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setAllImages([]);
    setSelectedExercice(null);
  };

  const handleBackToDepartements = () => {
    setSelectedDepartement(null);
    setUes([]);
    setAllImages([]);
    setLightboxOpen(false);
    setSelectedExercice(null);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
          </div>
        </div>
      ) : !selectedDepartement ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-[hsl(280_70%_65%)]/10 border border-primary/20">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[hsl(280_70%_60%)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{selectedUFR?.nom || "Vos départements"}</h3>
              <p className="text-sm text-muted-foreground">Sélectionnez un département pour voir les UEs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departements.map((dept, i) => (
              <Card 
                key={dept.id} 
                className="cursor-pointer hover-lift border-0 shadow-lg overflow-hidden group animate-slide-up" 
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => handleDepartementClick(dept)}
              >
                <div className="h-1 bg-gradient-to-r from-primary to-[hsl(280_70%_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3">
                  {dept.image_url && (
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img src={dept.image_url} alt={dept.nom} className="w-full h-28 object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <CardTitle className="flex items-center gap-2 text-base group-hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    {dept.nom}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    Explorer les UEs →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={handleBackToDepartements} className="hover:bg-primary/10 gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour aux départements
          </Button>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-yellow-400/10 border border-accent/20">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{selectedDepartement.nom}</h3>
              <p className="text-sm text-muted-foreground">Choisissez une UE pour accéder aux corrigés</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ues.map((ue, i) => (
              <Card 
                key={ue.id} 
                className="cursor-pointer hover-lift border-0 shadow-lg overflow-hidden group animate-slide-up" 
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => handleUEClick(ue)}
              >
                <div className="h-1 bg-gradient-to-r from-accent to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base group-hover:text-accent transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    {ue.nom}
                  </CardTitle>
                  {ue.description && <CardDescription className="mt-2">{ue.description}</CardDescription>}
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
                    Voir les corrigés →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ImageLightbox
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
      />

      {/* Modal sélection type/année */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(280_70%_60%)] flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              {selectedUE?.nom}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={selectedType === "TD" ? "default" : "outline"} 
                onClick={() => handleTypeSelect("TD")}
                className={selectedType === "TD" ? "bg-gradient-to-r from-primary to-[hsl(280_70%_60%)] shadow-lg" : "hover:border-primary hover:text-primary"}
                size="lg"
              >
                📝 TD
              </Button>
              <Button 
                variant={selectedType === "Examen" ? "default" : "outline"} 
                onClick={() => handleTypeSelect("Examen")}
                className={selectedType === "Examen" ? "bg-gradient-to-r from-accent to-yellow-400 shadow-lg" : "hover:border-accent hover:text-accent"}
                size="lg"
              >
                📚 Examen
              </Button>
            </div>
            {selectedType && annees.length > 0 && (
              <Select value={selectedAnnee} onValueChange={handleAnneeSelect}>
                <SelectTrigger className="h-12"><SelectValue placeholder="📅 Choisir une année" /></SelectTrigger>
                <SelectContent>{annees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal sélection exercice */}
      <Dialog open={exercicesDialogOpen} onOpenChange={setExercicesDialogOpen}>
        <DialogContent className="border-accent/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              {selectedUE?.nom} - {selectedType} {selectedAnnee}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {exercices.map((ex, i) => (
              <Button 
                key={ex.id} 
                variant="outline" 
                className="justify-start h-auto py-4 px-5 hover:bg-accent/10 hover:border-accent hover:text-accent transition-all group animate-slide-up" 
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => handleExerciceSelect(ex)}
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3 group-hover:bg-accent group-hover:text-white transition-all">
                  {ex.numero}
                </div>
                <span className="font-semibold">Exercice {ex.numero}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UESelection;
