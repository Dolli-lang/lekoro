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

interface UE {
  id: string;
  nom: string;
}

interface Corrige {
  id: string;
  type: string;
  annee: string;
  image_url: string;
  ues: { nom: string };
}

const CorrigesManagement = () => {
  const [ues, setUes] = useState<UE[]>([]);
  const [corriges, setCorriges] = useState<Corrige[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    ue_id: "",
    type: "TD",
    annee: new Date().getFullYear().toString(),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    const [uesRes, corrigesRes] = await Promise.all([
      supabase.from("ues").select("id, nom").order("nom"),
      supabase.from("corriges").select("*, ues(nom)").order("created_at", { ascending: false }),
    ]);

    if (uesRes.data) setUes(uesRes.data);
    if (corrigesRes.data) setCorriges(corrigesRes.data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("corrige-images")
      .upload(filePath, selectedFile);

    if (uploadError) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("corrige-images")
      .getPublicUrl(filePath);

    const { error } = await supabase
      .from("corriges")
      .insert([{ ...formData, image_url: publicUrl }]);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le corrigé",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Corrigé ajouté",
      });
      fetchData();
      setDialogOpen(false);
      setFormData({ ue_id: "", type: "TD", annee: new Date().getFullYear().toString() });
      setSelectedFile(null);
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
              <Label htmlFor="ue">UE</Label>
              <Select value={formData.ue_id} onValueChange={(value) => setFormData({ ...formData, ue_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une UE" />
                </SelectTrigger>
                <SelectContent>
                  {ues.map((ue) => (
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
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
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
            <TableHead>UE</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Année</TableHead>
            <TableHead>Image</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {corriges.map((corrige) => (
            <TableRow key={corrige.id}>
              <TableCell>{corrige.ues.nom}</TableCell>
              <TableCell>{corrige.type}</TableCell>
              <TableCell>{corrige.annee}</TableCell>
              <TableCell>
                <img src={corrige.image_url} alt="Corrigé" className="h-12 w-12 object-cover rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CorrigesManagement;
