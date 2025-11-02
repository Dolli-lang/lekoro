import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Discipline {
  id: string;
  nom: string;
}

interface UE {
  id: string;
  nom: string;
  discipline_id: string | null;
  disciplines?: { nom: string };
}

interface Corrige {
  id: string;
  type: string;
  annee: string;
  image_urls: string[];
  ues: { 
    nom: string;
    disciplines: { nom: string } | null;
  };
}

const CorrigesManagement = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [ues, setUes] = useState<UE[]>([]);
  const [filteredUes, setFilteredUes] = useState<UE[]>([]);
  const [corriges, setCorriges] = useState<Corrige[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    discipline_id: "",
    ue_id: "",
    type: "TD",
    annee: new Date().getFullYear().toString(),
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    const [disciplinesRes, uesRes, corrigesRes] = await Promise.all([
      supabase.from("disciplines").select("id, nom").eq("visible", true).order("nom"),
      supabase.from("ues").select("id, nom, discipline_id, disciplines(nom)").order("nom"),
      supabase.from("corriges").select("*, ues(nom, disciplines(nom))").order("created_at", { ascending: false }),
    ]);

    if (disciplinesRes.data) setDisciplines(disciplinesRes.data);
    if (uesRes.data) setUes(uesRes.data as any);
    if (corrigesRes.data) setCorriges(corrigesRes.data as any);
    setLoading(false);
  };

  const handleDisciplineChange = (disciplineId: string) => {
    setFormData({ ...formData, discipline_id: disciplineId, ue_id: "" });
    const filtered = ues.filter(ue => ue.discipline_id === disciplineId);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Upload all files
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
        .insert([{ ...formData, image_urls: imageUrls }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Corrigé ajouté avec ${imageUrls.length} image(s)`,
      });
      fetchData();
      setDialogOpen(false);
      setFormData({ discipline_id: "", ue_id: "", type: "TD", annee: new Date().getFullYear().toString() });
      setSelectedFiles([]);
      setFilteredUes([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le corrigé",
        variant: "destructive",
      });
    }
    
    setUploading(false);
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un corrigé
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un corrigé</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="discipline">Discipline</Label>
              <Select value={formData.discipline_id} onValueChange={handleDisciplineChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une discipline" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map((discipline) => (
                    <SelectItem key={discipline.id} value={discipline.id}>
                      {discipline.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ue">UE</Label>
              <Select 
                value={formData.ue_id} 
                onValueChange={(value) => setFormData({ ...formData, ue_id: value })}
                disabled={!formData.discipline_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.discipline_id ? "Sélectionner une UE" : "Sélectionnez d'abord une discipline"} />
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
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
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
                value={formData.annee}
                onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                required
              />
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
            <TableHead>Discipline</TableHead>
            <TableHead>UE</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Année</TableHead>
            <TableHead>Images</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {corriges.map((corrige) => (
            <TableRow key={corrige.id}>
              <TableCell>{corrige.ues.disciplines?.nom || "N/A"}</TableCell>
              <TableCell>{corrige.ues.nom}</TableCell>
              <TableCell>{corrige.type}</TableCell>
              <TableCell>{corrige.annee}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {corrige.image_urls?.map((url, idx) => (
                    <img key={idx} src={url} alt={`Corrigé ${idx + 1}`} className="h-12 w-12 object-cover rounded" />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CorrigesManagement;
