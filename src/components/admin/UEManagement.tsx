import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface UE {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  visible: boolean;
}

const UEManagement = () => {
  const [ues, setUes] = useState<UE[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUE, setEditingUE] = useState<UE | null>(null);
  const [formData, setFormData] = useState({ nom: "", description: "" });
  const { toast } = useToast();

  const fetchUEs = async () => {
    const { data, error } = await supabase
      .from("ues")
      .select("*")
      .order("nom");

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les UEs",
        variant: "destructive",
      });
    } else {
      setUes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUEs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUE) {
      const { error } = await supabase
        .from("ues")
        .update(formData)
        .eq("id", editingUE.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier l'UE",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "UE modifiée",
        });
        fetchUEs();
        setDialogOpen(false);
        setEditingUE(null);
      }
    } else {
      const { error } = await supabase
        .from("ues")
        .insert([formData]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter l'UE",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "UE ajoutée",
        });
        fetchUEs();
        setDialogOpen(false);
      }
    }
    setFormData({ nom: "", description: "" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("ues")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'UE",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "UE supprimée",
      });
      fetchUEs();
    }
  };

  const openEditDialog = (ue: UE) => {
    setEditingUE(ue);
    setFormData({ nom: ue.nom, description: ue.description || "" });
    setDialogOpen(true);
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
          <Button className="mb-4" onClick={() => { setEditingUE(null); setFormData({ nom: "", description: "" }); }}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une UE
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUE ? "Modifier l'UE" : "Ajouter une UE"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom de l'UE</Label>
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
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              {editingUE ? "Modifier" : "Ajouter"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ues.map((ue) => (
          <Card key={ue.id}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{ue.nom}</h3>
              <p className="text-sm text-muted-foreground mb-4">{ue.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(ue)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(ue.id)}>
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

export default UEManagement;
