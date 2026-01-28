import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Qu'est-ce que Le Koro ?",
      answer: "Le Koro est une plateforme académique dédiée aux étudiants en Mathématiques et Informatique. Elle offre un accès gratuit à des milliers de corrigés d'exercices et d'examens universitaires, classés par UFR, département et Unité d'Enseignement."
    },
    {
      question: "Comment accéder aux corrigés ?",
      answer: "Après inscription gratuite, connectez-vous à votre espace personnel. Naviguez ensuite vers l'onglet 'UEs & Corrigés', sélectionnez votre département, l'UE concernée, le type de document (TD ou Examen) et l'année académique. Les corrigés sont consultables directement en ligne."
    },
    {
      question: "Puis-je télécharger les corrigés ?",
      answer: "Les corrigés sont consultables exclusivement en ligne afin de protéger les droits d'auteur et de garantir l'intégrité du contenu pédagogique. Cette mesure permet également d'assurer que les utilisateurs accèdent toujours à la version la plus récente et corrigée des documents."
    },
    {
      question: "Les corrigés sont-ils vérifiés ?",
      answer: "Oui, tous les corrigés sont soumis à un processus de vérification rigoureux avant publication. Notre équipe pédagogique s'assure de l'exactitude des solutions proposées et de leur conformité avec les programmes universitaires."
    },
    {
      question: "Comment puis-je signaler une erreur dans un corrigé ?",
      answer: "Si vous identifiez une erreur ou une imprécision, utilisez le bouton 'Contacter l'admin' disponible dans votre tableau de bord. Précisez l'UE, l'exercice concerné et la nature de l'erreur. Votre contribution améliore la qualité de nos ressources."
    },
    {
      question: "L'inscription est-elle vraiment gratuite ?",
      answer: "Absolument. Le Koro est un service entièrement gratuit, conçu pour démocratiser l'accès aux ressources pédagogiques universitaires. Notre mission est de faciliter la réussite académique de tous les étudiants."
    },
    {
      question: "Comment devenir contributeur ?",
      answer: "Si vous êtes enseignant, doctorant ou professionnel et souhaitez contribuer à l'enrichissement de notre base de corrigés, contactez-nous via le formulaire de contact. Nous étudions chaque candidature avec attention."
    },
    {
      question: "Mes données personnelles sont-elles protégées ?",
      answer: "La protection de vos données est notre priorité. Consultez notre Politique de Confidentialité pour connaître en détail les mesures de sécurité mises en place et vos droits concernant vos informations personnelles."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>FAQ | Le Koro - Questions Fréquentes sur la Plateforme Académique</title>
        <meta name="description" content="Trouvez les réponses à vos questions sur Le Koro : accès aux corrigés, inscription gratuite, protection des données et contribution à la plateforme universitaire." />
        <link rel="canonical" href="https://lekoro.lovable.app/faq" />
      </Helmet>
      <Navbar />
      
      <main className="flex-1 container py-12 max-w-4xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-4">Foire Aux Questions</h1>
          <p className="text-muted-foreground text-lg">
            Retrouvez les réponses aux questions les plus fréquemment posées sur notre plateforme académique.
          </p>
        </header>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border rounded-lg px-4 bg-card shadow-sm"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
