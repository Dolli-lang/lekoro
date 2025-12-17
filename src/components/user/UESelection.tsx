import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Loader2, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

interface UFR {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
}

interface Departement {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  ufr_id: string | null;
}

interface UE {
  id: string;
  nom: string;
  description: string | null;
  discipline_id: string | null;
}

interface Exercice {
  id: string;
  numero: number;
  type: string;
  annee: string;
  description: string | null;
}

interface Corrige {
  id: string;
  image_urls: string[];
}

const UESelection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [ufrs, setUfrs] = useState<UFR[]>([]);
  const [selectedUFR, setSelectedUFR] = useState<UFR | null>(null);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [selectedDepartement, setSelectedDepartement] = useState<Departement | null>(null);
  const [ues, setUes] = useState<UE[]>([]);
  const [selectedUE, setSelectedUE] = useState<UE | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedAnnee, setSelectedAnnee] = useState<string>("");
  const [selectedExercice, setSelectedExercice] = useState<Exercice | null>(null);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [corriges, setCorriges] = useState<Corrige[]>([]);
  const [annees, setAnnees] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exercicesDialogOpen, setExercicesDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchDepartements = async () => {
      if (profile?.ufr_id) {
        const { data: ufrData } = await supabase
          .from("ufrs")
          .select("*")
          .eq("id", profile.ufr_id)
          .eq("visible", true)
          .maybeSingle();

        if (ufrData) {
          setSelectedUFR(ufrData);
        }

        const { data, error } = await supabase
          .from("departements")
          .select("*")
          .eq("ufr_id", profile.ufr_id)
          .eq("visible", true)
          .order("nom");

        if (!error && data) {
          setDepartements(data);
        } else if (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les départements",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    };

    if (profile) {
      fetchDepartements();
    }
  }, [profile]);

  const handleUFRClick = async (ufr: UFR) => {
    setSelectedUFR(ufr);
    setLoading(true);

    const { data, error } = await supabase
      .from("departements")
      .select("*")
      .eq("ufr_id", ufr.id)
      .eq("visible", true)
      .order("nom");

    if (!error && data) {
      setDepartements(data);
    }
    setLoading(false);
  };

  const handleDepartementClick = async (departement: Departement) => {
    setSelectedDepartement(departement);
    setLoading(true);

    const { data, error } = await supabase
      .from("ues")
      .select("*")
      .eq("discipline_id", departement.id)
      .eq("visible", true)
      .order("nom");

    if (!error && data) {
      setUes(data);
    }
    setLoading(false);
  };

  const handleBackToUFRs = () => {
    setSelectedUFR(null);
    setDepartements([]);
  };

  const handleBackToDepartements = () => {
    setSelectedDepartement(null);
    setUes([]);
  };

  const handleUEClick = (ue: UE) => {
    setSelectedUE(ue);
    setSelectedType("");
    setSelectedAnnee("");
    setExercices([]);
    setDialogOpen(true);
  };

  const handleTypeSelect = async (type: string) => {
    setSelectedType(type);
    setSelectedAnnee("");
    setExercices([]);
    
    if (selectedUE) {
      const { data } = await supabase
        .from("exercices")
        .select("annee")
        .eq("ue_id", selectedUE.id)
        .eq("type", type)
        .eq("visible", true);

      if (data) {
        const uniqueAnnees = [...new Set(data.map(e => e.annee))];
        setAnnees(uniqueAnnees.sort().reverse());
      }
    }
  };

  const handleAnneeSelect = async (annee: string) => {
    setSelectedAnnee(annee);
    
    if (selectedUE && selectedType) {
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
    }
  };

  const handleExerciceSelect = async (exercice: Exercice) => {
    setSelectedExercice(exercice);
    
    const { data } = await supabase
      .from("corriges")
      .select("*")
      .eq("exercice_id", exercice.id)
      .eq("visible", true);

    if (data) {
      setCorriges(data);
      // Flatten all images from all corriges
      const images = data.flatMap((c) => c.image_urls || []);
      setAllImages(images);
      setGalleryOpen(true);
      setExercicesDialogOpen(false);
      
      // Enregistrer la consultation
      await supabase
        .from("consultations")
        .insert({
          corrige_id: data[0]?.id,
          user_id: profile?.id,
        });
    }
  };

  const handleImageClick = (imageIndex: number) => {
    setLightboxIndex(imageIndex);
    setGalleryOpen(false); // Fermer la gallery avant d'ouvrir le lightbox
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {!selectedDepartement ? (
        <div>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
            {selectedUFR?.nom || "Sélectionnez un département"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departements.map((departement) => (
              <Card 
                key={departement.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/50 bg-gradient-to-br from-background to-primary/5" 
                onClick={() => handleDepartementClick(departement)}
              >
                <CardHeader>
                  {departement.image_url && (
                    <img 
                      src={departement.image_url} 
                      alt={departement.nom}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {departement.nom}
                  </CardTitle>
                  {departement.description && <CardDescription>{departement.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Voir les UEs
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <Button 
            variant="ghost" 
            onClick={handleBackToDepartements}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux départements
          </Button>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-accent/10 to-primary/10 p-4 rounded-lg border-l-4 border-accent">{selectedDepartement.nom}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ues.map((ue) => (
              <Card key={ue.id} className="cursor-pointer hover:shadow-lg transition-shadow hover:border-accent/50 bg-gradient-to-br from-background to-accent/5" onClick={() => handleUEClick(ue)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {ue.nom}
                  </CardTitle>
                  {ue.description && <CardDescription>{ue.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Voir les corrigés
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUE?.nom}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedType === "TD" ? "default" : "outline"}
                  onClick={() => handleTypeSelect("TD")}
                >
                  TD
                </Button>
                <Button
                  variant={selectedType === "Examen" ? "default" : "outline"}
                  onClick={() => handleTypeSelect("Examen")}
                >
                  Examen
                </Button>
              </div>
            </div>

            {selectedType && annees.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Année</label>
                <Select value={selectedAnnee} onValueChange={handleAnneeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une année" />
                  </SelectTrigger>
                  <SelectContent>
                    {annees.map((annee) => (
                      <SelectItem key={annee} value={annee}>
                        {annee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exercicesDialogOpen} onOpenChange={setExercicesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUE?.nom} - {selectedType} - {selectedAnnee}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">Sélectionnez un exercice :</p>
            {exercices.map((exercice) => (
              <Button
                key={exercice.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExerciceSelect(exercice)}
              >
                Exercice {exercice.numero}
                {exercice.description && ` - ${exercice.description}`}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUE?.nom} - {selectedType} {selectedAnnee} - Exercice {selectedExercice?.numero}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">Cliquez sur une image pour l'agrandir</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
            {allImages.map((imageUrl, idx) => (
              <div 
                key={idx} 
                className="relative group cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleImageClick(idx)}
              >
                <img
                  src={imageUrl}
                  alt={`Corrigé - Page ${idx + 1}`}
                  className="w-full h-auto rounded-lg shadow-md"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0transition-all duration-200 ease-in-outgroup-hover:bg-black/20 pointer-events-none">
                  <span className="text-white font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100"> 
                    Page {idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

export default UESelection;
