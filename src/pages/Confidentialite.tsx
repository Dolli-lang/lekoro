import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Confidentialite = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Politique de Confidentialité | Le Koro - Plateforme Académique</title>
        <meta name="description" content="Politique de confidentialité de Le Koro. Découvrez comment nous protégeons vos données personnelles sur notre plateforme universitaire de corrigés." />
        <link rel="canonical" href="https://lekoro.lovable.app/confidentialite" />
      </Helmet>
      <Navbar />
      <main className="flex-1 container py-12 max-w-4xl prose prose-slate dark:prose-invert">
        <h1>Politique de Confidentialité</h1>
        <p className="lead text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <section className="mt-8">
          <h2>1. Collecte des Données Personnelles</h2>
          <p>
            Dans le cadre de notre mission pédagogique, Le Koro collecte uniquement les informations 
            strictement nécessaires au fonctionnement du service éducatif :
          </p>
          <ul>
            <li><strong>Données d'identification :</strong> nom complet, adresse email universitaire</li>
            <li><strong>Données académiques :</strong> UFR, département d'études</li>
            <li><strong>Données d'usage :</strong> historique de consultation des corrigés</li>
          </ul>
        </section>
        
        <section className="mt-8">
          <h2>2. Finalité du Traitement</h2>
          <p>
            Vos données sont utilisées exclusivement pour :
          </p>
          <ul>
            <li>Vous fournir un accès personnalisé aux ressources pédagogiques</li>
            <li>Améliorer la qualité de nos contenus académiques</li>
            <li>Assurer le suivi de votre progression</li>
            <li>Communiquer des informations relatives au service</li>
          </ul>
        </section>
        
        <section className="mt-8">
          <h2>3. Protection et Sécurité des Données</h2>
          <p>
            Le Koro s'engage à protéger vos données conformément aux normes de sécurité en vigueur :
          </p>
          <ul>
            <li>Chiffrement des données sensibles</li>
            <li>Stockage sécurisé sur des serveurs protégés</li>
            <li>Accès restreint aux données personnelles</li>
            <li>Aucun partage avec des tiers commerciaux</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>4. Vos Droits</h2>
          <p>
            Conformément à la réglementation sur la protection des données, vous disposez des droits suivants :
          </p>
          <ul>
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification des informations inexactes</li>
            <li>Droit à l'effacement de vos données</li>
            <li>Droit à la portabilité de vos données</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous via le formulaire de contact de la plateforme.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Confidentialite;
