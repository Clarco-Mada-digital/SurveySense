import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusCircle, ListChecks, BarChart3 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">SurveySense</h1>
          </div>
          <Button onClick={() => navigate('/surveys')} variant="outline" size="sm" className="hidden sm:inline-flex">
            Mes Questionnaires
          </Button>
          <Button onClick={() => navigate('/surveys')} variant="outline" size="sm" className="sm:hidden px-2">
            <ListChecks className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Créez des questionnaires professionnels en quelques minutes
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Une solution simple et puissante pour créer, partager et analyser vos enquêtes. 
              Toutes vos données restent dans votre navigateur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={() => navigate('/create')}
                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Créer un questionnaire
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/surveys')}
                className="w-full sm:w-auto"
              >
                Voir mes questionnaires
              </Button>
            </div>
          </div>
          <div className="relative order-first lg:order-last">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/903894/2026-01-13/436e6942-1d30-4892-acb8-c98a678beec0.png"
              alt="Survey illustration"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-6 sm:p-8 bg-white border-indigo-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-indigo-100 rounded-xl">
                <ListChecks className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Questionnaires créés</p>
                <p className="text-2xl sm:text-4xl font-bold text-gray-900">{stats.surveys}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 sm:p-8 bg-white border-purple-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-purple-100 rounded-xl">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Réponses reçues</p>
                <p className="text-2xl sm:text-4xl font-bold text-gray-900">{stats.responses}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
          Fonctionnalités principales
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <PlusCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold mb-2">Création facile</h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Interface intuitive pour créer des questionnaires avec différents types de questions
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold mb-2">Analyse visuelle</h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Tableaux de bord avec graphiques interactifs pour visualiser vos résultats
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <ListChecks className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold mb-2">Export des données</h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Exportez vos questionnaires et réponses en JSON ou CSV
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-12 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-center text-gray-600 text-sm sm:text-base">
            © 2026 ABC.Dev - Toutes vos données sont stockées localement dans votre navigateur
          </p>
        </div>
      </footer>
    </div>
  );
}
