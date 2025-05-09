'use client';
import Link from 'next/link';
import { Button } from "@heroui/react";
import supabase from '@/supabaseClient';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import the reusable components
import AlertNotification from '@/components/ui/AlertNotification';
import FormInput from '@/components/ui/FormInput';
import LogoHeader from '@/components/ui/LogoHeader';

// Registration form component
const RegisterForm = ({ 
  firstName, 
  setFirstName, 
  lastName, 
  setLastName,
  email, 
  setEmail, 
  password, 
  setPassword, 
  confirmPassword,
  setConfirmPassword,
  isLoading, 
  onSubmit 
}) => (
  <form className="space-y-6" onSubmit={onSubmit}>
    <div className="grid grid-cols-2 gap-4">
      <div className="w-full">
        <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-1">
          First Name
        </label>
        <FormInput
          id="firstName"
          placeholder="John"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          label="" // Remove the label from the FormInput component
        />
      </div>
      <div className="w-full">
        <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-1">
          Last Name
        </label>
        <FormInput
          id="lastName"
          placeholder="Doe"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          label="" // Remove the label from the FormInput component
        />
      </div>
    </div>
    
    <div className="w-full">
      <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
        Email
      </label>
      <FormInput
        id="email"
        placeholder="your.email@example.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        label="" // Remove the label from the FormInput component
      />
    </div>
    
    <div className="w-full">
      <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-1">
        Password
      </label>
      <FormInput
        id="password"
        placeholder="••••••••"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        label="" // Remove the label from the FormInput component
      />
    </div>
    
    <div className="w-full">
      <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-1">
        Confirm Password
      </label>
      <FormInput
        id="confirmPassword"
        placeholder="••••••••"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        label="" // Remove the label from the FormInput component
      />
    </div>
    
    <div className="w-full pt-4">
      <Button
        className={`relative w-full ${isLoading ? 'bg-purple-800' : 'bg-gradient-to-r from-purple-600 to-purple-900'} text-white shadow-lg hover:opacity-90 transition-all duration-300`}
        radius="lg"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? 'Registering...' : 'Create Account'}
      </Button>
    </div>
  </form>
);

// Login link component
const LoginLink = () => (
  <div className="flex justify-center mt-6">
    <p className="text-purple-200">
      Already have an account?{' '}
      <Link className="text-purple-400 hover:text-white font-semibold hover:underline transition-all duration-200" href="/login">
        Sign In
      </Link>
    </p>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();

  // variables for the register form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // variables for form state
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error'); 

  // function to handle the form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowAlert(false); 
    
    if (password !== confirmPassword) {
      setAlertMessage('Passwords do not match');
      setAlertType('error');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setAlertMessage('Password must be at least 6 characters');
      setAlertType('error');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }
    
    try {
      // Register the user with supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) {
        setAlertMessage(error.message);
        setAlertType('error');
        setShowAlert(true);
      } else {
        // Success
        setAlertMessage('Registration successful! Check your email for the verification link.');
        setAlertType('success');
        setShowAlert(true);
        
        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // redirect to login
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      setAlertMessage('An unexpected error occurred. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to dismiss alert after 5 seconds
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-tr from-black via-purple-900 to-black py-8">
      <div className="shadow-xl px-8 pb-8 pt-12 rounded-xl space-y-8 bg-black/30 backdrop-blur-md border border-purple-500/20 max-w-md w-full">
        <LogoHeader title="Register" />
        
        <AlertNotification 
          show={showAlert}
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
        
        <RegisterForm
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          isLoading={isLoading}
          onSubmit={handleRegister}
        />
        
        <LoginLink />
      </div>
    </div>
  );
}