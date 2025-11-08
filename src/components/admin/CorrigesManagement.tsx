import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Departement {
  id: string;
  nom: string;
}

interface UE {
  id: string;
  nom: string;
  discipline_id: string | null;
  departements?: { nom: string };
}

interface Exercice {
  id: string;
  type: string;
  annee: string;
  numero: number;
  description: string | null;
  ues: { 
    nom: string;
    departements: { nom: string } | null;
  };
}

interface Corrige {
  id: string;
  image_urls: string[];
  exercices: {
    numero: number;
    type: string;
    annee: string;
    ues: { 
      nom: string;
      departements: { nom: string } | null;
    };
  };
}

const CorrigesManagement = () => {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [ues, setUes] = useState<UE[]>([]);
  const [filteredUes, setFilteredUes] = useState<UE[]>([]);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [corriges, setCorriges] = useState<Corrige[]>([]);
  const [loading, setLoading] = useState(true);
  const [exerciceDialogOpen, setExerciceDialogOpen] = useState(false);
  const [corrigeDialogOpen, setCorrigeDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [exerciceFormData, setExerciceFormData] = useState({
    discipline_id: "",
    ue_id: "",
    type: "TD",
    annee: new Date().getFullYear().toString(),
    numero: "1",
    description: "",
  });
  const [corrigeFormData, setCorrigeFormData] = useState({
    exercice_id: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    const [departementsRes, uesRes, exercicesRes, corrigesRes] = await Promise.all([
      supabase.from("departements").select("id, nom").eq("visible", true).order("nom"),
      supabase.from("ues").select("id, nom, discipline_id, departements(nom)").order("nom"),
      supabase.from("exercices").select("*, ues(nom, departements(nom))").order("created_at", { ascending: false }),
      supabase.from("corriges").select("*, exercices(numero, type, annee, ues(nom, departements(nom)))").order("created_at", { ascending: false }),
    ]);

    if (departementsRes.data) setDepartements(departementsRes.data);
    if (uesRes.data) setUes(uesRes.data as any);
    if (exercicesRes.data) setExercices(exercicesRes.data as any);
    if (corrigesRes.data) setCorriges(corrigesRes.data as any);
    setLoading(false);
  };

  const handleExerciceDepartementChange = (departementId: string) => {
    setExerciceFormData({ ...exerciceFormData, discipline_id: departementId, ue_id: "" });
    const filtered = ues.filter(ue => ue.discipline_id === departementId);
    setFilteredUes(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 50);
      setSelectedFiles(files);
    }
  };

  const handleExerciceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { error } = await supabase
        .from("exercices")
        .insert([{ 
          ue_id: exerciceFormData.ue_id,
          type: exerciceFormData.type,
          annee: exerciceFormData.annee,
          numero: parseInt(exerciceFormData.numero),
          description: exerciceFormData.description || null,
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Exercice ajouté",
      });
      fetchData();
      setExerciceDialogOpen(false);
      setExerciceFormData({ 
        discipline_id: "", 
        ue_id: "", 
        type: "TD", 
        annee: new Date().getFullYear().toString(),
        numero: "1",
        description: "",
      });
      setFilteredUes([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'exercice",
        variant: "destructive",
      });
    }
    
    setUploading(false);
  };

  const handleCorrigeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("corrige-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("corrige-images")
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);

      const { error } = await supabase
        .from("corriges")
        .insert([{ 
          exercice_id: corrigeFormData.exercice_id,
          image_urls: imageUrls 
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Corrigé ajouté avec ${imageUrls.length} image(s)`,
      });
      fetchData();
      setCorrigeDialogOpen(false);
      setCorrigeFormData({ exercice_id: "" });
      setSelectedFiles([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le corrigé",
        variant: "destructive",
      });
    }
    
    setUploading(false);
  };

  const handleDeleteExercice = async (exerciceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet exercice et tous ses corrigés ?")) return;

    try {
      const { error } = await supabase
        .from("exercices")
        .delete()
        .eq("id", exerciceId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Exercice supprimé",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'exercice",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCorrige = async (corrigeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce corrigé ?")) return;

    try {
      const { error } = await supabase
        .from("corriges")
        .delete()
        .eq("id", corrigeId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Corrigé supprimé",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le corrigé",
        variant: "destructive",
      });
    }
  };

  const handleViewImages = (imageUrls: string[]) => {
    setSelectedImages(imageUrls);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="exercices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exercices">Exercices</TabsTrigger>
          <TabsTrigger value="corriges">Corrigés</TabsTrigger>
        </TabsList>

        <TabsContent value="exercices" className="space-y-4">
          <Dialog open={exerciceDialogOpen} onOpenChange={setExerciceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un exercice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un exercice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleExerciceSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="departement">Département</Label>
                  <Select value={exerciceFormData.discipline_id} onValueChange={handleExerciceDepartementChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departements.map((departement) => (
                        <SelectItem key={departement.id} value={departement.id}>
                          {departement.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ue">UE</Label>
                  <Select 
                    value={exerciceFormData.ue_id} 
                    onValueChange={(value) => setExerciceFormData({ ...exerciceFormData, ue_id: value })}
                    disabled={!exerciceFormData.discipline_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={exerciceFormData.discipline_id ? "Sélectionner une UE" : "Sélectionnez d'abord un département"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUes.map((ue) => (
                        <SelectItem key={ue.id} value={ue.id}>
                          {ue.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={exerciceFormData.type} onValueChange={(value) => setExerciceFormData({ ...exerciceFormData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TD">TD</SelectItem>
                      <SelectItem value="Examen">Examen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="annee">Année</Label>
                  <Input
                    id="annee"
                    type="text"
                    value={exerciceFormData.annee}
                    onChange={(e) => setExerciceFormData({ ...exerciceFormData, annee: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Numéro d'exercice</Label>
                  <Input
                    id="numero"
                    type="number"
                    min="1"
                    value={exerciceFormData.numero}
                    onChange={(e) => setExerciceFormData({ ...exerciceFormData, numero: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input
                    id="description"
                    type="text"
                    value={exerciceFormData.description}
                    onChange={(e) => setExerciceFormData({ ...exerciceFormData, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Département</TableHead>
                <TableHead>UE</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>N° Exercice</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercices.map((exercice) => (
                <TableRow key={exercice.id}>
                  <TableCell>{exercice.ues.departements?.nom || "N/A"}</TableCell>
                  <TableCell>{exercice.ues.nom}</TableCell>
                  <TableCell>{exercice.type}</TableCell>
                  <TableCell>{exercice.annee}</TableCell>
                  <TableCell>{exercice.numero}</TableCell>
                  <TableCell>{exercice.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExercice(exercice.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="corriges" className="space-y-4">
          <Dialog open={corrigeDialogOpen} onOpenChange={setCorrigeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un corrigé
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un corrigé</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCorrigeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="exercice">Exercice</Label>
                  <Select 
                    value={corrigeFormData.exercice_id} 
                    onValueChange={(value) => setCorrigeFormData({ exercice_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un exercice" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercices.map((exercice) => (
                        <SelectItem key={exercice.id} value={exercice.id}>
                          {exercice.ues.nom} - {exercice.type} {exercice.annee} - Ex. {exercice.numero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="images">Images (jusqu'à 50)</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    required
                  />
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedFiles.length} image(s) sélectionnée(s)
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Département</TableHead>
                <TableHead>UE</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>N° Exercice</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corriges.map((corrige) => (
                <TableRow key={corrige.id}>
                  <TableCell>{corrige.exercices.ues.departements?.nom || "N/A"}</TableCell>
                  <TableCell>{corrige.exercices.ues.nom}</TableCell>
                  <TableCell>{corrige.exercices.type}</TableCell>
                  <TableCell>{corrige.exercices.annee}</TableCell>
                  <TableCell>{corrige.exercices.numero}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewImages(corrige.image_urls)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Voir ({corrige.image_urls?.length || 0})
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCorrige(corrige.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Images du corrigé</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {selectedImages.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Corrigé ${idx + 1}`}
                className="w-full rounded-lg border"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CorrigesManagement;
