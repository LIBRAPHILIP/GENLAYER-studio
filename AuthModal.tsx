import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Mail, Chrome, Wallet, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Initialize profile if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success('Logged in with Google');
      onClose();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Google Login is not enabled in Firebase Console');
      } else {
        toast.error('Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;

      // Initialize profile if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success('Logged in with GitHub');
      onClose();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('GitHub Login is not enabled in Firebase Console');
      } else {
        toast.error('GitHub login failed. Ensure GitHub auth is enabled in Firebase Console.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully');
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // Initialize profile
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });

        toast.success('Account created successfully');
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email Auth is not enabled in Firebase Console');
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.success('Reset email sent');
      setMode('login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async (type: 'metamask' | 'okx') => {
    try {
      setLoading(true);
      let provider: any = null;
      
      if (type === 'metamask') {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          if ((window as any).ethereum.providers) {
            provider = (window as any).ethereum.providers.find((p: any) => p.isMetaMask);
          } else if ((window as any).ethereum.isMetaMask) {
            provider = (window as any).ethereum;
          }
        }
      } else if (type === 'okx') {
        if (typeof window !== 'undefined' && (window as any).okxwallet) {
          provider = (window as any).okxwallet;
        }
      }

      if (!provider) {
        toast.error(`${type === 'metamask' ? 'MetaMask' : 'OKX Wallet'} not found. Please install the extension.`);
        return;
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        toast.success(`Connected ${type === 'metamask' ? 'MetaMask' : 'OKX Wallet'}`);
        
        if (auth.currentUser) {
           await setDoc(doc(db, 'users', auth.currentUser.uid), {
             walletAddress: address,
             updatedAt: new Date().toISOString()
           }, { merge: true });
        }
        
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#12161F] border-slate-800 text-white sm:max-w-[420px] p-0 overflow-hidden">
        <div className="p-8 space-y-6">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join GenLayer' : 'Reset Password'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {mode === 'login' 
                ? 'Continue your intelligent contract journey.' 
                : mode === 'signup' 
                ? 'Start building verified LLM consensus apps today.' 
                : 'Enter your email to receive a reset link.'}
            </DialogDescription>
          </DialogHeader>

          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 font-bold"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button 
                variant="outline" 
                className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 font-bold"
                onClick={handleGithubLogin}
                disabled={loading}
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#12161F] px-4 text-slate-500 font-bold tracking-widest leading-none">
                  Or with email
                </span>
              </div>
            </div>
          )}

          <form onSubmit={mode === 'forgot' ? handleForgotPassword : handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-slate-500">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="developer@genlayer.io" 
                className="bg-slate-900 border-slate-800 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-slate-500">Password</Label>
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="text-[10px] uppercase font-black tracking-widest text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot?
                  </button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-slate-900 border-slate-800 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 h-auto text-lg tracking-tight" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {mode === 'login' ? 'SIGN IN' : mode === 'signup' ? 'GET STARTED' : 'SEND RESET LINK'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 font-bold py-6 h-auto"
              onClick={() => connectWallet('metamask')}
              disabled={loading}
            >
              <Wallet className="w-5 h-5 mr-3 text-orange-500" />
              MetaMask
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 font-bold py-6 h-auto"
              onClick={() => connectWallet('okx')}
              disabled={loading}
            >
              <Wallet className="w-5 h-5 mr-3 text-white" />
              OKX Wallet
            </Button>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 font-bold">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="ml-2 text-indigo-400 hover:text-indigo-300"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
