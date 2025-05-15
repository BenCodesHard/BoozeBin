'use client';
import { Alert } from "@heroui/react";
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

/**
 * Reusable alert notification component
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the alert
 * @param {string} props.message - Alert message text
 * @param {string} props.type - Alert type ('error' or 'success')
 * @param {Function} props.onClose - Function to call when closing the alert
 * @param {boolean} props.prominent - Whether to show a larger, more prominent alert
 */
const AlertNotification = ({ show, message, type, onClose, prominent = false }) => {
  if (!show) return null;
  
  if (prominent) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
        <div className={`${
          type === 'error' ? 'bg-red-900/90 border-red-500' : 'bg-green-900/90 border-green-500'
        } border-2 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg text-center`}>
          <div className="flex flex-col items-center gap-3">
            {type === 'success' ? (
              <CheckCircle className="text-green-300 h-12 w-12" />
            ) : (
              <AlertTriangle className="text-red-300 h-12 w-12" />
            )}
            <h3 className={`text-xl font-bold ${type === 'error' ? 'text-red-200' : 'text-green-200'}`}>
              {type === 'success' ? 'Success!' : 'Error'}
            </h3>
            <p className="text-white text-lg">{message}</p>
            <button 
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              onClick={onClose}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Alert
      type={type}
      className={`${type === 'error' ? 'bg-red-500/20 border-red-500/50' : 'bg-green-500/20 border-green-500/50'} border rounded-lg`}
      onClose={onClose}
    >
      <div className="flex items-center">
        <span className={`text-base ${type === 'error' ? 'text-red-200' : 'text-green-200'}`}>
          {message}
        </span>
      </div>
    </Alert>
  );
};

export default AlertNotification;