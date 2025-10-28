import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Comment accéder aux corrigés ?",
      answer: "Après inscription gratuite, parcourez les UEs, sélectionnez le type (TD ou Examen) et l'année souhaitée. Vous pourrez consulter les corrigés directement en ligne."
    },
    {
      question: "Puis-je télécharger les corrigés ?",
      answer: "Non, les corrigés sont consultables uniquement en ligne pour protéger les droits d'auteur et garantir la qualité du contenu."
    },
    {
      question: "Les corrigés sont-ils vérifiés ?",
      answer: "Oui, tous les corrigés sont vérifiés par notre équipe avant publication pour garantir leur exactitude."
    },
    {
      question: "Comment devenir administrateur ?",
      answer: "Le statut d'administrateur est réservé à l'équipe pédagogique. Contactez-nous si vous souhaitez contribuer."
    },
    {
      question: "L'inscription est-elle vraiment gratuite ?",
      answer: "Oui, MathInfo Corrigés est totalement gratuit pour tous les étudiants. Notre mission est de faciliter l'accès aux ressources pédagogiques."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Foire Aux Questions</h1>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
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