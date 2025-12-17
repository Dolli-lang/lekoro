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

  // --- LOGIQUE DE DONNÉES ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (profile?.ufr_id) {
        const { data: ufrData } = await supabase.from("ufrs").select("*").eq("id", profile.ufr_id).maybeSingle();
        if (ufrData) setSelectedUFR(ufrData);

        const { data } = await supabase.from("departements").select("*").eq("ufr_id", profile.ufr_id).eq("visible", true).order("nom");
        if (data) setDepartements(data);
      }
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
    if (selectedUE) {
      const { data } = await supabase.from("exercices").select("annee").eq("ue_id", selectedUE.id).eq("type", type).eq("visible", true);
      if (data) setAnnees([...new Set(data.map(e => e.annee))].sort().reverse());
    }
  };

  const handleAnneeSelect = async (annee: string) => {
    setSelectedAnnee(annee);
    if (selectedUE && selectedType) {
      const { data } = await supabase.from("exercices").select("*").eq("ue_id", selectedUE.id).eq("type", selectedType).eq("annee", annee).eq("visible", true).order("numero");
      if (data) {
        setExercices(data);
        setExercicesDialogOpen(true);
        setDialogOpen(false);
      }
    }
  };

  const handleExerciceSelect = async (ex: Exercice) => {
    setSelectedExercice(ex);
    const { data } = await supabase.from("corriges").select("*").eq("exercice_id", ex.id).eq("visible", true);
    if (data) {
      const images = data.flatMap((c) => c.image_urls || []);
      setAllImages(images);
      setGalleryOpen(true);
      setExercicesDialogOpen(false);
      await supabase.from("consultations").insert({ corrige_id: data[0]?.id, user_id: profile?.id });
    }
  };

  // --- MODIFICATION ICI : On ne ferme plus la galerie ---
  const handleImageClick = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true); // La galerie reste ouverte en arrière-plan
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* --- HEADER --- */}
      <header className="border-b bg-card px-4 py-3 sticky top-0 z-50 shadow-sm">
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
            <span className="text-sm text-muted-foreground hidden sm:inline">Bienvenue, <strong>{profile?.full_name || "Utilisateur"}</strong></span>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Contacter l'admin
            </Button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-12 pb-8 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Disciplines et UEs</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Sélectionnez un UFR, puis un département, puis une UE pour accéder aux TD et examens.
          </p>
          <div className="bg-primary/10 inline-block px-4 py-2 rounded-full text-primary font-medium text-sm">
            Plateforme dédiée aux étudiants en Mathématiques et Informatique.
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <>
            {!selectedDepartement ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold bg-muted p-4 rounded-lg border-l-4 border-primary shadow-sm">
                  {selectedUFR?.nom || "Sélectionnez un département"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departements.map((dept) => (
                    <Card key={dept.id} className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1" onClick={() => handleDepartementClick(dept)}>
                      <CardHeader>
                        {dept.image_url && <img src={dept.image_url} alt={dept.nom} className="w-full h-40 object-cover rounded-md mb-3" />}
                        <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> {dept.nom}</CardTitle>
                        {dept.description && <CardDescription className="line-clamp-2">{dept.description}</CardDescription>}
                      </CardHeader>
                      <CardContent><Button variant="outline" className="w-full">Voir les UEs</Button></CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Button variant="ghost" onClick={() => { setSelectedDepartement(null); setUes([]); }} className="mb-4 hover:bg-accent/10">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux départements
                </Button>
                <h2 className="text-2xl font-bold bg-accent/10 p-4 rounded-lg border-l-4 border-accent shadow-sm">{selectedDepartement.nom}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ues.map((ue) => (
                    <Card key={ue.id} className="cursor-pointer hover:shadow-xl transition-all" onClick={() => handleUEClick(ue)}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-accent" /> {ue.nom}</CardTitle>
                        {ue.description && <CardDescription className="line-clamp-2">{ue.description}</CardDescription>}
                      </CardHeader>
                      <CardContent><Button variant="outline" className="w-full hover:bg-accent hover:text-white transition-colors">Voir les corrigés</Button></CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-card border-t py-12 px-4 mt-auto">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-primary">Le Koro</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Plateforme dédiée aux étudiants en Mathématiques et Informatique. Accédez à des milliers de corrigés pour réussir vos études.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-foreground">Navigation</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-foreground">Légal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</a></li>
            </ul>
          </div>
          <div className="text-sm text-muted-foreground md:text-right flex flex-col justify-end">
            <p>© 2025 Le Koro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* --- MODALES --- */}

      {/* Dialog Type/Année */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{selectedUE?.nom}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold">Type de document</label>
              <div className="grid grid-cols-2 gap-4">
                <Button variant={selectedType === "TD" ? "default" : "outline"} onClick={() => handleTypeSelect("TD")} className="w-full">TD</Button>
                <Button variant={selectedType === "Examen" ? "default" : "outline"} onClick={() => handleTypeSelect("Examen")} className="w-full">Examen</Button>
              </div>
            </div>
            {selectedType && annees.length > 0 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-semibold">Année académique</label>
                <Select value={selectedAnnee} onValueChange={handleAnneeSelect}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Choisir une année" /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">{annees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Liste Exercices */}
      <Dialog open={exercicesDialogOpen} onOpenChange={setExercicesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{selectedUE?.nom} - {selectedType} {selectedAnnee}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {exercices.map((ex) => (
              <Button key={ex.id} variant="outline" className="justify-start h-auto py-4 px-5 hover:border-primary transition-all group" onClick={() => handleExerciceSelect(ex)}>
                <div className="text-left">
                  <div className="font-bold group-hover:text-primary transition-colors">Exercice {ex.numero}</div>
                  {ex.description && <div className="text-xs text-muted-foreground mt-1">{ex.description}</div>}
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Galerie des Corrigés (AVEC FIX TREMBLEMENT ET PERSISTANCE) */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedUE?.nom} - Exercice {selectedExercice?.numero}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">Cliquez sur une page pour l'afficher en plein écran sans fermer cette liste.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto p-2 pb-6">
            {allImages.map((url, idx) => (
              <div 
                key={idx} 
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md border bg-muted aspect-[3/4]"
                onClick={() => handleImageClick(idx)}
              >
                <img
                  src={url}
                  alt={`Page ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 transform-gpu"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30 pointer-events-none">
                  <span className="text-white font-bold opacity-0 group-hover:opacity-100 bg-primary/80 px-4 py-2 rounded-full text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Agrandir Page {idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* L'image en grand (Lightbox) qui s'affiche AU-DESSUS de la galerie */}
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
