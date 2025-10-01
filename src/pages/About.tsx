import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, Target, Heart } from "lucide-react";

const About = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setUser(data));
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-5xl font-serif font-bold mb-8">Sobre Nós</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              O Jornal Digital é um portal de notícias comprometido em trazer informação de qualidade, 
              confiável e atualizada para você. Fundado em 2024, nossa missão é manter nossos leitores 
              bem informados sobre os acontecimentos mais importantes do Brasil e do mundo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 border border-border rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Nossa Missão</h3>
              <p className="text-muted-foreground">
                Informar com precisão e imparcialidade, sempre comprometidos com a verdade.
              </p>
            </div>

            <div className="text-center p-6 border border-border rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Nossos Valores</h3>
              <p className="text-muted-foreground">
                Integridade, transparência e compromisso com o jornalismo de qualidade.
              </p>
            </div>

            <div className="text-center p-6 border border-border rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Nossa Equipe</h3>
              <p className="text-muted-foreground">
                Profissionais experientes e dedicados a trazer as melhores notícias.
              </p>
            </div>
          </div>

          <div className="bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-serif font-bold mb-4">Nossas Editorias</h2>
            <p className="text-muted-foreground mb-4">
              Cobrimos as principais áreas de interesse do público brasileiro:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Política Nacional e Internacional
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Economia e Negócios
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Cultura e Entretenimento
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Esportes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Tecnologia
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Notícias Internacionais
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
