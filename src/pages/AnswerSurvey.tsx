import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Send } from 'lucide-react';
import { getSurveyById, saveResponse, generateId } from '@/lib/storage';
import { Survey, Answer } from '@/types/survey';
import { toast } from 'sonner';

export default function AnswerSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      const foundSurvey = getSurveyById(id);
      if (foundSurvey) {
        setSurvey(foundSurvey);
      } else {
        toast.error('Questionnaire introuvable');
        navigate('/');
      }
    }
  }, [id, navigate]);

  const handleSubmit = () => {
    if (!survey) return;

    // Validate required questions
    const missingRequired = survey.questions.some(q => {
      if (!q.required) return false;
      const answer = answers[q.id];
      if (Array.isArray(answer)) return answer.length === 0;
      return !answer || answer === '';
    });

    if (missingRequired) {
      toast.error('Veuillez répondre à toutes les questions obligatoires');
      return;
    }

    // Save response
    const response = {
      id: generateId(),
      surveyId: survey.id,
      answers: Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value
      })),
      submittedAt: new Date().toISOString()
    };

    saveResponse(response);
    setSubmitted(true);
    toast.success('Réponse enregistrée avec succès');
  };

  const updateAnswer = (questionId: string, value: string | string[] | number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const toggleCheckbox = (questionId: string, optionId: string) => {
    const current = (answers[questionId] as string[]) || [];
    const updated = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    updateAnswer(questionId, updated);
  };

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <img 
            src="https://mgx-backend-cdn.metadl.com/generate/images/903894/2026-01-13/85fd0b4a-a59c-4b71-aa64-5b13fcc428f1.png"
            alt="Success"
            className="w-24 h-24 mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Merci !</h2>
          <p className="text-gray-600 mb-6">
            Votre réponse a été enregistrée avec succès.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  const answeredCount = survey.questions.filter(q => {
    const answer = answers[q.id];
    if (Array.isArray(answer)) return answer.length > 0;
    return answer !== undefined && answer !== '';
  }).length;
  const progress = (answeredCount / survey.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
        {/* Survey Header */}
        <Card className="p-4 sm:p-8 mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-sm sm:text-base text-gray-600 mb-4">{survey.description}</p>
          )}
          <div className="text-xs sm:text-sm text-gray-500 space-y-1">
            <p>Créé par : {survey.creatorName}</p>
            {survey.creatorOrganization && (
              <p>Organisation : {survey.creatorOrganization}</p>
            )}
          </div>
        </Card>

        {/* Progress - Sticky */}
        <div className="sticky top-16 sm:top-20 z-40 mb-6">
          <Card className="p-3 sm:p-4 bg-white border shadow-sm">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
              <span>Progression</span>
              <span>{answeredCount} / {survey.questions.length} questions</span>
            </div>
            <Progress value={progress} className="h-2" />
          </Card>
        </div>

        {/* Questions */}
        <div className="space-y-4 sm:space-y-6">
          {survey.questions.map((question, index) => (
            <Card key={question.id} className="p-4 sm:p-6">
              <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">
                {index + 1}. {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {question.type === 'text' && (
                <Input
                  value={(answers[question.id] as string) || ''}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  placeholder="Votre réponse..."
                  className="text-sm"
                />
              )}

              {question.type === 'textarea' && (
                <Textarea
                  value={(answers[question.id] as string) || ''}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  placeholder="Votre réponse..."
                  rows={4}
                  className="text-sm"
                />
              )}

              {question.type === 'radio' && (
                <RadioGroup
                  value={(answers[question.id] as string) || ''}
                  onValueChange={(value) => updateAnswer(question.id, value)}
                >
                  {question.options?.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 sm:space-x-3">
                      <RadioGroupItem value={option.id} id={option.id} className="h-4 w-4" />
                      <Label htmlFor={option.id} className="font-normal cursor-pointer text-sm sm:text-base">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'checkbox' && (
                <div className="space-y-2 sm:space-y-3">
                  {question.options?.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 sm:space-x-3">
                      <Checkbox
                        id={option.id}
                        checked={((answers[question.id] as string[]) || []).includes(option.id)}
                        onCheckedChange={() => toggleCheckbox(question.id, option.id)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={option.id} className="font-normal cursor-pointer text-sm sm:text-base">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'scale' && (
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from(
                    { length: (question.scaleMax || 5) - (question.scaleMin || 1) + 1 },
                    (_, i) => (question.scaleMin || 1) + i
                  ).map((value) => (
                    <Button
                      key={value}
                      variant={answers[question.id] === value ? 'default' : 'outline'}
                      onClick={() => updateAnswer(question.id, value)}
                      className="flex-1 min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 text-xs sm:text-sm"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              )}

              {question.type === 'yesno' && (
                <RadioGroup
                  value={(answers[question.id] as string) || ''}
                  onValueChange={(value) => updateAnswer(question.id, value)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <RadioGroupItem value="yes" id={`${question.id}-yes`} className="h-4 w-4" />
                    <Label htmlFor={`${question.id}-yes`} className="font-normal cursor-pointer text-sm sm:text-base">
                      Oui
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <RadioGroupItem value="no" id={`${question.id}-no`} className="h-4 w-4" />
                    <Label htmlFor={`${question.id}-no`} className="font-normal cursor-pointer text-sm sm:text-base">
                      Non
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button 
            onClick={handleSubmit} 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            Soumettre mes réponses
          </Button>
        </div>
      </div>
    </div>
  );
}
