import { Question, QuestionType } from '@/types/survey';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { generateId } from '@/lib/storage';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  index: number;
}

export default function QuestionEditor({ question, onUpdate, onDelete, index }: QuestionEditorProps) {
  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'text', label: 'Texte court' },
    { value: 'textarea', label: 'Texte long' },
    { value: 'radio', label: 'Choix unique' },
    { value: 'checkbox', label: 'Choix multiples' },
    { value: 'scale', label: 'Échelle de notation' },
    { value: 'yesno', label: 'Oui/Non' }
  ];

  const addOption = () => {
    const newOption = { id: generateId(), label: '' };
    onUpdate({
      ...question,
      options: [...(question.options || []), newOption]
    });
  };

  const updateOption = (optionId: string, label: string) => {
    onUpdate({
      ...question,
      options: question.options?.map(opt => 
        opt.id === optionId ? { ...opt, label } : opt
      )
    });
  };

  const deleteOption = (optionId: string) => {
    onUpdate({
      ...question,
      options: question.options?.filter(opt => opt.id !== optionId)
    });
  };

  return (
    <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4 bg-slate-800/60 backdrop-blur-sm border border-white/10 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="pt-2 cursor-move">
          <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs sm:text-sm font-semibold text-gray-300">Question {index + 1}</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 sm:p-2"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:gap-4">
            <div>
              <Label htmlFor={`question-${question.id}`} className="text-xs sm:text-sm text-gray-300">Question</Label>
              <Input
                id={`question-${question.id}`}
                value={question.question}
                onChange={(e) => onUpdate({ ...question, question: e.target.value })}
                placeholder="Entrez votre question..."
                className="mt-1 text-sm bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
              />
            </div>

            <div>
              <Label htmlFor={`type-${question.id}`} className="text-xs sm:text-sm text-gray-300">Type de question</Label>
              <Select
                value={question.type}
                onValueChange={(value: QuestionType) => {
                  const updated: Question = { ...question, type: value };
                  if (value === 'radio' || value === 'checkbox') {
                    updated.options = updated.options || [
                      { id: generateId(), label: 'Option 1' },
                      { id: generateId(), label: 'Option 2' }
                    ];
                  } else if (value === 'scale') {
                    updated.scaleMin = 1;
                    updated.scaleMax = 5;
                  }
                  onUpdate(updated);
                }}
              >
                <SelectTrigger className="mt-1 text-sm bg-slate-700/50 border-white/10 text-gray-100 focus:border-blue-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border border-white/10">
                  {questionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-sm text-gray-100 focus:bg-blue-500/20">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(question.type === 'radio' || question.type === 'checkbox') && (
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-xs sm:text-sm text-gray-300">Options</Label>
                {question.options?.map((option, idx) => (
                  <div key={option.id} className="flex gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="text-sm flex-1 bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOption(option.id)}
                      disabled={(question.options?.length || 0) <= 2}
                      className="p-1 sm:p-2 flex-shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full text-xs sm:text-sm border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Ajouter une option
                </Button>
              </div>
            )}

            {question.type === 'scale' && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor={`scale-min-${question.id}`} className="text-xs sm:text-sm text-gray-300">Minimum</Label>
                  <Input
                    id={`scale-min-${question.id}`}
                    type="number"
                    value={question.scaleMin || 1}
                    onChange={(e) => onUpdate({ ...question, scaleMin: parseInt(e.target.value) })}
                    className="mt-1 text-sm bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                  />
                </div>
                <div>
                  <Label htmlFor={`scale-max-${question.id}`} className="text-xs sm:text-sm text-gray-300">Maximum</Label>
                  <Input
                    id={`scale-max-${question.id}`}
                    type="number"
                    value={question.scaleMax || 5}
                    onChange={(e) => onUpdate({ ...question, scaleMax: parseInt(e.target.value) })}
                    className="mt-1 text-sm bg-slate-700/50 border-white/10 text-gray-100 placeholder-gray-400 focus:border-blue-500/30"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ ...question, required: checked as boolean })}
                className="h-4 w-4 border-blue-500/30"
              />
              <Label htmlFor={`required-${question.id}`} className="text-xs sm:text-sm font-normal cursor-pointer text-gray-300">
                Question obligatoire
              </Label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
