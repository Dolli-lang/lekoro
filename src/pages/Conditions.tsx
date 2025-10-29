import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Conditions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 max-w-4xl prose prose-slate">
        <h1>Conditions d'Utilisation</h1>
        <p className="lead">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <h2>Utilisation du service</h2>
        <p>Le Koro est un service gratuit destiné aux étudiants. Les corrigés sont consultables uniquement en ligne.</p>
        
        <h2>Propriété intellectuelle</h2>
        <p>Tous les corrigés sont protégés par le droit d'auteur. Toute reproduction ou distribution est interdite.</p>
        
        <h2>Responsabilités</h2>
        <p>Nous mettons tout en œuvre pour garantir l'exactitude des corrigés, mais ne pouvons être tenus responsables d'éventuelles erreurs.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Conditions;