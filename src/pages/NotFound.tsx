import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-center">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative space-y-6 max-w-md">
        <div className="space-y-3">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">404</h1>
          <h2 className="text-2xl font-semibold text-gray-100">Page Non Trouvée</h2>
          <p className="text-gray-400">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}

