import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import CreateSurvey from './pages/CreateSurvey';
import SurveyList from './pages/SurveyList';
import AnswerSurvey from './pages/AnswerSurvey';
import SurveyResults from './pages/SurveyResults';
import ImportExport from './pages/ImportExport';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateSurvey />} />
          <Route path="/edit/:id" element={<CreateSurvey />} />
          <Route path="/surveys" element={<SurveyList />} />
          <Route path="/answer/:id" element={<AnswerSurvey />} />
          <Route path="/results/:id" element={<SurveyResults />} />
          <Route path="/import-export" element={<ImportExport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
