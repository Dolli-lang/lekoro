import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookOpen, Calculator, Code, GraduationCap, CheckCircle, Users, FileText } from "lucide-react";
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
      <Helmet>
        <title>Le Koro | Plateforme Académique de Corrigés - Mathématiques & Informatique</title>
        <meta name="description" content="Plateforme universitaire de ressources pédagogiques. Accédez à des milliers de corrigés d'exercices, TD et examens en Mathématiques et Informatique. Optimisez votre réussite académique." />
        <link rel="canonical" href="https://lekoro.lovable.app/" />
      </Helmet>

      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative py-24 md:py-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
        <div className="container relative z-10 text-center text-primary-foreground">
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium bg-accent/20 rounded-full border border-accent/30">
            🎓 Plateforme Académique Universitaire
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Réussissez vos études avec<br />
            <span className="bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
              Le Koro
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-95">
            Accédez à des milliers de corrigés d'exercices et d'examens en 
            <strong> Mathématiques</strong> et <strong>Informatique</strong>. 
            Ressources pédagogiques pour étudiants universitaires.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/dashboard">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <BookOpen className="mr-2 h-5 w-5" />
                Parcourir les UEs
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white">
                Inscription gratuite
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">1000+</div>
              <div className="text-muted-foreground">Corrigés disponibles</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Unités d'enseignement</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">100%</div>
              <div className="text-muted-foreground">Gratuit</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
              <div className="text-muted-foreground">Accessible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <header className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir Le Koro ?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une plateforme conçue par et pour les étudiants universitaires en sciences exactes
            </p>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all">
              <CardContent className="pt-6">
                <Calculator className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Mathématiques</h3>
                <p className="text-muted-foreground">
                  Corrigés détaillés : Algèbre linéaire, Analyse, Probabilités, Statistiques, Optimisation
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all">
              <CardContent className="pt-6">
                <Code className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Informatique</h3>
                <p className="text-muted-foreground">
                  Algorithmique, Programmation, Bases de données, Réseaux, Systèmes d'exploitation
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all">
              <CardContent className="pt-6">
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Organisation</h3>
                <p className="text-muted-foreground">
                  Ressources classées par UFR, département, UE, type (TD/Examen) et année académique
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-[var(--shadow-elegant)] transition-all">
              <CardContent className="pt-6">
                <GraduationCap className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Réussite</h3>
                <p className="text-muted-foreground">
                  Optimisez votre préparation aux examens et maximisez vos chances de succès académique
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="container">
          <header className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-muted-foreground text-lg">
              Accédez aux corrigés en 3 étapes simples
            </p>
          </header>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Inscription gratuite</h3>
              <p className="text-muted-foreground">
                Créez votre compte en quelques secondes avec votre email universitaire
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Sélectionnez votre UE</h3>
              <p className="text-muted-foreground">
                Parcourez les unités d'enseignement de votre département
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Consultez les corrigés</h3>
              <p className="text-muted-foreground">
                Accédez instantanément aux solutions détaillées des exercices et examens
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à réussir vos examens ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Rejoignez la communauté d'étudiants qui utilisent Le Koro pour exceller dans leurs études universitaires
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Créer mon compte gratuitement
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
