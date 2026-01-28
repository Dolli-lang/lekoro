import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Conditions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Conditions d'Utilisation | Le Koro - Plateforme Académique</title>
        <meta name="description" content="Conditions générales d'utilisation de Le Koro, plateforme universitaire de ressources pédagogiques en Mathématiques et Informatique." />
        <link rel="canonical" href="https://lekoro.lovable.app/conditions" />
      </Helmet>
      <Navbar />
      <main className="flex-1 container py-12 max-w-4xl prose prose-slate dark:prose-invert">
        <h1>Conditions Générales d'Utilisation</h1>
        <p className="lead text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <section className="mt-8">
          <h2>1. Objet et Acceptation</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation 
            de la plateforme Le Koro, service éducatif dédié à la diffusion de ressources pédagogiques 
            universitaires en Mathématiques et Informatique.
          </p>
          <p>
            L'inscription et l'utilisation du service impliquent l'acceptation pleine et entière 
            des présentes conditions.
          </p>
        </section>
        
        <section className="mt-8">
          <h2>2. Description du Service</h2>
          <p>
            Le Koro est une plateforme académique proposant :
          </p>
          <ul>
            <li>Des corrigés d'exercices de travaux dirigés (TD)</li>
            <li>Des corrigés d'examens universitaires</li>
            <li>Des ressources pédagogiques classées par UFR, département et Unité d'Enseignement (UE)</li>
          </ul>
          <p>
            Le service est gratuit et accessible à tout étudiant après inscription.
          </p>
        </section>
        
        <section className="mt-8">
          <h2>3. Propriété Intellectuelle</h2>
          <p>
            L'ensemble des contenus présents sur Le Koro (corrigés, textes, images, logos) sont protégés 
            par le droit d'auteur et la propriété intellectuelle. Toute reproduction, distribution ou 
            modification sans autorisation préalable est strictement interdite.
          </p>
          <p>
            Les corrigés sont destinés à un usage personnel et pédagogique uniquement.
          </p>
        </section>
        
        <section className="mt-8">
          <h2>4. Obligations de l'Utilisateur</h2>
          <p>L'utilisateur s'engage à :</p>
          <ul>
            <li>Fournir des informations exactes lors de l'inscription</li>
            <li>Utiliser le service conformément à sa finalité pédagogique</li>
            <li>Ne pas partager ses identifiants de connexion</li>
            <li>Respecter les droits de propriété intellectuelle</li>
            <li>Ne pas tenter de contourner les mesures de sécurité</li>
          </ul>
        </section>
        
        <section className="mt-8">
          <h2>5. Limitation de Responsabilité</h2>
          <p>
            Bien que nous nous efforcions de garantir l'exactitude des corrigés proposés, 
            Le Koro ne peut être tenu responsable d'éventuelles erreurs ou omissions. 
            Les corrigés sont fournis à titre indicatif et ne sauraient se substituer 
            à l'enseignement dispensé dans les établissements universitaires.
          </p>
        </section>

        <section className="mt-8">
          <h2>6. Modification des CGU</h2>
          <p>
            Le Koro se réserve le droit de modifier les présentes conditions à tout moment. 
            Les utilisateurs seront informés de toute modification substantielle.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Conditions;
