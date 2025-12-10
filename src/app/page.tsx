"use client";

import { MessageCircle, Map, BookOpen, AlertCircle, Sparkles, Shield, Users } from "lucide-react";
import { useSettings } from "./settings-provider";
import { strings, t } from "../i18n/strings";
import { useState, useEffect } from "react";

export default function Home() {
  const { language, discreetMode } = useSettings();

  // Testimonial data
  const testimonials = [
    {
      quote: "And I thought antibiotics cured HIV.",
      author: "Caleb"
    },
    {
      quote: "Maybe it won't be so hard to talk about living with HIV someday",
      author: "Amaka"
    },
    {
      quote: "People need SexED in Africa and we need to stop being scared of bringing it up.",
      author: "Chiagozie B."
    },
    {
      quote: "The rates at which people have unprotected sex, I think this app can help change the motion.",
      author: "Timilehin"
    },
    {
      quote: "Never been quizzed before on HIV. The certificate thing is cool.",
      author: "Fareeda"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonialsPerSlide = 3;
  const totalSlides = Math.ceil(testimonials.length / testimonialsPerSlide);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] via-[#FFF] to-[#F0F4FF]">
      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
        {/* Modern Hero Section - Split Layout */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Left: Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a1a2e] leading-tight">
                {discreetMode ? (
                  language === 'en' ? (
                    <>
                      Take Control of Your <span className="text-[#008080]">Personal Health</span><br />
                      with <span className="text-[#008080]">Private Wellness Support</span>
                    </>
                  ) : language === 'fr' ? (
                    <>
                      Prenez le Contrôle de Votre <span className="text-[#008080]">Santé Personnelle</span><br />
                      avec <span className="text-[#008080]">Soutien au Bien-être Privé</span>
                    </>
                  ) : (
                    <>
                      Dhibiti <span className="text-[#008080]">Afya Yako Binafsi</span><br />
                      na <span className="text-[#008080]">Msaada wa Faragha wa Ustawi</span>
                    </>
                  )
                ) : (
                  language === 'en' ? (
                    <>
                      Take Charge of Your <span className="text-[#008080]">Sexual Health</span> Now<br />
                      and Streamline Your <span className="text-[#008080]">Healthcare Journey</span>
                    </>
                  ) : language === 'fr' ? (
                    <>
                      Prenez le Contrôle de Votre <span className="text-[#008080]">Santé Sexuelle</span> Maintenant<br />
                      et Rationalisez Votre <span className="text-[#008080]">Parcours de Santé</span>
                    </>
                  ) : (
                    <>
                      Dhibiti <span className="text-[#008080]">Afya Yako ya Kingono</span> Sasa<br />
                      na Rahisisha <span className="text-[#008080]">Safari Yako ya Afya</span>
                    </>
                  )
                )}
              </h1>
              
              <p className="text-sm sm:text-base text-[#64748b] leading-relaxed max-w-xl">
                {discreetMode ? (
                  language === 'en'
                    ? 'Get personalized wellness guidance with complete privacy. AI-powered support for your health journey, available 24/7.'
                    : language === 'fr'
                    ? 'Obtenez des conseils de bien-être personnalisés en toute confidentialité. Soutien alimenté par IA pour votre parcours de santé, disponible 24/7.'
                    : 'Pata mwongozo wa ustawi wa kibinafsi na faragha kamili. Msaada unaotumia AI kwa safari yako ya afya, inapatikana 24/7.'
                ) : (
                  language === 'en'
                    ? 'Leverage tailored digital strategies to improve engagement while supporting your sexual health with Sans Capote\'s private, AI-powered guidance.'
                    : language === 'fr'
                    ? 'Profitez de stratégies numériques sur mesure pour améliorer l\'engagement tout en soutenant votre santé sexuelle avec les conseils privés et alimentés par l\'IA de Sans Capote.'
                    : 'Tumia mikakati ya kidijitali iliyoratibiwa kuboresha ushirikiano wakati ukisaidia afya yako ya kingono na mwongozo wa faragha wa AI wa Sans Capote.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/guide"
                className="inline-flex items-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#007070] transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-4 h-4" />
                {language === 'en' ? 'Get Started' : language === 'fr' ? 'Commencer' : 'Anza'}
              </a>
              <a
                href="/resources"
                className="inline-flex items-center gap-2 bg-white text-[#008080] border-2 border-[#008080] px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#F8FAFF] transition-all shadow-md hover:shadow-lg"
              >
                {language === 'en' ? 'Learn More' : language === 'fr' ? 'En Savoir Plus' : 'Jifunze Zaidi'}
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10b981]" />
                <span className="text-xs font-medium text-[#64748b]">
                  {language === 'en' ? '100% Private' : language === 'fr' ? '100% Privé' : '100% ya Faragha'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#10b981]" />
                <span className="text-xs font-medium text-[#64748b]">
                  {language === 'en' ? '24/7 Support' : language === 'fr' ? 'Support 24/7' : 'Msaada 24/7'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#10b981]" />
                <span className="text-xs font-medium text-[#64748b]">
                  {language === 'en' ? 'AI-Powered' : language === 'fr' ? 'Propulsé par IA' : 'Inatumia AI'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Floating Cards Visual */}
          <div className="relative hidden lg:block">
            <div className="relative h-[600px]">
              {/* Main Feature Card - Floating */}
              <div className="absolute top-0 right-0 w-80 bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-300 border border-[#e2e8f0]">
                <div className="flex items-start gap-4 mb-4">
                  <div className="rounded-2xl bg-gradient-to-br from-[#008080] to-[#007070] p-3">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1a1a2e] mb-1">
                      {discreetMode 
                        ? (language === 'en' ? 'Personal Advisor' : language === 'fr' ? 'Conseiller Personnel' : 'Mshauri Binafsi')
                        : (language === 'en' ? 'AI Health Guide' : language === 'fr' ? 'Guide Santé IA' : 'Mwongozo wa AI wa Afya')}
                    </h3>
                    <p className="text-sm text-[#64748b]">
                      {language === 'en' ? 'Private consultations' : language === 'fr' ? 'Consultations privées' : 'Mashauriano ya faragha'}
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-[#F0F4FF] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#008080] to-[#10b981] w-3/4 rounded-full"></div>
                </div>
              </div>

              {/* HIV Services Navigator Card */}
              <div className="absolute top-32 left-0 w-72 bg-white rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-[#e2e8f0]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#64748b]">
                      {discreetMode
                        ? (language === 'en' ? 'Care Finder' : language === 'fr' ? 'Trouver Soins' : 'Kipokezi cha Huduma')
                        : (language === 'en' ? 'HIV Services Navigator' : language === 'fr' ? 'Navigateur Services' : 'Kiongozi cha Huduma za UKIMWI')}
                    </span>
                    <span className="text-xs bg-[#D4F4DD] text-[#059669] px-3 py-1 rounded-full font-semibold">
                      {language === 'en' ? 'Active' : language === 'fr' ? 'Actif' : 'Inaendelea'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] p-3">
                      <Map className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#1a1a2e]">
                        {language === 'en' ? 'Find Care' : language === 'fr' ? 'Trouver Soins' : 'Tafuta Huduma'}
                      </p>
                      <p className="text-xs text-[#64748b]">
                        {language === 'en' ? 'Clinics near you' : language === 'fr' ? 'Cliniques près de vous' : 'Kliniki karibu nawe'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val, i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full ${i < 3 ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'}`}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Schedule Card */}
              <div className="absolute bottom-20 right-12 w-64 bg-white rounded-3xl shadow-xl p-5 transform hover:scale-105 transition-all duration-300 border border-[#e2e8f0]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#EEF2FF] p-3">
                    <AlertCircle className="w-5 h-5 text-[#008080]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1a1a2e]">
                      {language === 'en' ? 'Crisis Support' : 'Support d\'Urgence'}
                    </p>
                    <p className="text-xs text-[#64748b]">
                      {language === 'en' ? 'Available 24/7' : 'Disponible 24/7'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-40 right-40 w-20 h-20 bg-gradient-to-br from-[#008080]/10 to-[#10b981]/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-40 left-20 w-32 h-32 bg-gradient-to-br from-[#8B5CF6]/10 to-[#008080]/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
              {discreetMode ? (
                language === 'en' ? (
                  <>Your <span className="text-[#008080]">wellness tools</span> in one place</>
                ) : language === 'fr' ? (
                  <>Vos <span className="text-[#008080]">outils de bien-être</span> en un seul endroit</>
                ) : (
                  <>Zana zako za <span className="text-[#008080]">ustawi</span> mahali pamoja</>
                )
              ) : (
                language === 'en' ? (
                  <>How we're <span className="text-[#008080]">transforming sexual health</span> for you</>
                ) : language === 'fr' ? (
                  <>Comment nous <span className="text-[#008080]">transformons la santé sexuelle</span> pour vous</>
                ) : (
                  <>Jinsi tunavyo<span className="text-[#008080]">badilisha afya ya kingono</span> kwa ajili yako</>
                )
              )}
            </h2>
            <p className="text-sm text-[#64748b] max-w-2xl mx-auto">
              {discreetMode ? (
                language === 'en'
                  ? 'Comprehensive wellness tools designed with your privacy and well-being in mind'
                  : language === 'fr'
                  ? 'Des outils de bien-être complets conçus en pensant à votre vie privée et à votre bien-être'
                  : 'Zana za ustawi kamili zilizoundwa kwa kuzingatia faragha na ustawi wako'
              ) : (
                language === 'en' 
                  ? 'Comprehensive sexual health tools designed with your privacy and well-being in mind'
                  : language === 'fr'
                  ? 'Des outils de santé sexuelle complets conçus en pensant à votre vie privée et à votre bien-être'
                  : 'Zana za afya ya kingono kamili zilizoundwa kwa kuzingatia faragha na ustawi wako'
              )}
            </p>
          </div>

          {/* Primary Card - AI Guide */}
          <a
            href="/guide"
            className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-[#e2e8f0] hover:border-[#008080]/30"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-[#008080] to-[#007070] p-4 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-bold text-[#1a1a2e] group-hover:text-[#008080] transition-colors">
                  {discreetMode
                    ? (language === 'en' ? 'Personal Health Advisor' : 'Conseiller de Santé Personnel')
                    : t(strings.home.cards.guide.title, language)}
                </h3>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {discreetMode
                    ? (language === 'en' ? 'Ask questions in private. Get clear, compassionate answers about your health.' : 'Posez vos questions en privé. Recevez des réponses claires et compatissantes sur votre santé.')
                    : t(strings.home.cards.guide.body, language)}
                </p>
              </div>
              <div className="text-[#008080] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2">
                <span className="text-2xl">→</span>
              </div>
            </div>
          </a>

          {/* Secondary Features Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Navigator Card */}
            <a
              href="/navigator"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-[#e2e8f0] hover:border-[#10b981]/30 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] p-3 w-fit shadow-md">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#1a1a2e] group-hover:text-[#10b981] transition-colors">
                    {discreetMode
                      ? (language === 'en' ? 'Healthcare Directory' : 'Annuaire de Soins')
                      : t(strings.home.cards.navigator.title, language)}
                  </h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    {discreetMode
                      ? (language === 'en' 
                          ? 'Find healthcare services and clinics in your area'
                          : 'Trouvez des services de santé et des cliniques dans votre région')
                      : (language === 'en' 
                          ? 'Find HIV testing, PrEP, PEP, and support services near you'
                          : 'Trouvez des tests VIH, PrEP, PEP et services de soutien près de chez vous')}
                  </p>
                </div>
              </div>
            </a>

            {/* Resources Card */}
            <a
              href="/resources"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-[#e2e8f0] hover:border-[#F59E0B]/30 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] p-3 w-fit shadow-md">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#1a1a2e] group-hover:text-[#F59E0B] transition-colors">
                    {discreetMode
                      ? (language === 'en' ? 'Health Library' : 'Bibliothèque Santé')
                      : t(strings.home.cards.resources.title, language)}
                  </h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    {discreetMode
                      ? (language === 'en'
                          ? 'Interactive quizzes, wellness content, and health resources'
                          : 'Quiz interactifs, contenu bien-être et ressources santé')
                      : (language === 'en'
                          ? 'Interactive quizzes, educational content, and community resources'
                          : 'Quiz interactifs, contenu éducatif et ressources communautaires')}
                  </p>
                </div>
              </div>
            </a>

            {/* Crisis Card */}
            <a
              href="/crisis"
              className="group bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-[#EF4444] hover:-translate-y-1 text-white"
            >
              <div className="space-y-3">
                <div className="rounded-xl bg-white/20 backdrop-blur-sm p-3 w-fit">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">
                      {discreetMode
                        ? (language === 'en' ? 'Urgent Support' : 'Soutien Urgent')
                        : t(strings.home.cards.crisis.title, language)}
                    </h3>
                    <span className="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold">
                      24/7
                    </span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed">
                    {discreetMode
                      ? (language === 'en'
                          ? 'Immediate help for urgent health concerns. Available anytime.'
                          : 'Aide immédiate pour des préoccupations de santé urgentes. Disponible à tout moment.')
                      : (language === 'en'
                          ? 'Immediate guidance for recent exposure. Get PEP/PrEP info now.'
                          : 'Conseils immédiats pour une exposition récente. Obtenez des infos PEP/PrEP maintenant.')}
                  </p>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-12 max-w-6xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">
              {language === 'en' ? 'What People Are Saying' : language === 'fr' ? 'Ce Que Disent Les Gens' : 'Watu Wanasema Nini'}
            </h2>
            <p className="text-sm text-[#64748b]">
              {language === 'en' ? 'Real voices from our community' : language === 'fr' ? 'Vraies voix de notre communauté' : 'Sauti halisi kutoka jamii yetu'}
            </p>
          </div>

          {/* Slideshow with light background */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500" key={currentSlide}>
              {testimonials
                .slice(currentSlide * testimonialsPerSlide, currentSlide * testimonialsPerSlide + testimonialsPerSlide)
                .map((testimonial, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4 p-6"
                >
                  {/* Icon placeholder - using initials with teal gradient */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#008080] to-[#006666] flex items-center justify-center shadow-md">
                    <span className="text-2xl font-bold text-white">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>

                  {/* Author name */}
                  <h3 className="text-gray-900 font-semibold text-lg">
                    {testimonial.author}
                  </h3>

                  {/* Quote */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-[#008080] w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
