import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { Survey, Question } from '@/types/survey';
import { saveSurvey, getSurveyById, generateId, hashPin } from '@/lib/storage';
import QuestionEditor from '@/components/QuestionEditor';
import { toast } from 'sonner';

export default function CreateSurvey() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [survey, setSurvey] = useState<Partial<Survey>>({
    title: '',
    description: '',
    creatorName: '',
    creatorEmail: '',
    creatorOrganization: '',
    questions: []
  });

  useEffect(() => {
    if (isEditing && id) {
      const existingSurvey = getSurveyById(id);
      if (existingSurvey) {
        setSurvey(existingSurvey);
      } else {
        toast.error('Questionnaire introuvable');
        navigate('/surveys');
      }
    }
  }, [id, isEditing, navigate]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      type: 'text',
      question: '',
      required: false
    };
    setSurvey({
      ...survey,
      questions: [...(survey.questions || []), newQuestion]
    });
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const questions = [...(survey.questions || [])];
    questions[index] = updatedQuestion;
    setSurvey({ ...survey, questions });
  };

  const deleteQuestion = (index: number) => {
    const questions = survey.questions?.filter((_, i) => i !== index);
    setSurvey({ ...survey, questions });
  };

  const handleSave = () => {
    // Validation
    if (!survey.title?.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }
    if (!survey.creatorName?.trim()) {
      toast.error('Le nom du créateur est obligatoire');
      return;
    }
    if (!survey.creatorEmail?.trim()) {
      toast.error('L\'email du créateur est obligatoire');
      return;
    }
    if (!survey.questions || survey.questions.length === 0) {
      toast.error('Ajoutez au moins une question');
      return;
    }

    // Check if all questions have text
    const emptyQuestions = survey.questions.some(q => !q.question.trim());
    if (emptyQuestions) {
      toast.error('Toutes les questions doivent avoir un texte');
      return;
    }

    const now = new Date().toISOString();

    // Hash PIN if it's a new 4-digit PIN
    let finalPin = survey.resultsPin;
    let finalSalt = survey.pinSalt;

    if (finalPin && finalPin.length === 4) {
      finalSalt = generateId();
      finalPin = hashPin(finalPin, finalSalt);
    }

    const surveyToSave: Survey = {
      id: survey.id || generateId(),
      title: survey.title,
      description: survey.description || '',
      creatorName: survey.creatorName,
      creatorEmail: survey.creatorEmail,
      creatorOrganization: survey.creatorOrganization,
      questions: survey.questions,
      resultsPin: finalPin,
      pinSalt: finalSalt,
      createdAt: survey.createdAt || now,
      updatedAt: now
    };

    saveSurvey(surveyToSave);
    toast.success(isEditing ? 'Questionnaire mis à jour' : 'Questionnaire créé avec succès');
    navigate('/surveys');
  };

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
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/surveys')} className="text-gray-300 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {isEditing ? 'Modifier' : 'Créer'} un questionnaire
            </h1>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Creator and Survey Information - Side by Side */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Creator Information */}
          <Card className="p-4 sm:p-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs sm:text-sm">1</span>
              </div>
              <span className="text-gray-100 text-sm sm:text-base">Informations du créateur</span>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="creatorName" className="text-xs sm:text-sm font-medium text-gray-300">Nom *</Label>
                <Input
                  id="creatorName"
                  value={survey.creatorName}
                  onChange={(e) => setSurvey({ ...survey, creatorName: e.target.value })}
                  placeholder="Votre nom"
                  className="mt-1 bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                />
              </div>
              <div>
                <Label htmlFor="creatorEmail" className="text-xs sm:text-sm font-medium text-gray-300">Email *</Label>
                <Input
                  id="creatorEmail"
                  type="email"
                  value={survey.creatorEmail}
                  onChange={(e) => setSurvey({ ...survey, creatorEmail: e.target.value })}
                  placeholder="votre@email.com"
                  className="mt-1 bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                />
              </div>
              <div>
                <Label htmlFor="creatorOrganization" className="text-xs sm:text-sm font-medium text-gray-300">Organisation</Label>
                <Input
                  id="creatorOrganization"
                  value={survey.creatorOrganization}
                  onChange={(e) => setSurvey({ ...survey, creatorOrganization: e.target.value })}
                  placeholder="Nom de votre organisation"
                  className="mt-1 bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                />
              </div>
            </div>
          </Card>

          {/* Survey Information */}
          <Card className="p-4 sm:p-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs sm:text-sm">2</span>
              </div>
              <span className="text-gray-100 text-sm sm:text-base">Informations du questionnaire</span>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="title" className="text-xs sm:text-sm font-medium text-gray-300">Titre *</Label>
                <Input
                  id="title"
                  value={survey.title}
                  onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                  placeholder="Titre de votre questionnaire"
                  className="mt-1 bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-xs sm:text-sm font-medium text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={survey.description}
                  onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                  placeholder="Décrivez l'objectif de votre questionnaire..."
                  className="mt-1 bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="resultsPin" className="text-xs sm:text-sm font-medium text-gray-300">Code PIN des résultats (optionnel)</Label>
                <Input
                  id="resultsPin"
                  type="password"
                  maxLength={4}
                  value={survey.resultsPin || ''}
                  onChange={(e) => setSurvey({ ...survey, resultsPin: e.target.value.replace(/\D/g, '') })}
                  placeholder="Ex: 1234"
                  className="mt-1 bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">Pour sécuriser l'accès aux graphiques et résultats.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Questions */}
        <Card className="mb-6 sm:mb-8 bg-slate-800/60 backdrop-blur-sm border border-white/10">
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs sm:text-sm">3</span>
                </div>
                <span className="text-gray-100 text-sm sm:text-base">Questions</span>
                {survey.questions && survey.questions.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-300 text-xs sm:text-sm rounded-full">
                    {survey.questions.length}
                  </span>
                )}
              </h2>
              <Button onClick={addQuestion} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une question
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {survey.questions?.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  onUpdate={(updated) => updateQuestion(index, updated)}
                  onDelete={() => deleteQuestion(index)}
                  index={index}
                />
              ))}

              {(!survey.questions || survey.questions.length === 0) && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                  </div>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">Aucune question ajoutée</p>
                  <Button onClick={addQuestion} variant="outline" className="w-full sm:w-auto border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter votre première question
                  </Button>
                </div>
              )}

              {/* Add question button at the bottom */}
              {survey.questions && survey.questions.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <Button
                    onClick={addQuestion}
                    variant="outline"
                    className="w-full border-dashed border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une autre question
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button variant="outline" onClick={() => navigate('/surveys')} className="w-full sm:w-auto border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Mettre à jour' : 'Créer le questionnaire'}
          </Button>
        </div>
      </div>
    </div>
  );
}
