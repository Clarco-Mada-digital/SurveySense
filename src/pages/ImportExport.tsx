import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Download, FileText, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { 
  getSurveys, 
  getResponsesBySurveyId,
  importSurveyFromFile, 
  importResponsesFromFile, 
  importAllDataFromFile,
  exportSurveyOnly,
  exportAllSurveys,
  exportResponsesAsCSV,
  exportFullSurveyData
} from '@/lib/storage';
import { toast } from 'sonner';

interface ImportResult {
  success: boolean;
  message: string;
  survey?: any;
  importedCount?: number;
  importedSurveys?: number;
  importedResponses?: number;
}

export default function ImportExport() {
  const navigate = useNavigate();
  const [importType, setImportType] = useState<'survey' | 'responses' | 'all'>('survey');
  const [targetSurveyId, setTargetSurveyId] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [successfulImports, setSuccessfulImports] = useState<Set<string>>(new Set());
  
  const surveyFileRef = useRef<HTMLInputElement>(null);
  const responsesFileRef = useRef<HTMLInputElement>(null);
  const allDataFileRef = useRef<HTMLInputElement>(null);
  
  const surveys = getSurveys();

  const handleFileUpload = async (file: File, type: 'survey' | 'responses' | 'all') => {
    if (!file) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      let result: ImportResult;
      
      switch (type) {
        case 'survey':
          result = await importSurveyFromFile(file);
          break;
        case 'responses':
          if (!targetSurveyId) {
            toast.error('Veuillez sélectionner un questionnaire cible');
            setIsImporting(false);
            return;
          }
          result = await importResponsesFromFile(file, targetSurveyId);
          break;
        case 'all':
          result = await importAllDataFromFile(file);
          break;
        default:
          throw new Error('Type d\'import invalide');
      }
      
      setImportResult(result);
      
      if (result.success) {
        // Add to successful imports for visual feedback
        setSuccessfulImports(prev => new Set(prev).add(type));
        toast.success(result.message);
        
        // Clear file input
        if (type === 'survey') surveyFileRef.current?.value && (surveyFileRef.current.value = '');
        if (type === 'responses') responsesFileRef.current?.value && (responsesFileRef.current.value = '');
        if (type === 'all') allDataFileRef.current?.value && (allDataFileRef.current.value = '');
        
        // Clear success state after 5 seconds
        setTimeout(() => {
          setSuccessfulImports(prev => {
            const newSet = new Set(prev);
            newSet.delete(type);
            return newSet;
          });
        }, 5000);
      } else {
        toast.error(result.message);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'importation';
      toast.error(errorMessage);
      setImportResult({ success: false, message: errorMessage });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportSurvey = (surveyId: string) => {
    exportSurveyOnly(surveyId);
    toast.success('Questionnaire exporté avec succès');
  };

  const handleExportAllSurveys = () => {
    exportAllSurveys();
    toast.success('Tous les questionnaires exportés avec succès');
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
              Import / Export
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Import Section */}
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Upload className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Importer des données</h2>
          </div>

          {/* Import Type Selection */}
          <Card className="p-4 sm:p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'importation
                </label>
                <Select value={importType} onValueChange={(value: any) => setImportType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez le type d'importation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survey">Importer un questionnaire</SelectItem>
                    <SelectItem value="responses">Importer des réponses</SelectItem>
                    <SelectItem value="all">Importer toutes les données (backup)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Survey Selection for Responses */}
              {importType === 'responses' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questionnaire cible
                  </label>
                  <Select value={targetSurveyId} onValueChange={setTargetSurveyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un questionnaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {surveys.map((survey) => (
                        <SelectItem key={survey.id} value={survey.id}>
                          {survey.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>

          {/* File Upload Areas */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Survey Import */}
            <Card className={`p-4 sm:p-6 border-2 transition-all relative overflow-hidden ${
              importType === 'survey' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
            } ${successfulImports.has('survey') ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}>
              {successfulImports.has('survey') && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Questionnaire</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Importez un questionnaire depuis un fichier JSON
                </p>
                <input
                  ref={surveyFileRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'survey')}
                  className="hidden"
                  id="survey-file"
                />
                <Button
                  onClick={() => surveyFileRef.current?.click()}
                  disabled={isImporting}
                  className="w-full"
                  variant={importType === 'survey' ? 'default' : 'outline'}
                >
                  {isImporting && importType === 'survey' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {successfulImports.has('survey') ? 'Importer un autre' : 'Choisir un fichier'}
                </Button>
              </div>
            </Card>

            {/* Responses Import */}
            <Card className={`p-4 sm:p-6 border-2 transition-all relative overflow-hidden ${
              importType === 'responses' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            } ${successfulImports.has('responses') ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}>
              {successfulImports.has('responses') && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Réponses</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Importez des réponses pour un questionnaire existant
                </p>
                <input
                  ref={responsesFileRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'responses')}
                  className="hidden"
                  id="responses-file"
                />
                <Button
                  onClick={() => responsesFileRef.current?.click()}
                  disabled={isImporting || (importType === 'responses' && !targetSurveyId)}
                  className="w-full"
                  variant={importType === 'responses' ? 'default' : 'outline'}
                >
                  {isImporting && importType === 'responses' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {successfulImports.has('responses') ? 'Importer d\'autres' : 'Choisir un fichier'}
                </Button>
              </div>
            </Card>

            {/* All Data Import */}
            <Card className={`p-4 sm:p-6 border-2 transition-all relative overflow-hidden ${
              importType === 'all' ? 'border-green-500 bg-green-50' : 'border-gray-200'
            } ${successfulImports.has('all') ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}>
              {successfulImports.has('all') && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Backup complet</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Restaurez tous vos questionnaires et réponses
                </p>
                <input
                  ref={allDataFileRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'all')}
                  className="hidden"
                  id="all-data-file"
                />
                <Button
                  onClick={() => allDataFileRef.current?.click()}
                  disabled={isImporting}
                  className="w-full"
                  variant={importType === 'all' ? 'default' : 'outline'}
                >
                  {isImporting && importType === 'all' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {successfulImports.has('all') ? 'Importer un autre backup' : 'Choisir un fichier'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Import Result */}
          {importResult && (
            <Card className={`mt-6 p-4 sm:p-6 border-2 transition-all animate-in slide-in-from-top-2 duration-300 ${
              importResult.success 
                ? 'border-green-300 bg-green-50 shadow-green-100 shadow-lg' 
                : 'border-red-300 bg-red-50 shadow-red-100 shadow-lg'
            }`}>
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 text-base ${
                    importResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {importResult.success ? '✅ Importation réussie' : '❌ Erreur d\'importation'}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    importResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {importResult.message}
                  </p>
                  {importResult.success && (
                    <div className="flex items-center gap-4 text-xs text-green-600">
                      {importResult.importedCount && (
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {importResult.importedCount} réponse(s) importée(s)
                        </span>
                      )}
                      {importResult.importedSurveys !== undefined && (
                        <>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {importResult.importedSurveys} questionnaire(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {importResult.importedResponses} réponse(s)
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {importResult.success && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setImportResult(null)}
                        className="text-green-700 border-green-300 hover:bg-green-100"
                      >
                        Masquer ce message
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </section>

        {/* Export Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Download className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Exporter des données</h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Export All */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exporter toutes les données</h3>
                  <p className="text-sm text-gray-600">
                    Téléchargez tous vos questionnaires et réponses dans un fichier de backup
                  </p>
                </div>
                <Button
                  onClick={handleExportAllSurveys}
                  className="w-full sm:w-auto"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter tout
                </Button>
              </div>
            </Card>

            {/* Individual Survey Exports */}
            {surveys.length > 0 && (
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Exporter des questionnaires individuels</h3>
                <div className="space-y-3">
                  {surveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{survey.title}</h4>
                        <p className="text-sm text-gray-600">
                          {survey.questions.length} questions • {getResponsesBySurveyId(survey.id).length} réponses
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleExportSurvey(survey.id)}
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Q
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            exportResponsesAsCSV(survey.id);
                            toast.success('Réponses exportées en CSV');
                          }}
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          CSV
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            exportFullSurveyData(survey.id);
                            toast.success('Données complètes exportées');
                          }}
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Tout
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {surveys.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-gray-600">
                  Aucun questionnaire à exporter. Créez d'abord des questionnaires.
                </p>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
