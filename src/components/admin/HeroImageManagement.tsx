import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";

export const HeroImageManagement = () => {
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHeroImage();
  }, []);

  const fetchHeroImage = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image_url")
        .single();

      if (!error && data) {
        setHeroImageUrl(data.value);
      }
    } catch (error) {
      console.error("Error fetching hero image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("hero-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("hero-images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ value: publicUrl })
        .eq("key", "hero_image_url");

      if (updateError) throw updateError;

      setHeroImageUrl(publicUrl);
      toast({
        title: "Succès",
        description: "L'image d'accueil a été mise à jour",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Image d'accueil
        </CardTitle>
        <CardDescription>
          Gérez l'image de fond de la page d'accueil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {heroImageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden border">
            <img
              src={heroImageUrl}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="hero-upload">Nouvelle image</Label>
          <div className="flex gap-2">
            <Input
              id="hero-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
          <p className="text-xs text-muted-foreground">
            Format recommandé: 1920x1080px, max 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};