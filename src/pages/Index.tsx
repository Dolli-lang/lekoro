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
        className="relative py-28 md:py-40 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-[hsl(280_70%_50%/0.9)]" />
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -right-20 w-96 h-96 bg-[hsl(280_70%_65%)]/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container relative z-10 text-center text-primary-foreground">
          <span className="inline-block px-5 py-2.5 mb-8 text-sm font-semibold bg-white/10 glass rounded-full border border-white/20 animate-bounce-in">
            🎓 Plateforme Académique Universitaire
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 animate-slide-up">
            Réussissez vos études avec<br />
            <span className="bg-gradient-to-r from-accent via-yellow-300 to-accent bg-clip-text text-transparent animate-text-gradient">
              Le Koro
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-95 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Accédez à des milliers de corrigés d'exercices et d'examens en 
            <strong> Mathématiques</strong> et <strong>Informatique</strong>
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/dashboard">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground hover-lift text-lg px-8 py-6 animate-glow-pulse">
                <BookOpen className="mr-2 h-5 w-5" />
                Parcourir les UEs
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="outline" className="glass border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6">
                Inscription gratuite
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/80 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-b relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "1000+", label: "Corrigés disponibles", delay: "0s" },
              { value: "50+", label: "Unités d'enseignement", delay: "0.1s" },
              { value: "100%", label: "Gratuit", delay: "0.2s" },
              { value: "24/7", label: "Accessible", delay: "0.3s" },
            ].map((stat, i) => (
              <div key={i} className="animate-slide-up" style={{ animationDelay: stat.delay }}>
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="container">
          <header className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-primary/10 text-primary rounded-full">
              ✨ Fonctionnalités
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Pourquoi choisir <span className="text-primary">Le Koro</span> ?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une plateforme conçue par et pour les étudiants universitaires
            </p>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Calculator, title: "Mathématiques", desc: "Algèbre, Analyse, Probabilités, Statistiques", color: "from-blue-500 to-cyan-400" },
              { icon: Code, title: "Informatique", desc: "Algorithmique, Programmation, BDD, Réseaux", color: "from-primary to-[hsl(280_70%_65%)]" },
              { icon: BookOpen, title: "Organisation", desc: "Classement par UFR, département et UE", color: "from-accent to-yellow-400" },
              { icon: GraduationCap, title: "Réussite", desc: "Maximisez vos chances de succès", color: "from-teal to-emerald-400" },
            ].map((feature, i) => (
              <Card key={i} className="hover-lift card-gradient bg-card border-0 shadow-lg group animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="pt-8 pb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-background relative">
        <div className="container">
          <header className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-accent/10 text-accent rounded-full">
              🚀 Simple & Rapide
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-muted-foreground text-lg">
              Accédez aux corrigés en 3 étapes simples
            </p>
          </header>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
            
            {[
              { icon: Users, title: "1. Inscription gratuite", desc: "Créez votre compte en quelques secondes", gradient: "from-primary to-[hsl(280_70%_65%)]" },
              { icon: FileText, title: "2. Sélectionnez votre UE", desc: "Parcourez les unités d'enseignement", gradient: "from-accent to-yellow-400" },
              { icon: CheckCircle, title: "3. Consultez les corrigés", desc: "Accédez aux solutions détaillées", gradient: "from-teal to-emerald-400" },
            ].map((step, i) => (
              <div key={i} className="text-center relative animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-6 shadow-xl hover:scale-110 transition-transform relative z-10`}>
                  <step.icon className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(280_70%_55%)] to-accent animate-gradient" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container text-center relative z-10 text-primary-foreground">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 animate-slide-up">
            Prêt à réussir vos examens ?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-95 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Rejoignez la communauté d'étudiants qui utilisent Le Koro pour exceller
          </p>
          <Link to="/auth?mode=signup" className="animate-slide-up inline-block" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-7 shadow-2xl hover-lift font-bold">
              <GraduationCap className="mr-2 h-6 w-6" />
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
