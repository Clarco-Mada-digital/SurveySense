import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { Survey, Question } from '@/types/survey';
import { saveSurvey, getSurveyById, generateId } from '@/lib/storage';
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
    const surveyToSave: Survey = {
      id: survey.id || generateId(),
      title: survey.title,
      description: survey.description || '',
      creatorName: survey.creatorName,
      creatorEmail: survey.creatorEmail,
      creatorOrganization: survey.creatorOrganization,
      questions: survey.questions,
      createdAt: survey.createdAt || now,
      updatedAt: now
    };

    saveSurvey(surveyToSave);
    toast.success(isEditing ? 'Questionnaire mis à jour' : 'Questionnaire créé avec succès');
    navigate('/surveys');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/surveys')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              {isEditing ? 'Modifier' : 'Créer'} un questionnaire
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Creator and Survey Information - Side by Side */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Creator Information */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-xs sm:text-sm">1</span>
              </div>
              <span className="text-sm sm:text-base">Informations du créateur</span>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="creatorName" className="text-xs sm:text-sm font-medium">Nom *</Label>
                <Input
                  id="creatorName"
                  value={survey.creatorName}
                  onChange={(e) => setSurvey({ ...survey, creatorName: e.target.value })}
                  placeholder="Votre nom"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="creatorEmail" className="text-xs sm:text-sm font-medium">Email *</Label>
                <Input
                  id="creatorEmail"
                  type="email"
                  value={survey.creatorEmail}
                  onChange={(e) => setSurvey({ ...survey, creatorEmail: e.target.value })}
                  placeholder="votre@email.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="creatorOrganization" className="text-xs sm:text-sm font-medium">Organisation</Label>
                <Input
                  id="creatorOrganization"
                  value={survey.creatorOrganization}
                  onChange={(e) => setSurvey({ ...survey, creatorOrganization: e.target.value })}
                  placeholder="Nom de votre organisation"
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Survey Information */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-xs sm:text-sm">2</span>
              </div>
              <span className="text-sm sm:text-base">Informations du questionnaire</span>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="title" className="text-xs sm:text-sm font-medium">Titre *</Label>
                <Input
                  id="title"
                  value={survey.title}
                  onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                  placeholder="Titre de votre questionnaire"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-xs sm:text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={survey.description}
                  onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                  placeholder="Décrivez l'objectif de votre questionnaire..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Questions */}
        <Card className="mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-xs sm:text-sm">3</span>
                </div>
                <span className="text-sm sm:text-base">Questions</span>
                {survey.questions && survey.questions.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-indigo-50 text-indigo-600 text-xs sm:text-sm rounded-full">
                    {survey.questions.length}
                  </span>
                )}
              </h2>
              <Button onClick={addQuestion} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
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
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">Aucune question ajoutée</p>
                  <Button onClick={addQuestion} variant="outline" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter votre première question
                  </Button>
                </div>
              )}

              {/* Add question button at the bottom */}
              {survey.questions && survey.questions.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    onClick={addQuestion} 
                    variant="outline" 
                    className="w-full border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
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
          <Button variant="outline" onClick={() => navigate('/surveys')} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Mettre à jour' : 'Créer le questionnaire'}
          </Button>
        </div>
      </div>
    </div>
  );
}
