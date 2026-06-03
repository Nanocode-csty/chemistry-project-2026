'use client';

import { Modal, Button } from './Forms';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción", 
  message = "¿Estás seguro de que deseas realizar esta acción?", 
  confirmText = "Eliminar", 
  cancelText = "Cancelar",
  variant = "danger" 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-full mb-6 ${variant === 'danger' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-teal/10 text-brand-teal'}`}>
          <AlertTriangle className="w-12 h-12" />
        </div>
        
        <p className="text-gray-600 mb-8 text-lg font-sans">
          {message}
        </p>

        <div className="flex gap-4 w-full">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            fullWidth
          >
            {cancelText.toUpperCase()}
          </Button>
          <Button 
            variant={variant} 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            fullWidth
          >
            {confirmText.toUpperCase()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
