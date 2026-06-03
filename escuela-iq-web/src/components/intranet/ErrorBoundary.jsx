'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Forms';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-gray/30 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-premium p-10 text-center">
            <div className="bg-brand-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-10 h-10 text-brand-red" />
            </div>
            
            <h1 className="text-2xl font-black text-brand-navy mb-4 uppercase tracking-tight">
              Algo salió mal
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              La aplicación encontró un error inesperado. Por favor, intenta recargar la página o volver al inicio.
            </p>

            <div className="space-y-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="primary" 
                fullWidth
              >
                <RefreshCw className="w-4 h-4 mr-2" /> RECARGAR PÁGINA
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="secondary" 
                fullWidth
              >
                <Home className="w-4 h-4 mr-2" /> VOLVER AL INICIO
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-10 p-4 bg-brand-gray rounded-sm text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-brand-red break-words">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
