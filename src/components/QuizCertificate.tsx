'use client';

import { useState, useRef } from 'react';

interface QuizCertificateProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  language: 'en' | 'fr';
  onClose: () => void;
}

export default function QuizCertificate({ 
  score, 
  correctAnswers, 
  totalQuestions, 
  language,
  onClose 
}: QuizCertificateProps) {
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';

  const downloadCertificate = async () => {
    if (!userName.trim()) {
      alert(language === 'en' ? 'Please enter your name' : 'Veuillez entrer votre nom');
      return;
    }

    setIsGenerating(true);

    try {
      // Use html2canvas if available, otherwise fallback
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        const element = certificateRef.current;
        if (!element) return;

        const canvas = await (window as any).html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `HIV-Education-Certificate-${userName.replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        // Fallback: open print dialog
        window.print();
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      alert(language === 'en' ? 'Error generating certificate' : 'Erreur lors de la génération du certificat');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareWhatsApp = () => {
    const message = language === 'en'
      ? `I completed the HIV Education Quiz and scored ${score} points (${percentage}%)! Test your knowledge at Sans Capote app.`
      : `J'ai terminé le Quiz d'Éducation VIH et j'ai obtenu ${score} points (${percentage}%)! Testez vos connaissances sur l'application Sans Capote.`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareSMS = () => {
    const message = language === 'en'
      ? `I scored ${score} points on the HIV Education Quiz! ${percentage}% correct. Learn more about HIV at Sans Capote.`
      : `J'ai obtenu ${score} points au Quiz d'Éducation VIH! ${percentage}% correct. Apprenez-en plus sur le VIH à Sans Capote.`;
    
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-center">
        <h2 className="text-lg font-bold text-zinc-100">
          {language === 'en' ? '🎉 Quiz Complete!' : '🎉 Quiz Terminé!'}
        </h2>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
            <p className="text-sm font-bold text-emerald-300">{score}</p>
            <p className="text-[9px] text-zinc-400">
              {language === 'en' ? 'Points' : 'Points'}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
            <p className="text-sm font-bold text-emerald-300">{correctAnswers}/{totalQuestions}</p>
            <p className="text-[9px] text-zinc-400">
              {language === 'en' ? 'Correct' : 'Correctes'}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
            <p className="text-sm font-bold text-emerald-300">{percentage}%</p>
            <p className="text-[9px] text-zinc-400">
              {language === 'en' ? 'Accuracy' : 'Précision'}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3">
          <p className="text-[11px] font-semibold text-zinc-300">
            {language === 'en' ? 'Grade:' : 'Note:'} <span className="text-lg font-bold text-emerald-300">{grade}</span>
          </p>
          <p className="text-[10px] text-zinc-400">
            {language === 'en' 
              ? percentage >= 80 
                ? '🏆 Excellent knowledge!'
                : percentage >= 60
                ? '👍 Good job!'
                : '📚 Keep studying!'
              : percentage >= 80
                ? '🏆 Excellente connaissance!'
                : percentage >= 60
                ? '👍 Bon travail!'
                : '📚 Continuez à étudier!'
            }
          </p>
        </div>
      </div>

      {/* Certificate Generation */}
      <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
        <h3 className="text-sm font-semibold text-zinc-100">
          {language === 'en' ? '🎓 Get Your Certificate' : '🎓 Obtenez Votre Certificat'}
        </h3>
        
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={language === 'en' ? 'Enter your name' : 'Entrez votre nom'}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-[11px] font-semibold text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-700 focus:outline-none"
        />

        <button
          onClick={downloadCertificate}
          disabled={isGenerating || !userName.trim()}
          className="w-full rounded-lg border border-emerald-700 bg-emerald-900 px-4 py-3 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-800 disabled:opacity-50 transition-colors"
        >
          {isGenerating 
            ? '⏳ Generating...' 
            : `📥 ${language === 'en' ? 'Download Certificate' : 'Télécharger Certificat'}`
          }
        </button>
      </div>

      {/* Certificate Preview */}
      <div 
        ref={certificateRef}
        className="space-y-4 rounded-2xl border-2 border-emerald-800 bg-zinc-900 px-6 py-6"
      >
        <div className="space-y-3 text-center">
          <div className="text-3xl">🎓</div>
          
          <h1 className="text-xl font-bold text-zinc-100">
            {language === 'en' ? 'Certificate of Completion' : 'Certificat de Réussite'}
          </h1>
          
          <p className="text-[11px] text-zinc-400">
            {language === 'en' ? 'This certifies that' : 'Ceci certifie que'}
          </p>
          
          <p className="border-b border-zinc-700 py-2 text-lg font-bold text-emerald-300">
            {userName || (language === 'en' ? 'Your Name' : 'Votre Nom')}
          </p>
          
          <p className="text-[10px] text-zinc-400">
            {language === 'en' 
              ? 'has successfully completed the HIV Education Quiz, demonstrating knowledge of HIV transmission, prevention, treatment, and stigma reduction.'
              : 'a complété avec succès le Quiz d\'Éducation VIH, démontrant des connaissances sur la transmission, la prévention, le traitement et la réduction de la stigmatisation du VIH.'
            }
          </p>
          
          <div className="grid grid-cols-3 gap-3 pt-3">
            <div>
              <p className="text-sm font-bold text-emerald-300">{score}</p>
              <p className="text-[9px] text-zinc-500">{language === 'en' ? 'Points' : 'Points'}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">{percentage}%</p>
              <p className="text-[9px] text-zinc-500">{language === 'en' ? 'Score' : 'Score'}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">{grade}</p>
              <p className="text-[9px] text-zinc-500">{language === 'en' ? 'Grade' : 'Note'}</p>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-3">
            <p className="text-[9px] text-zinc-500">
              {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-[8px] text-zinc-600 mt-2">
              {language === 'en' 
                ? 'Powered by Sans Capote • ElevenLabs • Google Gemini'
                : 'Propulsé par Sans Capote • ElevenLabs • Google Gemini'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
        <h3 className="text-sm font-semibold text-zinc-100">
          {language === 'en' ? '📱 Share Your Achievement' : '📱 Partagez Votre Réussite'}
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={shareWhatsApp}
            className="rounded-lg border border-emerald-700 bg-emerald-900 px-3 py-2 text-[10px] font-semibold text-emerald-100 hover:bg-emerald-800 transition-colors"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={shareSMS}
            className="rounded-lg border border-blue-700 bg-blue-900 px-3 py-2 text-[10px] font-semibold text-blue-100 hover:bg-blue-800 transition-colors"
          >
            📱 SMS
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            {language === 'en' ? '← Back' : '← Retour'}
          </button>
        </div>
      </div>
    </div>
  );
}
