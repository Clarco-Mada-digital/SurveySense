import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Database,
  FileQuestion,
  Lock,
  Shield
} from 'lucide-react';
import { getSurveys, deleteSurvey, getResponsesBySurveyId, verifyPin } from '@/lib/storage';
import { Survey } from '@/types/survey';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePinInput, setDeletePinInput] = useState('');

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = () => {
    const allSurveys = getSurveys();
    setSurveys(allSurveys);
  };

  const handleDelete = (id: string) => {
    const surveyToDelete = surveys.find(s => s.id === id);
    if (surveyToDelete?.resultsPin) {
      if (!verifyPin(deletePinInput, surveyToDelete.resultsPin, surveyToDelete.pinSalt)) {
        toast.error('Code PIN incorrect');
        return;
      }
    }

    deleteSurvey(id);
    loadSurveys();
    setDeleteId(null);
    setDeletePinInput('');
    toast.success('Questionnaire supprimé');
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/answer/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien copié dans le presse-papier');
  };

  const filteredSurveys = surveys.filter(survey =>
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-gray-300 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Accueil</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Mes questionnaires
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/import-export')}
                className="flex border-blue-500/30 text-blue-300 hover:bg-blue-500/10 flex-1 sm:flex-none"
              >
                <Database className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Import/Export</span>
                <span className="sm:hidden">Import</span>
              </Button>
              <Button
                onClick={() => navigate('/create')}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Créer un questionnaire</span>
                <span className="sm:inline hidden">Créer</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un questionnaire..."
              className="pl-10 text-sm bg-slate-800/60 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
            />
          </div>
        </div>

        {/* Survey Grid */}
        {filteredSurveys.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSurveys.map((survey) => {
              const responseCount = getResponsesBySurveyId(survey.id).length;
              return (
                <Card key={survey.id} className="p-4 sm:p-6 bg-slate-800/60 backdrop-blur-sm border border-white/10 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer">
                  <div className="space-y-3 sm:space-y-4">
                    <div onClick={() => navigate(`/answer/${survey.id}`)}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-base sm:text-xl font-semibold text-gray-100 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {survey.title}
                        </h3>
                        {survey.resultsPin && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[10px] text-indigo-300 font-medium whitespace-nowrap">
                            <Lock className="h-3 w-3" />
                            PIN
                          </div>
                        )}
                      </div>
                      {survey.description && (
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                          {survey.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span>{survey.questions.length} questions</span>
                      <span>•</span>
                      <span>{responseCount} réponses</span>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-wrap gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/answer/${survey.id}`)}
                        className="text-xs sm:text-sm px-2 sm:px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                      >
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Répondre</span>
                        <span className="sm:hidden">Rép</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit/${survey.id}`)}
                        className="text-xs sm:text-sm px-2 sm:px-3 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Modifier</span>
                        <span className="sm:hidden">Modif</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(survey.id)}
                        className="text-xs sm:text-sm px-2 sm:px-3 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      >
                        <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Copier</span>
                        <span className="sm:hidden">Lien</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/results/${survey.id}`)}
                        className="text-xs sm:text-sm px-2 sm:px-3 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                      >
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Résultats</span>
                        <span className="sm:hidden">Stats</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(survey.id)}
                        className="text-xs sm:text-sm px-2 sm:px-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Supprimer</span>
                        <span className="sm:hidden">Suppr</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 sm:p-12 text-center bg-slate-800/60 backdrop-blur-sm border border-white/10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl">
              <FileQuestion className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2">
              {searchTerm ? 'Aucun questionnaire trouvé' : 'Aucun questionnaire'}
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-6">
              {searchTerm
                ? 'Essayez avec d\'autres mots-clés'
                : 'Commencez par créer votre premier questionnaire'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/create')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Créer un questionnaire
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-800 border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Cette action supprimera définitivement le questionnaire et toutes ses réponses.
              Cette action est irréversible.

              {surveys.find(s => s.id === deleteId)?.resultsPin && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Saisissez le code PIN pour confirmer :
                  </label>
                  <Input
                    type="password"
                    maxLength={4}
                    value={deletePinInput}
                    onChange={(e) => setDeletePinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN"
                    className="bg-slate-700/50 border-white/10 text-gray-100 text-center text-xl tracking-widest"
                  />
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeletePinInput('')}
              className="border-white/10 text-gray-300 hover:bg-white/10"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
