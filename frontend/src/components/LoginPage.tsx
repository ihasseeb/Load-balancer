import React, { useState } from 'react';
import {
  Key,
  Mail,
  Lock,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface LoginPageProps {
  onLogin: (userData: any) => void;
  isDarkMode: boolean;
}

export default function LoginPage({ onLogin, isDarkMode }: LoginPageProps) {
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');

  // State management
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [apiKey, setApiKey] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Login successful! Welcome back.'
        });
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userEmail', email);
        setTimeout(() => onLogin({ email, token: data.token }), 500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Login failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (signupPassword !== signupPasswordConfirm) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          passwordConfirm: signupPasswordConfirm
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Signup successful! You can now login.'
        });
        // Reset form and switch to login tab
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupPasswordConfirm('');
        setTimeout(() => {
          setEmail(signupEmail);
          setPassword(signupPassword);
        }, 500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Signup failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    const key =
      'sk_' +
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);
    setApiKey(key);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-[#0B0C10]' : 'bg-[#F5F6FA]'
      }`}
    >
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#3B82F6] p-3 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1
            className={`mb-2 text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            AI Adaptive Load Balancing
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Professional Dashboard
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? isDarkMode
                  ? 'bg-green-900/30 border border-green-700'
                  : 'bg-green-50 border border-green-200'
                : isDarkMode
                ? 'bg-red-900/30 border border-red-700'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
            <p
              className={
                message.type === 'success'
                  ? 'text-green-400'
                  : isDarkMode
                  ? 'text-red-400'
                  : 'text-red-600'
              }
            >
              {message.text}
            </p>
          </div>
        )}

        <Card
          className={
            isDarkMode
              ? 'bg-[#1F2937] border-gray-800'
              : 'bg-white border-gray-200'
          }
        >
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              Access Dashboard
            </CardTitle>
            <CardDescription
              className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
            >
              Sign up or login to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className={`pl-10 ${
                          isDarkMode
                            ? 'bg-[#374151] border-gray-700 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className={`pl-10 ${
                          isDarkMode
                            ? 'bg-[#374151] border-gray-700 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-medium"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      required
                      className={
                        isDarkMode
                          ? 'bg-[#374151] border-gray-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300'
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="user@example.com"
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        required
                        className={`pl-10 ${
                          isDarkMode
                            ? 'bg-[#374151] border-gray-700 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                    >
                      Password (min 8 characters)
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        required
                        minLength={8}
                        className={`pl-10 ${
                          isDarkMode
                            ? 'bg-[#374151] border-gray-700 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPasswordConfirm}
                        onChange={e => setSignupPasswordConfirm(e.target.value)}
                        required
                        minLength={8}
                        className={`pl-10 ${
                          isDarkMode
                            ? 'bg-[#374151] border-gray-700 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-medium"
                  >
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <footer
          className={`text-center mt-8 text-sm ${
            isDarkMode ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          <p>AI Adaptive Load Balancing | Professional Dashboard © 2026</p>
        </footer>
      </div>
    </div>
  );
}
