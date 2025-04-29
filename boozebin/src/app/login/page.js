'use client';
import Link from 'next/link';
import { Button, Input } from "@heroui/react";
import supabase from '@/supabaseClient';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlertNotification from '@/components/ui/AlertNotification';
import LogoHeader from '@/components/ui/LogoHeader';
import Remember from '@/components/ui/Remember';

const LoginForm = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  rememberMe, 
  setRememberMe, 
  isLoading, 
  onSubmit 
}) => (
  <form className="space-y-6" onSubmit={onSubmit}>
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-purple-200">
        Email
      </label>
      <Input
        placeholder="your.email@example.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        classNames={{
          input: [
            "bg-black/40",
            "text-white",
            "border",
            "border-purple-500/50",
            "focus:border-purple-500",
            "rounded-lg",
            "w-full"
          ]
        }}
      />
    </div>
    
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-purple-200">
        Password
      </label>
      <Input
        placeholder="••••••••"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        classNames={{
          input: [
            "bg-black/40",
            "text-white",
            "border",
            "border-purple-500/50",
            "focus:border-purple-500",
            "rounded-lg",
            "w-full"
          ]
        }}
      />
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-purple-200">
          Remember me
        </label>
      </div>
      
      <div className="text-sm">
        <Link href="/forgot-password" className="text-purple-400 hover:text-white">
          Forgot password?
        </Link>
      </div>
    </div>
    
    <div className="w-full pt-4">
      <Button
        className={`relative w-full ${isLoading ? 'bg-purple-800' : 'bg-gradient-to-r from-purple-600 to-purple-900'} text-white shadow-lg hover:opacity-90 transition-all duration-300`}
        radius="lg"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </div>
  </form>
);

const RegisterLink = () => (
  <div className="flex justify-center mt-6">
    <p className="text-purple-200">
      Don't have an account?{' '}
      <Link className="text-purple-400 hover:text-white font-semibold hover:underline transition-all duration-200" href="/register">
        Register
      </Link>
    </p>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowAlert(false);
    
    if (!email || !password) {
      setAlertMessage('Please enter both email and password');
      setAlertType('error');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
      }
      
      setAlertMessage('Login successful! Redirecting...');
      setAlertType('success');
      setShowAlert(true);
      
      setTimeout(() => router.push('/'), 1500);
    } catch (error) {
      setAlertMessage(error.message || 'An unexpected error occurred');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <Remember>
      <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-tr from-black via-purple-900 to-black py-8">
        <div className="shadow-xl px-8 pb-8 pt-12 rounded-xl space-y-8 bg-black/30 backdrop-blur-md border border-purple-500/20 max-w-md w-full">
          <LogoHeader title="Log In" />
          
          <AlertNotification 
            show={showAlert}
            message={alertMessage}
            type={alertType}
            onClose={() => setShowAlert(false)}
          />
          
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            isLoading={isLoading}
            onSubmit={handleLogin}
          />
          
          <RegisterLink />
        </div>
      </div>
    </Remember>
  );
}