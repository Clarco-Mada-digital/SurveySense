import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, BarChart3, FileText, List, Calendar, Filter } from 'lucide-react';
import { 
  getSurveyById, 
  getResponsesBySurveyId, 
  exportResponsesAsCSV, 
  exportFullSurveyData,
  exportResponsesWithDateFilter,
  exportResponsesAsCSVWithDateFilter,
  getResponsesDateStats
} from '@/lib/storage';
import { Survey, SurveyResponse } from '@/types/survey';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'];

export default function SurveyResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      const foundSurvey = getSurveyById(id);
      if (foundSurvey) {
        setSurvey(foundSurvey);
        const surveyResponses = getResponsesBySurveyId(id);
        setResponses(surveyResponses);
        
        // Initialize date range with actual response dates
        const dateStats = getResponsesDateStats(id);
        if (dateStats.dateRange) {
          setStartDate(dateStats.dateRange.start);
          setEndDate(dateStats.dateRange.end);
        }
      } else {
        toast.error('Questionnaire introuvable');
        navigate('/surveys');
      }
    }
  }, [id, navigate]);

  const handleExportCSV = () => {
    if (id) {
      if (showDateFilter && (startDate || endDate)) {
        exportResponsesAsCSVWithDateFilter(id, startDate, endDate);
        toast.success('Réponses exportées en CSV avec filtre de date');
      } else {
        exportResponsesAsCSV(id);
        toast.success('Réponses exportées en CSV');
      }
    }
  };

  const handleExportJSON = () => {
    if (id) {
      if (showDateFilter && (startDate || endDate)) {
        exportResponsesWithDateFilter(id, startDate, endDate);
        toast.success('Réponses exportées en JSON avec filtre de date');
      } else {
        exportFullSurveyData(id);
        toast.success('Export JSON téléchargé');
      }
    }
  };

  const clearDateFilter = () => {
    const dateStats = getResponsesDateStats(id || '');
    if (dateStats.dateRange) {
      setStartDate(dateStats.dateRange.start);
      setEndDate(dateStats.dateRange.end);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const getQuestionStats = (questionId: string) => {
    const question = survey?.questions.find(q => q.id === questionId);
    if (!question) return null;

    const answers = responses.map(r => r.answers.find(a => a.questionId === questionId)?.value).filter(Boolean);

    if (question.type === 'radio' || question.type === 'yesno') {
      const counts: Record<string, number> = {};
      answers.forEach(answer => {
        const key = answer as string;
        counts[key] = (counts[key] || 0) + 1;
      });

      return Object.entries(counts).map(([key, value]) => {
        let name = key;
        if (question.type === 'yesno') {
          name = key === 'yes' ? 'Oui' : 'Non';
        } else {
          const option = question.options?.find(opt => opt.id === key);
          name = option?.label || key;
        }
        return { name, value };
      });
    }

    if (question.type === 'checkbox') {
      const counts: Record<string, number> = {};
      answers.forEach(answer => {
        const arr = answer as string[];
        arr.forEach(optionId => {
          counts[optionId] = (counts[optionId] || 0) + 1;
        });
      });

      return Object.entries(counts).map(([key, value]) => {
        const option = question.options?.find(opt => opt.id === key);
        return { name: option?.label || key, value };
      });
    }

    if (question.type === 'scale') {
      const counts: Record<number, number> = {};
      answers.forEach(answer => {
        const num = answer as number;
        counts[num] = (counts[num] || 0) + 1;
      });

      return Object.entries(counts)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([key, value]) => ({ name: key, value }));
    }

    return null;
  };

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

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
              <Button variant="ghost" size="sm" onClick={() => navigate('/surveys')} className="text-gray-300 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Résultats
              </h1>
            </div>
            {/* <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="hidden sm:flex">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJSON} className="hidden sm:flex">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div> */}
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Survey Info - Compact */}
        <Card className="p-4 sm:p-6 mb-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-100 mb-2 line-clamp-2">
                {survey.title}
              </h2>
              {survey.description && (
                <p className="text-sm sm:text-base text-gray-400 line-clamp-2">
                  {survey.description}
                </p>
              )}
            </div>
            <div className="flex gap-4 sm:gap-8 text-xs sm:text-sm">
              <div className="text-center">
                <div className="font-bold text-lg sm:text-xl text-blue-400">{survey.questions.length}</div>
                <div className="text-gray-500">Questions</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg sm:text-xl text-indigo-400">{responses.length}</div>
                <div className="text-gray-500">Réponses</div>
              </div>
            </div>
          </div>
        </Card>

        {responses.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center bg-slate-800/60 backdrop-blur-sm border border-white/10">
            <img 
              src="https://mgx-backend-cdn.metadl.com/generate/images/903894/2026-01-13/8a27dd6a-bd12-4fb0-b6fa-e919f906967d.png"
              alt="No responses"
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 opacity-50"
            />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2">
              Aucune réponse pour le moment
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
              Partagez le lien du questionnaire pour commencer à recevoir des réponses
            </p>
            <Button 
              onClick={() => {
                const link = `${window.location.origin}/answer/${survey.id}`;
                navigator.clipboard.writeText(link);
                toast.success('Lien copié dans le presse-papier');
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg"
            >
              Copier le lien du questionnaire
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/60 backdrop-blur-sm border border-white/10 p-1 rounded-lg">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-gray-100 data-[state=active]:border-white/20 rounded-md">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Vue d'ensemble</span>
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-gray-100 data-[state=active]:border-white/20 rounded-md">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Questions</span>
              </TabsTrigger>
              <TabsTrigger value="exports" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-gray-100 data-[state=active]:border-white/20 rounded-md">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exports</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {survey.questions.slice(0, 6).map((question, index) => {
                  const stats = getQuestionStats(question.id);
                  const hasStats = stats && stats.length > 0;
                  
                  // Get text answers for text/textarea questions
                  const textAnswers = question.type === 'text' || question.type === 'textarea'
                    ? responses.map(r => r.answers.find(a => a.questionId === question.id)?.value as string).filter(Boolean)
                    : [];
                  
                  return (
                    <Card key={question.id} className="p-4 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-slate-800/60 backdrop-blur-sm border border-white/10">
                      <h4 className="text-sm font-semibold text-gray-100 mb-2 line-clamp-2">
                        Q{index + 1}: {question.question}
                      </h4>
                      <div className="text-xs text-gray-500 mb-3">
                        {question.type === 'text' || question.type === 'textarea' ? 'Texte' :
                         question.type === 'radio' ? 'Choix unique' :
                         question.type === 'checkbox' ? 'Choix multiples' :
                         question.type === 'scale' ? 'Échelle' : 'Oui/Non'}
                      </div>
                      
                      {/* Handle text/textarea questions */}
                      {question.type === 'text' || question.type === 'textarea' ? (
                        textAnswers.length > 0 ? (
                          <div className="space-y-2">
                            {textAnswers.slice(0, 2).map((answer, idx) => (
                              <div key={idx} className="text-xs text-gray-300 bg-slate-700/30 p-2 rounded truncate">
                                {answer}
                              </div>
                            ))}
                            {textAnswers.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{textAnswers.length - 2} autre(s) réponse(s)
                              </div>
                            )}
                            <div className="text-xs text-gray-400 text-center pt-1">
                              {textAnswers.length} réponse(s) au total
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 text-center py-2">
                            Aucune réponse
                          </div>
                        )
                      ) : (
                        /* Handle other question types */
                        hasStats ? (
                          <div className="space-y-2">
                            {stats.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="truncate mr-2 text-gray-300">{item.name}</span>
                                <span className="font-medium text-gray-100">{item.value}</span>
                              </div>
                            ))}
                            {stats.length > 3 && (
                              <div className="text-xs text-gray-500 text-center pt-1">
                                +{stats.length - 3} autres
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 text-center py-2">
                            Aucune réponse
                          </div>
                        )
                      )}
                    </Card>
                  );
                })}
              </div>
              {survey.questions.length > 6 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const questionsTab = document.querySelector('[value="questions"]') as HTMLElement;
                      questionsTab?.click();
                    }}
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  >
                    Voir toutes les questions
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="questions" className="space-y-4 sm:space-y-6">
              {survey.questions.map((question, index) => {
                const stats = getQuestionStats(question.id);
                const textAnswers = question.type === 'text' || question.type === 'textarea'
                  ? responses.map(r => r.answers.find(a => a.questionId === question.id)?.value as string).filter(Boolean)
                  : [];

                return (
                  <Card key={question.id} className="p-4 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-slate-800/60 backdrop-blur-sm border border-white/10">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-4">
                      {index + 1}. {question.question}
                    </h3>

                    {stats && (question.type === 'radio' || question.type === 'yesno') && (
                      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
                        <div className="h-64 sm:h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {stats.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          {stats.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-700/30 rounded-lg">
                              <div 
                                className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                              />
                              <span className="text-sm sm:text-base font-medium truncate">{item.name}</span>
                              <span className="text-xs sm:text-sm text-gray-400">{item.value} réponses</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stats && (question.type === 'checkbox' || question.type === 'scale') && (
                      <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#6366F1" name="Nombre de réponses" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {textAnswers.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-300 mb-2">
                          {textAnswers.length} réponse{textAnswers.length > 1 ? 's' : ''} :
                        </p>
                        <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
                          {textAnswers.map((answer, idx) => (
                            <div key={idx} className="p-2 sm:p-3 bg-slate-700/30 rounded-lg border border-white/5">
                              <p className="text-xs sm:text-sm text-gray-100">{answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="exports" className="space-y-6">
              <Card className="p-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-100">Filtres d'exportation</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="flex items-center gap-2 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  >
                    <Filter className="h-4 w-4" />
                    {showDateFilter ? 'Masquer les filtres' : 'Afficher les filtres'}
                  </Button>
                </div>

                {showDateFilter && (
                  <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-white/10">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date de début
                        </label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-slate-700/50 border-white/10 text-gray-100 focus:border-blue-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date de fin
                        </label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-slate-700/50 border-white/10 text-gray-100 focus:border-blue-500/30"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearDateFilter}
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      >
                        Réinitialiser
                      </Button>
                      <div className="text-xs text-gray-600">
                        Plage: {startDate || 'début'} → {endDate || 'fin'}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
              <Card className="p-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Exporter les données</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleExportCSV} 
                    className="w-full h-auto p-4 flex flex-col items-center gap-2 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                    variant="outline"
                  >
                    <Download className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Export CSV</div>
                      <div className="text-xs text-gray-500">
                        {showDateFilter && (startDate || endDate) ? 'Avec filtre de date' : 'Format tableur'}
                      </div>
                    </div>
                  </Button>
                  <Button 
                    onClick={handleExportJSON} 
                    className="w-full h-auto p-4 flex flex-col items-center gap-2 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                    variant="outline"
                  >
                    <Download className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Export JSON</div>
                      <div className="text-xs text-gray-500">
                        {showDateFilter && (startDate || endDate) ? 'Avec filtre de date' : 'Format structuré'}
                      </div>
                    </div>
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Statistiques générales</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-blue-400">{responses.length}</div>
                    <div className="text-sm text-gray-500">Total réponses</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-indigo-400">{survey.questions.length}</div>
                    <div className="text-sm text-gray-500">Questions</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round((responses.length / Math.max(survey.questions.length, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Taux de réponse</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-orange-400">{survey.questions.filter(q => q.required).length}</div>
                    <div className="text-sm text-gray-500">Questions obligatoires</div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
