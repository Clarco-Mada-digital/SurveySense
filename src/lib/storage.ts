import { Survey, SurveyResponse } from '@/types/survey';

const SURVEYS_KEY = 'surveys';
const RESPONSES_KEY = 'survey_responses';

// Survey CRUD operations
export const saveSurvey = (survey: Survey): void => {
  const surveys = getSurveys();
  const existingIndex = surveys.findIndex(s => s.id === survey.id);
  
  if (existingIndex >= 0) {
    surveys[existingIndex] = survey;
  } else {
    surveys.push(survey);
  }
  
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
};

export const getSurveys = (): Survey[] => {
  const data = localStorage.getItem(SURVEYS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getSurveyById = (id: string): Survey | null => {
  const surveys = getSurveys();
  return surveys.find(s => s.id === id) || null;
};

export const deleteSurvey = (id: string): void => {
  const surveys = getSurveys().filter(s => s.id !== id);
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
  
  // Also delete associated responses
  const responses = getResponses().filter(r => r.surveyId !== id);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
};

// Response CRUD operations
export const saveResponse = (response: SurveyResponse): void => {
  const responses = getResponses();
  responses.push(response);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
};

export const getResponses = (): SurveyResponse[] => {
  const data = localStorage.getItem(RESPONSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getResponsesBySurveyId = (surveyId: string): SurveyResponse[] => {
  return getResponses().filter(r => r.surveyId === surveyId);
};

// Export functions
export const exportSurveyAsJSON = (survey: Survey): void => {
  const dataStr = JSON.stringify(survey, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `survey_${survey.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportResponsesAsCSV = (surveyId: string): void => {
  const survey = getSurveyById(surveyId);
  const responses = getResponsesBySurveyId(surveyId);
  
  if (!survey || responses.length === 0) return;
  
  // Create CSV header
  const headers = ['Response ID', 'Submitted At', ...survey.questions.map(q => q.question)];
  
  // Create CSV rows
  const rows = responses.map(response => {
    const row = [response.id, response.submittedAt];
    survey.questions.forEach(question => {
      const answer = response.answers.find(a => a.questionId === question.id);
      if (answer) {
        if (Array.isArray(answer.value)) {
          row.push(answer.value.join('; '));
        } else {
          row.push(String(answer.value));
        }
      } else {
        row.push('');
      }
    });
    return row;
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `responses_${surveyId}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportFullSurveyData = (surveyId: string): void => {
  const survey = getSurveyById(surveyId);
  const responses = getResponsesBySurveyId(surveyId);
  
  if (!survey) return;
  
  const fullData = {
    survey,
    responses,
    exportedAt: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(fullData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `full_survey_${surveyId}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Import functions
export const importSurveyFromFile = (file: File): Promise<{ success: boolean; message: string; survey?: Survey }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate survey structure
        if (!data.id || !data.title || !data.questions || !Array.isArray(data.questions)) {
          resolve({ 
            success: false, 
            message: 'Format de fichier invalide. Le fichier doit contenir un questionnaire valide.' 
          });
          return;
        }
        
        // Check if survey already exists
        const existingSurvey = getSurveyById(data.id);
        if (existingSurvey) {
          resolve({ 
            success: false, 
            message: 'Ce questionnaire existe déjà. Veuillez le supprimer d\'abord ou modifier l\'ID du questionnaire.' 
          });
          return;
        }
        
        // Generate new ID to avoid conflicts
        const importedSurvey: Survey = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Validate questions structure
        for (const question of importedSurvey.questions) {
          if (!question.id || !question.question || !question.type) {
            resolve({ 
              success: false, 
              message: 'Structure des questions invalide. Chaque question doit avoir un ID, un texte et un type.' 
            });
            return;
          }
          
          // Generate new IDs for questions to avoid conflicts
          question.id = generateId();
          if (question.options) {
            question.options = question.options.map(option => ({
              ...option,
              id: generateId()
            }));
          }
        }
        
        saveSurvey(importedSurvey);
        resolve({ 
          success: true, 
          message: 'Questionnaire importé avec succès!', 
          survey: importedSurvey 
        });
        
      } catch (error) {
        resolve({ 
          success: false, 
          message: 'Erreur lors de la lecture du fichier. Vérifiez que le fichier est un JSON valide.' 
        });
      }
    };
    
    reader.onerror = () => {
      resolve({ 
        success: false, 
        message: 'Erreur lors de la lecture du fichier.' 
      });
    };
    
    reader.readAsText(file);
  });
};

export const importResponsesFromFile = (file: File, targetSurveyId: string): Promise<{ success: boolean; message: string; importedCount?: number }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data;
        
        console.log('🔍 Début importation réponses');
        console.log('📄 Contenu brut:', content.substring(0, 200) + '...');
        
        // Try to parse as full survey data first
        try {
          data = JSON.parse(content);
          console.log('📊 Données parsées:', data);
          
          // Prioritize survey + responses format over responses array
          if (data.survey && data.responses && Array.isArray(data.responses)) {
            console.log('✅ Format: survey + responses trouvé');
            console.log('📋 Questions dans survey:', data.survey.questions?.length || 0);
            // Keep the full data structure for mapping
            // Don't overwrite data here, we'll use the full structure below
          } else if (data.responses && Array.isArray(data.responses)) {
            console.log('✅ Format: responses array trouvé, réponses:', data.length);
            data = data.responses;
          } else if (!Array.isArray(data)) {
            console.log('❌ Format invalide: pas un array');
            resolve({ 
              success: false, 
              message: 'Format de fichier invalide. Le fichier doit contenir des réponses valides.' 
            });
            return;
          } else {
            console.log('✅ Format: array direct trouvé, réponses:', data.length);
          }
        } catch (parseError) {
          console.log('❌ Erreur parsing JSON:', parseError);
          resolve({ 
            success: false, 
            message: 'Erreur lors de l\'analyse du fichier JSON.' 
          });
          return;
        }
        
        // Validate target survey exists
        const targetSurvey = getSurveyById(targetSurveyId);
        if (!targetSurvey) {
          console.log('❌ Questionnaire cible non trouvé:', targetSurveyId);
          resolve({ 
            success: false, 
            message: 'Le questionnaire cible n\'existe pas.' 
          });
          return;
        }
        
        console.log('🎯 Questionnaire cible trouvé:', targetSurvey.title);
        console.log('📝 Questions dans questionnaire cible:', targetSurvey.questions.length);
        
        let importedCount = 0;
        const existingResponses = getResponsesBySurveyId(targetSurveyId);
        const existingResponseIds = new Set(existingResponses.map(r => r.id));
        
        console.log('🔄 Réponses existantes:', existingResponses.length);
        
        // Create question ID mapping if survey is included in export
        let questionIdMapping: Record<string, string> = {};
        let responsesToProcess = data;
        
        // Check if we have the full data structure (survey + responses)
        if (typeof data === 'object' && data.survey && data.responses && Array.isArray(data.responses)) {
          console.log('🗺️ Création mapping questions depuis structure complète...');
          responsesToProcess = data.responses;
          
          // Map questions by text content to find corresponding questions
          data.survey.questions.forEach((exportedQuestion: any) => {
            const matchingQuestion = targetSurvey.questions.find(targetQ => 
              targetQ.question.trim().toLowerCase() === exportedQuestion.question.trim().toLowerCase() &&
              targetQ.type === exportedQuestion.type
            );
            
            if (matchingQuestion) {
              questionIdMapping[exportedQuestion.id] = matchingQuestion.id;
              console.log(`🔗 Mapping: ${exportedQuestion.id} → ${matchingQuestion.id}`);
              console.log(`📝 Question: "${exportedQuestion.question}"`);
            } else {
              console.log(`⚠️ Aucune correspondance pour: ${exportedQuestion.id} - "${exportedQuestion.question}"`);
            }
          });
        } else if (Array.isArray(data)) {
          console.log('⚠️ Pas de questionnaire dans l\'export, utilisation IDs directs');
          // Try to create mapping by matching question text if possible
          data.forEach((responseData: any) => {
            responseData.answers?.forEach((answer: any) => {
              const matchingQuestion = targetSurvey.questions.find(targetQ => 
                targetQ.question === answer.questionText || // Fallback if questionText is available
                targetQ.id === answer.questionId // Direct ID match
              );
              
              if (matchingQuestion && answer.questionId !== matchingQuestion.id) {
                questionIdMapping[answer.questionId] = matchingQuestion.id;
                console.log(`🔄 Fallback mapping: ${answer.questionId} → ${matchingQuestion.id}`);
              }
            });
          });
        }
        
        console.log('📋 Mapping final:', questionIdMapping);
        
        for (const responseData of responsesToProcess) {
          console.log('🔍 Traitement réponse:', responseData.id);
          
          // Validate response structure
          if (!responseData.id || !responseData.answers || !Array.isArray(responseData.answers)) {
            console.log('⚠️ Réponse invalide, skipping');
            continue; // Skip invalid responses
          }
          
          // Skip if response already exists
          if (existingResponseIds.has(responseData.id)) {
            console.log('⚠️ Réponse déjà existe, skipping');
            continue;
          }
          
          // Generate new ID to avoid conflicts
          const importedResponse: SurveyResponse = {
            ...responseData,
            id: generateId(),
            surveyId: targetSurveyId,
            submittedAt: responseData.submittedAt || new Date().toISOString()
          };
          
          // Map question IDs from exported survey to target survey
          const mappedAnswers = importedResponse.answers.map(answer => {
            const mappedQuestionId = questionIdMapping[answer.questionId] || answer.questionId;
            console.log(`🔄 Mapping answer: ${answer.questionId} → ${mappedQuestionId}`);
            return {
              ...answer,
              questionId: mappedQuestionId
            };
          });
          
          console.log('📝 Réponses mappées:', mappedAnswers.length);
          
          // Validate answers match target survey questions (using mapped IDs)
          const validAnswers = mappedAnswers.filter(answer => {
            const isValid = targetSurvey.questions.some(q => q.id === answer.questionId);
            console.log(`✅ Answer ${answer.questionId} valide: ${isValid}`);
            return isValid;
          });
          
          console.log(`📊 Réponses valides: ${validAnswers.length}/${mappedAnswers.length}`);
          
          if (validAnswers.length > 0) {
            importedResponse.answers = validAnswers;
            saveResponse(importedResponse);
            importedCount++;
            console.log(`✅ Réponse importée: ${responseData.id}`);
          } else {
            console.log(`❌ Aucune réponse valide pour: ${responseData.id}`);
          }
        }
        
        console.log(`🎉 Importation terminée: ${importedCount} réponses`);
        
        resolve({ 
          success: true, 
          message: `${importedCount} réponse(s) importée(s) avec succès!`, 
          importedCount 
        });
        
      } catch (error) {
        console.log('❌ Erreur générale:', error);
        resolve({ 
          success: false, 
          message: 'Erreur lors du traitement du fichier.' 
        });
      }
    };
    
    reader.onerror = () => {
      console.log('❌ Erreur lecture fichier');
      resolve({ 
        success: false, 
        message: 'Erreur lors de la lecture du fichier.' 
      });
    };
    
    reader.readAsText(file);
  });
};

// Enhanced export functions
export const exportSurveyOnly = (surveyId: string): void => {
  const survey = getSurveyById(surveyId);
  if (!survey) return;
  
  const dataStr = JSON.stringify(survey, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `survey_${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${survey.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportAllSurveys = (): void => {
  const surveys = getSurveys();
  const allResponses = getResponses();
  
  const exportData = {
    surveys,
    responses: allResponses,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `all_surveys_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importAllDataFromFile = (file: File): Promise<{ success: boolean; message: string; importedSurveys?: number; importedResponses?: number }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.surveys || !Array.isArray(data.surveys)) {
          resolve({ 
            success: false, 
            message: 'Format de fichier invalide. Le fichier doit contenir des questionnaires valides.' 
          });
          return;
        }
        
        let importedSurveys = 0;
        let importedResponses = 0;
        
        // Create mapping between old and new survey IDs
        const surveyIdMapping: Record<string, string> = {};
        const questionIdMapping: Record<string, string> = {};
        
        // Import surveys and create mappings
        for (const surveyData of data.surveys) {
          const existingSurvey = getSurveyById(surveyData.id);
          if (!existingSurvey) {
            const newSurveyId = generateId();
            surveyIdMapping[surveyData.id] = newSurveyId;
            
            const importedSurvey: Survey = {
              ...surveyData,
              id: newSurveyId,
              createdAt: surveyData.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Generate new IDs for questions and options, and create question mapping
            importedSurvey.questions = importedSurvey.questions.map(question => {
              const newQuestionId = generateId();
              questionIdMapping[question.id] = newQuestionId;
              
              return {
                ...question,
                id: newQuestionId,
                options: question.options?.map(option => ({
                  ...option,
                  id: generateId()
                }))
              };
            });
            
            saveSurvey(importedSurvey);
            importedSurveys++;
          }
        }
        
        // Import responses if available
        if (data.responses && Array.isArray(data.responses)) {
          for (const responseData of data.responses) {
            const existingResponse = getResponses().find(r => r.id === responseData.id);
            if (!existingResponse) {
              // Map the old survey ID to the new one
              const newSurveyId = surveyIdMapping[responseData.surveyId];
              
              if (newSurveyId) {
                const importedResponse: SurveyResponse = {
                  ...responseData,
                  id: generateId(),
                  surveyId: newSurveyId, // Use the new survey ID
                  submittedAt: responseData.submittedAt || new Date().toISOString(),
                  // Update question IDs in answers
                  answers: responseData.answers.map(answer => ({
                    ...answer,
                    questionId: questionIdMapping[answer.questionId] || answer.questionId
                  }))
                };
                
                saveResponse(importedResponse);
                importedResponses++;
              }
            }
          }
        }
        
        resolve({ 
          success: true, 
          message: `Importé: ${importedSurveys} questionnaire(s) et ${importedResponses} réponse(s) avec succès!`, 
          importedSurveys, 
          importedResponses 
        });
        
      } catch (error) {
        resolve({ 
          success: false, 
          message: 'Erreur lors de l\'analyse du fichier. Vérifiez que le fichier est un JSON valide.' 
        });
      }
    };
    
    reader.onerror = () => {
      resolve({ 
        success: false, 
        message: 'Erreur lors de la lecture du fichier.' 
      });
    };
    
    reader.readAsText(file);
  });
};

// Enhanced export functions with date filtering
export const exportResponsesWithDateFilter = (
  surveyId: string, 
  startDate?: string, 
  endDate?: string
): void => {
  const survey = getSurveyById(surveyId);
  let responses = getResponsesBySurveyId(surveyId);
  
  if (!survey || responses.length === 0) return;
  
  // Filter by date range
  if (startDate || endDate) {
    responses = responses.filter(response => {
      const responseDate = new Date(response.submittedAt);
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate + 'T23:59:59.999') : new Date('2100-12-31');
      return responseDate >= start && responseDate <= end;
    });
  }
  
  // Create export data in importable format
  const exportData = {
    survey: {
      ...survey,
      exportedAt: new Date().toISOString()
    },
    responses: responses,
    metadata: {
      totalResponses: responses.length,
      dateRange: {
        start: startDate || 'all',
        end: endDate || 'all',
        filtered: !!(startDate || endDate)
      },
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  
  // Create filename with date range
  const dateRange = (startDate || endDate) 
    ? `_${startDate || 'start'}_to_${endDate || 'end'}` 
    : '_all';
  
  link.download = `responses_${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${survey.id}${dateRange}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportResponsesAsCSVWithDateFilter = (
  surveyId: string, 
  startDate?: string, 
  endDate?: string
): void => {
  const survey = getSurveyById(surveyId);
  let responses = getResponsesBySurveyId(surveyId);
  
  if (!survey || responses.length === 0) return;
  
  // Filter by date range
  if (startDate || endDate) {
    responses = responses.filter(response => {
      const responseDate = new Date(response.submittedAt);
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate + 'T23:59:59.999') : new Date('2100-12-31');
      return responseDate >= start && responseDate <= end;
    });
  }
  
  // Create CSV header
  const headers = ['Response ID', 'Submitted At', ...survey.questions.map(q => q.question)];
  
  // Create CSV rows
  const rows = responses.map(response => {
    const row = [response.id, response.submittedAt];
    survey.questions.forEach(question => {
      const answer = response.answers.find(a => a.questionId === question.id);
      if (answer) {
        if (Array.isArray(answer.value)) {
          row.push(answer.value.join('; '));
        } else {
          row.push(String(answer.value));
        }
      } else {
        row.push('');
      }
    });
    return row;
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Create filename with date range
  const dateRange = (startDate || endDate) 
    ? `_${startDate || 'start'}_to_${endDate || 'end'}` 
    : '_all';
  
  link.download = `responses_${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${survey.id}${dateRange}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Get date range statistics for responses
export const getResponsesDateStats = (surveyId: string) => {
  const responses = getResponsesBySurveyId(surveyId);
  
  if (responses.length === 0) {
    return {
      total: 0,
      earliestDate: null,
      latestDate: null,
      dateRange: null
    };
  }
  
  const dates = responses.map(r => new Date(r.submittedAt));
  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return {
    total: responses.length,
    earliestDate: earliestDate.toISOString().split('T')[0],
    latestDate: latestDate.toISOString().split('T')[0],
    dateRange: {
      start: earliestDate.toISOString().split('T')[0],
      end: latestDate.toISOString().split('T')[0]
    }
  };
};
