import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusCircle, ListChecks, BarChart3, Sparkles, Shield, Zap } from 'lucide-react';
import { getSurveys, getResponses } from '@/lib/storage';
import { useEffect, useState } from 'react';

export default function Index() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ surveys: 0, responses: 0 });

  useEffect(() => {
    const surveys = getSurveys();
    const responses = getResponses();
    setStats({ surveys: surveys.length, responses: responses.length });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <ListChecks className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">SurveySense</h1>
          </div>
          <Button onClick={() => navigate('/surveys')} variant="outline" size="sm" className="hidden sm:inline-flex border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
            Mes Questionnaires
          </Button>
          <Button onClick={() => navigate('/surveys')} variant="outline" size="sm" className="sm:hidden px-2 border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
            <ListChecks className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-full text-sm font-medium text-blue-300">
                <Sparkles className="h-4 w-4" />
                Nouvelle génération de questionnaires
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Créez des questionnaires
                </span>
                <br />
                <span className="text-gray-100">professionnels en minutes</span>
              </h2>
            </div>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
              Une solution élégante et puissante pour créer, partager et analyser vos enquêtes. 
              Vos données restent privées et sécurisées dans votre navigateur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Créer un questionnaire
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/surveys')}
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 w-full sm:w-auto"
              >
                Voir mes questionnaires
              </Button>
            </div>
          </div>
          <div className="relative order-first lg:order-last">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-xl"></div>
              <img 
                src="https://mgx-backend-cdn.metadl.com/generate/images/903894/2026-01-13/8a27dd6a-bd12-4fb0-b6fa-e919f906967d.png"
                alt="Survey illustration"
                className="relative w-full h-auto rounded-3xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="p-8 bg-slate-800/60 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ListChecks className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Questionnaires créés</p>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{stats.surveys}</p>
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-slate-800/60 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Réponses reçues</p>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{stats.responses}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Fonctionnalités principales
            </span>
          </h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour créer des questionnaires professionnels
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-8 bg-slate-800/60 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <PlusCircle className="h-7 w-7 text-white" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-100">Création facile</h4>
            <p className="text-gray-400 leading-relaxed">
              Interface intuitive pour créer des questionnaires avec différents types de questions
            </p>
          </Card>
          <Card className="p-8 bg-slate-800/60 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-100">Analyse visuelle</h4>
            <p className="text-gray-400 leading-relaxed">
              Tableaux de bord avec graphiques interactifs pour visualiser vos résultats
            </p>
          </Card>
          <Card className="p-8 bg-slate-800/60 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-100">Sécurité & Privacy</h4>
            <p className="text-gray-400 leading-relaxed">
              Vos données restent privées et stockées localement dans votre navigateur
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center">
              <Zap className="h-12 w-12 text-yellow-300" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold">
              Prêt à commencer ?
            </h3>
            <p className="text-lg text-blue-100">
              Rejoignez des milliers d'utilisateurs qui créent des questionnaires professionnels avec SurveySense
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/create')}
              className="bg-white text-blue-600 hover:bg-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Commencer maintenant
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-slate-900/60 backdrop-blur-md mt-16 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <p className="text-center text-gray-400 text-sm">
            © 2026 ABC.Dev - Toutes vos données sont stockées localement et de manière sécurisée
          </p>
        </div>
      </footer>
    </div>
  );
}
