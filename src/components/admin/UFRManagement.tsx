import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface UFR {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  visible: boolean;
}

const UFRManagement = () => {
  const [ufrs, setUfrs] = useState<UFR[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUFR, setEditingUFR] = useState<UFR | null>(null);
  const [formData, setFormData] = useState({ nom: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchUFRs = async () => {
    const { data, error } = await supabase
      .from("ufrs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des UFRs");
      console.error(error);
    } else {
      setUfrs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUFRs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = editingUFR?.image_url || null;

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

    if (editingUFR) {
      const { error } = await supabase
        .from("ufrs")
        .update({ 
          nom: formData.nom, 
          description: formData.description,
          image_url: imageUrl
        })
        .eq("id", editingUFR.id);

      if (error) {
        toast.error("Erreur lors de la modification");
        console.error(error);
      } else {
        toast.success("UFR modifié avec succès");
        fetchUFRs();
      }
    } else {
      const { error } = await supabase
        .from("ufrs")
        .insert([{ 
          nom: formData.nom, 
          description: formData.description,
          image_url: imageUrl
        }]);

      if (error) {
        toast.error("Erreur lors de la création");
        console.error(error);
      } else {
        toast.success("UFR créé avec succès");
        fetchUFRs();
      }
    }

    setOpen(false);
    setFormData({ nom: "", description: "" });
    setEditingUFR(null);
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet UFR ?")) return;

    const { error } = await supabase
      .from("ufrs")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } else {
      toast.success("UFR supprimé avec succès");
      fetchUFRs();
    }
  };

  const openEditDialog = (ufr: UFR) => {
    setEditingUFR(ufr);
    setFormData({ nom: ufr.nom, description: ufr.description || "" });
    setOpen(true);
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
            setEditingUFR(null);
            setFormData({ nom: "", description: "" });
            setSelectedFile(null);
          }}>
            Ajouter un UFR
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUFR ? "Modifier" : "Ajouter"} un UFR</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom (ex: SSMT)</Label>
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
              {editingUFR ? "Modifier" : "Créer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ufrs.map((ufr) => (
          <Card key={ufr.id}>
            <CardContent className="p-4">
              {ufr.image_url && (
                <img 
                  src={ufr.image_url} 
                  alt={ufr.nom}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <h3 className="font-semibold text-lg mb-2">{ufr.nom}</h3>
              <p className="text-sm text-muted-foreground mb-4">{ufr.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(ufr)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(ufr.id)}
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

export default UFRManagement;
