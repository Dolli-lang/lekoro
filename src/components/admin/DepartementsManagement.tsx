import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface UFR {
  id: string;
  nom: string;
}

interface Departement {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  visible: boolean;
  ufr_id: string | null;
}

const DepartementsManagement = () => {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [ufrs, setUfrs] = useState<UFR[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDepartement, setEditingDepartement] = useState<Departement | null>(null);
  const [formData, setFormData] = useState({ nom: "", description: "", ufr_id: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchUFRs = async () => {
    const { data, error } = await supabase
      .from("ufrs")
      .select("id, nom")
      .eq("visible", true)
      .order("nom");

    if (!error && data) {
      setUfrs(data);
    }
  };

  const fetchDepartements = async () => {
    const { data, error } = await supabase
      .from("departements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des départements");
      console.error(error);
    } else {
      setDepartements(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUFRs();
    fetchDepartements();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = editingDepartement?.image_url || null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('discipline-images')
        .upload(filePath, selectedFile);

      if (uploadError) {
        toast.error("Erreur lors du téléchargement de l'image");
        console.error(uploadError);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('discipline-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    if (editingDepartement) {
      const { error } = await supabase
        .from("departements")
        .update({ 
          nom: formData.nom, 
          description: formData.description,
          image_url: imageUrl,
          ufr_id: formData.ufr_id || null
        })
        .eq("id", editingDepartement.id);

      if (error) {
        toast.error("Erreur lors de la modification");
        console.error(error);
      } else {
        toast.success("Département modifié avec succès");
        fetchDepartements();
      }
    } else {
      const { error } = await supabase
        .from("departements")
        .insert([{ 
          nom: formData.nom, 
          description: formData.description,
          image_url: imageUrl,
          ufr_id: formData.ufr_id || null
        }]);

      if (error) {
        toast.error("Erreur lors de la création");
        console.error(error);
      } else {
        toast.success("Département créé avec succès");
        fetchDepartements();
      }
    }

    setOpen(false);
    setFormData({ nom: "", description: "", ufr_id: "" });
    setEditingDepartement(null);
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return;

    const { error } = await supabase
      .from("departements")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } else {
      toast.success("Département supprimé avec succès");
      fetchDepartements();
    }
  };

  const openEditDialog = (departement: Departement) => {
    setEditingDepartement(departement);
    setFormData({ 
      nom: departement.nom, 
      description: departement.description || "",
      ufr_id: departement.ufr_id || ""
    });
    setOpen(true);
  };

  const getUFRName = (ufrId: string | null) => {
    if (!ufrId) return "Non assigné";
    const ufr = ufrs.find(u => u.id === ufrId);
    return ufr?.nom || "Non assigné";
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => {
            setEditingDepartement(null);
            setFormData({ nom: "", description: "", ufr_id: "" });
            setSelectedFile(null);
          }}>
            Ajouter un département
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartement ? "Modifier" : "Ajouter"} un département</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ufr">UFR</Label>
              <Select value={formData.ufr_id} onValueChange={(value) => setFormData({ ...formData, ufr_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un UFR" />
                </SelectTrigger>
                <SelectContent>
                  {ufrs.map((ufr) => (
                    <SelectItem key={ufr.id} value={ufr.id}>
                      {ufr.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nom">Nom (ex: Physique Chimie)</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="image">Image (optionnel)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <Button type="submit" className="w-full">
              {editingDepartement ? "Modifier" : "Créer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departements.map((departement) => (
          <Card key={departement.id}>
            <CardContent className="p-4">
              {departement.image_url && (
                <img 
                  src={departement.image_url} 
                  alt={departement.nom}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <div className="text-xs text-muted-foreground mb-1">
                UFR: {getUFRName(departement.ufr_id)}
              </div>
              <h3 className="font-semibold text-lg mb-2">{departement.nom}</h3>
              <p className="text-sm text-muted-foreground mb-4">{departement.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(departement)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(departement.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartementsManagement;
