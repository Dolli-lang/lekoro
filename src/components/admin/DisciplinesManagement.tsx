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

interface Discipline {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  visible: boolean;
}

const DisciplinesManagement = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [formData, setFormData] = useState({ nom: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchDisciplines = async () => {
    const { data, error } = await supabase
      .from("disciplines")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des disciplines");
      console.error(error);
    } else {
      setDisciplines(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = editingDiscipline?.image_url || null;

    // Upload image if selected
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

    if (editingDiscipline) {
      const { error } = await supabase
        .from("disciplines")
        .update({ 
          nom: formData.nom, 
          description: formData.description,
          image_url: imageUrl
        })
        .eq("id", editingDiscipline.id);

      if (error) {
        toast.error("Erreur lors de la modification");
        console.error(error);
      } else {
        toast.success("Discipline modifiée avec succès");
        fetchDisciplines();
      }
    } else {
      const { error } = await supabase
        .from("disciplines")
        .insert([{ 
          nom: formData.nom, 
          description: formData.description,
          image_url: imageUrl
        }]);

      if (error) {
        toast.error("Erreur lors de la création");
        console.error(error);
      } else {
        toast.success("Discipline créée avec succès");
        fetchDisciplines();
      }
    }

    setOpen(false);
    setFormData({ nom: "", description: "" });
    setEditingDiscipline(null);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette discipline ?")) return;

    const { error } = await supabase
      .from("disciplines")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } else {
      toast.success("Discipline supprimée avec succès");
      fetchDisciplines();
    }
  };

  const openEditDialog = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
    setFormData({ nom: discipline.nom, description: discipline.description || "" });
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
            setEditingDiscipline(null);
            setFormData({ nom: "", description: "" });
            setSelectedFile(null);
          }}>
            Ajouter une discipline
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDiscipline ? "Modifier" : "Ajouter"} une discipline</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom</Label>
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
              {editingDiscipline ? "Modifier" : "Créer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplines.map((discipline) => (
          <Card key={discipline.id}>
            <CardContent className="p-4">
              {discipline.image_url && (
                <img 
                  src={discipline.image_url} 
                  alt={discipline.nom}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <h3 className="font-semibold text-lg mb-2">{discipline.nom}</h3>
              <p className="text-sm text-muted-foreground mb-4">{discipline.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(discipline)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(discipline.id)}
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

export default DisciplinesManagement;