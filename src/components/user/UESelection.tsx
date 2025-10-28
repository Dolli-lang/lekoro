import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UE {
  id: string;
  nom: string;
  description: string | null;
}

interface Corrige {
  id: string;
  type: string;
  annee: string;
  image_url: string;
}

const UESelection = () => {
  const [ues, setUes] = useState<UE[]>([]);
  const [selectedUE, setSelectedUE] = useState<UE | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedAnnee, setSelectedAnnee] = useState<string>("");
  const [corriges, setCorriges] = useState<Corrige[]>([]);
  const [annees, setAnnees] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUEs = async () => {
      const { data, error } = await supabase
        .from("ues")
        .select("*")
        .eq("visible", true)
        .order("nom");

      if (!error && data) {
        setUes(data);
      }
      setLoading(false);
    };

    fetchUEs();
  }, []);

  const handleUEClick = (ue: UE) => {
    setSelectedUE(ue);
    setSelectedType("");
    setSelectedAnnee("");
    setDialogOpen(true);
  };

  const handleTypeSelect = async (type: string) => {
    setSelectedType(type);
    setSelectedAnnee("");
    
    if (selectedUE) {
      const { data } = await supabase
        .from("corriges")
        .select("annee")
        .eq("ue_id", selectedUE.id)
        .eq("type", type)
        .eq("visible", true);

      if (data) {
        const uniqueAnnees = [...new Set(data.map(c => c.annee))];
        setAnnees(uniqueAnnees.sort().reverse());
      }
    }
  };

  const handleAnneeSelect = async (annee: string) => {
    setSelectedAnnee(annee);
    
    if (selectedUE && selectedType) {
      const { data } = await supabase
        .from("corriges")
        .select("*")
        .eq("ue_id", selectedUE.id)
        .eq("type", selectedType)
        .eq("annee", annee)
        .eq("visible", true);

      if (data) {
        setCorriges(data);
        setGalleryOpen(true);
        setDialogOpen(false);
      }
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ues.map((ue) => (
          <Card key={ue.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleUEClick(ue)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
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

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUE?.nom} - {selectedType} - {selectedAnnee}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            {corriges.map((corrige) => (
              <div key={corrige.id} className="relative group">
                <img
                  src={corrige.image_url}
                  alt={`Corrigé ${corrige.annee}`}
                  className="w-full h-auto rounded-lg"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UESelection;
