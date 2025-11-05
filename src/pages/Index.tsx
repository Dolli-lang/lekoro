import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookOpen, Calculator, Code, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [heroImageUrl, setHeroImageUrl] = useState(heroBg);

  useEffect(() => {
    const fetchHeroImage = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image_url")
        .single();

      if (data?.value) {
        setHeroImageUrl(data.value);
      }
    };

    fetchHeroImage();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative py-24 md:py-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
        <div className="container relative z-10 text-center text-primary-foreground">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Réussissez vos études avec<br />
            <span className="bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
              Le Koro
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-95">
            Accédez à des milliers de corrigés d'exercices et d'examens en Mathématiques et Informatique
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/ues">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <BookOpen className="mr-2 h-5 w-5" />
                Parcourir les UEs
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pourquoi Le Koro ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all">
              <CardContent className="pt-6">
                <Calculator className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Mathématiques</h3>
                <p className="text-muted-foreground">
                  Corrigés détaillés d'exercices et examens de maths
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all">
              <CardContent className="pt-6">
                <Code className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Informatique</h3>
                <p className="text-muted-foreground">
                  Solutions complètes pour vos TDs et projets
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all">
              <CardContent className="pt-6">
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Organisation</h3>
                <p className="text-muted-foreground">
                  Classés par UE, type et année scolaire
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all">
              <CardContent className="pt-6">
                <GraduationCap className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Succès</h3>
                <p className="text-muted-foreground">
                  Maximisez vos chances de réussite
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Inscrivez-vous gratuitement et accédez immédiatement à tous les corrigés
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Créer mon compte
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;