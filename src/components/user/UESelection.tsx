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
interface Corrige { id: string; image_urls: string[]; }

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
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  // Précharger les images pour le lightbox
  const preloadImages = (urls: string[]) => {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!profile?.ufr_id) {
        setLoading(false);
        return;
      }

      const { data: ufrData } = await supabase
        .from("ufrs")
        .select("*")
        .eq("id", profile.ufr_id)
        .maybeSingle();
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

    const { data } = await supabase
      .from("ues")
      .select("*")
      .eq("discipline_id", dept.id)
      .eq("visible", true)
      .order("nom");

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

    const { data } = await supabase
      .from("corriges")
      .select("*")
      .eq("exercice_id", ex.id)
      .eq("visible", true);

    if (data && data.length > 0) {
      const images = data.flatMap(c => c.image_urls || []);
      setAllImages(images);
      preloadImages(images);

      setGalleryOpen(true);
      setExercicesDialogOpen(false);

      await supabase.from("consultations").insert({ corrige_id: data[0].id, user_id: profile?.id });
    }
  };

  const handleImageClick = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER */}
      <header className="border-b bg-card px-4 py-3 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl text-primary">Le Koro</span>
            <nav className="hidden md:flex gap-4 text-sm font-medium">
              <a href="#" className="hover:text-primary transition-colors">Accueil</a>
              <a href="#" className="text-primary border-b-2 border-primary">UEs & Corrigés</a>
              <a href="#" className="hover:text-primary transition-colors">Historique</a>
              <a href="#" className="hover:text-primary transition-colors">Profil</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Bienvenue, <strong>{profile?.full_name || "Utilisateur"}</strong>
            </span>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Contacter l'admin
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-12 pb-8 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Disciplines et UEs</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Sélectionnez un UFR, puis un département, puis une UE pour accéder aux TD et examens.
          </p>
          <div className="bg-primary/10 inline-block px-4 py-1 rounded-full text-primary font-medium text-sm">
            Plateforme dédiée aux étudiants en Mathématiques et Informatique.
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {!selectedDepartement ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold bg-muted p-4 rounded-lg border-l-4 border-primary">
                  {selectedUFR?.nom || "Sélectionnez un département"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departements.map(dept => (
                    <Card
                      key={dept.id}
                      className="cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => handleDepartementClick(dept)}
                    >
                      <CardHeader>
                        {dept.image_url && (
                          <img src={dept.image_url} alt={dept.nom} className="w-full h-32 object-cover rounded-md mb-3" />
                        )}
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" /> {dept.nom}
                        </CardTitle>
                        {dept.description && <CardDescription>{dept.description}</CardDescription>}
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">Voir les UEs</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => { setSelectedDepartement(null); setUes([]); }}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux départements
                </Button>
                <h2 className="text-2xl font-bold bg-accent/10 p-4 rounded-lg border-l-4 border-accent">{selectedDepartement.nom}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ues.map(ue => (
                    <Card
                      key={ue.id}
                      className="cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => handleUEClick(ue)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-accent" /> {ue.nom}
                        </CardTitle>
                        {ue.description && <CardDescription>{ue.description}</CardDescription>}
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">Voir les corrigés</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-card border-t py-12 px-4 mt-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Le Koro</h3>
            <p className="text-sm text-muted-foreground">
              Accédez à des milliers de corrigés pour réussir vos études en Math-Info.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">FAQ</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Confidentialité</a></li>
              <li><a href="#" className="hover:text-primary">Conditions d'utilisation</a></li>
            </ul>
          </div>
          <div className="text-sm text-muted-foreground md:text-right">
            <p>© 2025 Le Koro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* MODALES */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUE?.nom}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant={selectedType === "TD" ? "default" : "outline"} onClick={() => handleTypeSelect("TD")}>TD</Button>
              <Button variant={selectedType === "Examen" ? "default" : "outline"} onClick={() => handleTypeSelect("Examen")}>Examen</Button>
            </div>
            {selectedType && annees.length > 0 && (
              <Select value={selectedAnnee} onValueChange={handleAnneeSelect}>
                <SelectTrigger><SelectValue placeholder="Choisir une année" /></SelectTrigger>
                <SelectContent>{annees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exercicesDialogOpen} onOpenChange={setExercicesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUE?.nom} - {selectedType} {selectedAnnee}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {exercices.map(ex => (
              <Button
                key={ex.id}
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => handleExerciceSelect(ex)}
              >
                <div className="text-left font-bold">Exercice {ex.numero}</div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{selectedUE?.nom} - Exercice {selectedExercice?.numero}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto p-1">
            {allImages.map((url, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md border"
                onClick={() => handleImageClick(idx)}
              >
                <img
                  src={url}
                  alt={`Page ${idx + 1}`}
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-110 transform-gpu"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/20 pointer-events-none">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 bg-black/40 px-3 py-1 rounded text-xs">
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
    </div>
  );
};

export default UESelection;
