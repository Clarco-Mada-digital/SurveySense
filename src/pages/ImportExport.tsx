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
              Import / Export
            </h1>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Import Section */}
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Upload className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100">Importer des données</h2>
          </div>

          {/* Import Type Selection */}
          <Card className="p-4 sm:p-6 mb-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type d'importation
                </label>
                <Select value={importType} onValueChange={(value: any) => setImportType(value)}>
                  <SelectTrigger className="bg-slate-700/50 border-white/10 text-gray-100 focus:border-blue-500/30">
                    <SelectValue placeholder="Choisissez le type d'importation" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border border-white/10">
                    <SelectItem value="survey" className="text-gray-100 focus:bg-blue-500/20">Importer un questionnaire</SelectItem>
                    <SelectItem value="responses" className="text-gray-100 focus:bg-blue-500/20">Importer des réponses</SelectItem>
                    <SelectItem value="all" className="text-gray-100 focus:bg-blue-500/20">Importer toutes les données (backup)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Survey Selection for Responses */}
              {importType === 'responses' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Questionnaire cible
                  </label>
                  <Select value={targetSurveyId} onValueChange={setTargetSurveyId}>
                    <SelectTrigger className="bg-slate-700/50 border-white/10 text-gray-100 focus:border-blue-500/30">
                      <SelectValue placeholder="Sélectionnez un questionnaire" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border border-white/10">
                      {surveys.map((survey) => (
                        <SelectItem key={survey.id} value={survey.id} className="text-gray-100 focus:bg-blue-500/20">
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
            <Card className={`p-4 sm:p-6 border-2 transition-all relative overflow-hidden bg-slate-800/60 backdrop-blur-sm ${
              importType === 'survey' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10'
            } ${successfulImports.has('survey') ? 'ring-2 ring-green-400 ring-opacity-30' : ''}`}>
              {successfulImports.has('survey') && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-gray-100">Questionnaire</h3>
                </div>
                <p className="text-sm text-gray-400">
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
            <Card className={`p-4 sm:p-6 border-2 transition-all relative overflow-hidden bg-slate-800/60 backdrop-blur-sm ${
              importType === 'responses' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10'
            } ${successfulImports.has('responses') ? 'ring-2 ring-green-400 ring-opacity-30' : ''}`}>
              {successfulImports.has('responses') && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-gray-100">Réponses</h3>
                </div>
                <p className="text-sm text-gray-400">
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
            <Card className={`p-4 sm:p-6 border-2 transition-all relative overflow-hidden bg-slate-800/60 backdrop-blur-sm ${
              importType === 'all' ? 'border-green-500 bg-green-500/10' : 'border-white/10'
            } ${successfulImports.has('all') ? 'ring-2 ring-green-400 ring-opacity-30' : ''}`}>
              {successfulImports.has('all') && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-gray-100">Backup complet</h3>
                </div>
                <p className="text-sm text-gray-400">
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
            <Card className={`mt-6 p-4 sm:p-6 border-2 transition-all animate-in slide-in-from-top-2 duration-300 bg-slate-800/60 backdrop-blur-sm ${
              importResult.success 
                ? 'border-green-400 bg-green-500/10 shadow-green-400/20 shadow-lg' 
                : 'border-red-400 bg-red-500/10 shadow-red-400/20 shadow-lg'
            }`}>
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 text-base ${
                    importResult.success ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {importResult.success ? '✅ Importation réussie' : '❌ Erreur d\'importation'}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    importResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {importResult.message}
                  </p>
                  {importResult.success && (
                    <div className="flex items-center gap-4 text-xs text-green-400">
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
                    <div className="mt-3 pt-3 border-t border-green-400/30">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setImportResult(null)}
                        className="text-green-400 border-green-500/30 hover:bg-green-500/10"
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
            <Download className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100">Exporter des données</h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Export All */}
            <Card className="p-4 sm:p-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-100 mb-2">Exporter toutes les données</h3>
                  <p className="text-sm text-gray-400">
                    Téléchargez tous vos questionnaires et réponses dans un fichier de backup
                  </p>
                </div>
                <Button
                  onClick={handleExportAllSurveys}
                  className="w-full sm:w-auto border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter tout
                </Button>
              </div>
            </Card>

            {/* Individual Survey Exports */}
            {surveys.length > 0 && (
              <Card className="p-4 sm:p-6 bg-slate-800/60 backdrop-blur-sm border border-white/10">
                <h3 className="font-semibold text-gray-100 mb-4">Exporter des questionnaires individuels</h3>
                <div className="space-y-3">
                  {surveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-slate-700/30 rounded-lg border border-white/5"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-100 truncate">{survey.title}</h4>
                        <p className="text-sm text-gray-400">
                          {survey.questions.length} questions • {getResponsesBySurveyId(survey.id).length} réponses
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleExportSurvey(survey.id)}
                          variant="outline"
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
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
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
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
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
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
              <Card className="p-6 text-center bg-slate-800/60 backdrop-blur-sm border border-white/10">
                <p className="text-gray-400">
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
