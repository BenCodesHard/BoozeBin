'use client';
import { Alert } from "@heroui/react";

/**
 * Reusable alert notification component
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the alert
 * @param {string} props.message - Alert message text
 * @param {string} props.type - Alert type ('error' or 'success')
 * @param {Function} props.onClose - Function to call when closing the alert
 */
const AlertNotification = ({ show, message, type, onClose }) => {
  if (!show) return null;
  
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