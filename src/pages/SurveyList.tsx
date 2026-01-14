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
  Database
} from 'lucide-react';
import { getSurveys, deleteSurvey, getResponsesBySurveyId } from '@/lib/storage';
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

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = () => {
    const allSurveys = getSurveys();
    setSurveys(allSurveys);
  };

  const handleDelete = (id: string) => {
    deleteSurvey(id);
    loadSurveys();
    setDeleteId(null);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Accueil</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                Mes questionnaires
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/import-export')}
                className="hidden sm:flex"
              >
                <Database className="h-4 w-4 mr-2" />
                Import/Export
              </Button>
              <Button
                onClick={() => navigate('/create')}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Créer un questionnaire</span>
                <span className="sm:hidden">Créer</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un questionnaire..."
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Survey Grid */}
        {filteredSurveys.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSurveys.map((survey) => {
              const responseCount = getResponsesBySurveyId(survey.id).length;
              return (
                <Card key={survey.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="space-y-3 sm:space-y-4">
                    <div onClick={() => navigate(`/answer/${survey.id}`)}>
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {survey.title}
                      </h3>
                      {survey.description && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {survey.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span>{survey.questions.length} questions</span>
                      <span>•</span>
                      <span>{responseCount} réponses</span>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t flex flex-wrap gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/answer/${survey.id}`)}
                        className="text-xs sm:text-sm px-2 sm:px-3 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Répondre</span>
                        <span className="sm:hidden">Rép</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit/${survey.id}`)}
                        className="text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Modifier</span>
                        <span className="sm:hidden">Modif</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(survey.id)}
                        className="text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Copier</span>
                        <span className="sm:hidden">Lien</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/results/${survey.id}`)}
                        className="text-xs sm:text-sm px-2 sm:px-3 text-indigo-600 hover:text-indigo-700"
                      >
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Résultats</span>
                        <span className="sm:hidden">Stats</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(survey.id)}
                        className="text-xs sm:text-sm px-2 sm:px-3 text-red-600 hover:text-red-700"
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
          <Card className="p-8 sm:p-12 text-center">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/903894/2026-01-13/79232333-9a6e-4d03-90a6-5876b5ea02a4.png"
              alt="Empty state"
              className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4 sm:mb-6 opacity-50"
            />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Aucun questionnaire trouvé' : 'Aucun questionnaire'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {searchTerm 
                ? 'Essayez avec d\'autres mots-clés'
                : 'Commencez par créer votre premier questionnaire'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/create')} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Créer un questionnaire
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement le questionnaire et toutes ses réponses.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
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
