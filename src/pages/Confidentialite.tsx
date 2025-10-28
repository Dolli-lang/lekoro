import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Confidentialite = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 max-w-4xl prose prose-slate">
        <h1>Politique de Confidentialité</h1>
        <p className="lead">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <h2>Collecte des données</h2>
        <p>Nous collectons uniquement les informations nécessaires au fonctionnement du service : nom, email, et historique de consultation.</p>
        
        <h2>Utilisation des données</h2>
        <p>Vos données sont utilisées exclusivement pour vous fournir l'accès aux corrigés et améliorer nos services.</p>
        
        <h2>Protection des données</h2>
        <p>Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Confidentialite;