import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Fingerprint, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

// Biometric authentication utilities
const BiometricAuth = {
  // Check if WebAuthn is supported
  isSupported: (): boolean => {
    return !!(navigator.credentials && navigator.credentials.create);
  },

  // Check if biometric authentication is available
  isAvailable: async (): Promise<boolean> => {
    if (!BiometricAuth.isSupported()) return false;
    
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  },

  // Register biometric credential
  register: async (userEmail: string): Promise<Credential | null> => {
    if (!BiometricAuth.isSupported()) {
      throw new Error('WebAuthn is not supported');
    }

    // Create a shorter, more reliable challenge
    const challenge = new Uint8Array(16);
    crypto.getRandomValues(challenge);

    // Create a simple user ID
    const userId = new TextEncoder().encode(userEmail.substring(0, 20));

    const credentialCreationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: challenge,
        rp: {
          name: "The Broken Column",
          id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
        },
        user: {
          id: userId,
          name: userEmail,
          displayName: userEmail.split('@')[0], // Use just the username part
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" as const },
          { alg: -257, type: "public-key" as const }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "discouraged", // Changed to discouraged for better compatibility
          requireResidentKey: false,
          residentKey: "discouraged"
        },
        timeout: 30000, // Reduced timeout to 30 seconds
        attestation: "none",
        excludeCredentials: [] // Explicitly set empty array
      }
    };

    console.log('Creating biometric credential with options:', credentialCreationOptions);

    try {
      const credential = await Promise.race([
        navigator.credentials.create(credentialCreationOptions),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Biometric setup took too long')), 35000)
        )
      ]) as Credential | null;

      if (credential) {
        // Store credential info locally for demo purposes
        const publicKeyCredential = credential as PublicKeyCredential;
        const credentialId = Array.from(new Uint8Array(publicKeyCredential.rawId))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        localStorage.setItem(`biometric_${userEmail}`, credentialId);
        console.log('Biometric credential created successfully');
        return credential;
      }
      throw new Error('Failed to create credential - no credential returned');
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw error;
    }
  },

  // Authenticate with biometric
  authenticate: async (userEmail: string): Promise<Credential | null> => {
    if (!BiometricAuth.isSupported()) {
      throw new Error('WebAuthn is not supported');
    }

    const storedCredentialId = localStorage.getItem(`biometric_${userEmail}`);
    if (!storedCredentialId) {
      throw new Error('No biometric credential found for this user');
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Convert stored credential ID back to Uint8Array
    const credentialIdArray = new Uint8Array(
      storedCredentialId.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const credentialRequestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: challenge,
        allowCredentials: [{
          id: credentialIdArray,
          type: 'public-key'
        }],
        timeout: 60000,
        userVerification: "preferred" // Changed from "required" to "preferred"
      }
    };

    try {
      const credential = await navigator.credentials.get(credentialRequestOptions);
      return credential;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  }
};

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const { user, login } = useAuth();

  // Check biometric availability on component mount
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await BiometricAuth.isAvailable();
      setBiometricAvailable(available);
    };

    checkBiometric();
  }, []);

  // Check if biometric is registered for the current email
  useEffect(() => {
    if (email) {
      const registered = localStorage.getItem(`biometric_${email}`) !== null;
      setBiometricRegistered(registered);
    } else {
      setBiometricRegistered(false);
    }
  }, [email]);

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!email) {
      alert('Please enter your email address first');
      return;
    }

    setIsBiometricLoading(true);
    
    try {
      const credential = await BiometricAuth.authenticate(email);
      
      if (credential) {
        // For demo purposes, we'll simulate successful authentication
        // In a real app, you'd send the credential to your backend for verification
        console.log('Biometric authentication successful:', credential);
        
        // Simulate successful login - you'd replace this with actual login logic
        alert('Biometric authentication successful! (Demo mode)');
        // await login(email, 'biometric-auth');
      }
      
    } catch (error) {
      console.error('Biometric login failed:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Biometric authentication was cancelled or failed. Please try again or use password login.');
        } else if (error.name === 'NotSupportedError') {
          alert('Biometric authentication is not supported on this device.');
        } else if (error.message.includes('No biometric credential found')) {
          alert('No biometric credential found. Please set up biometric authentication first.');
          setBiometricRegistered(false);
        } else {
          alert('Biometric authentication failed. Please try again or use password login.');
        }
      }
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleBiometricSetup = async () => {
    if (!email) {
      alert('Please enter your email address first');
      return;
    }

    // Check if already registered
    if (localStorage.getItem(`biometric_${email}`)) {
      alert('Biometric authentication is already set up for this account!');
      setBiometricRegistered(true);
      setShowBiometricSetup(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting biometric setup for:', email);
      
      const credential = await BiometricAuth.register(email);
      
      if (credential) {
        setBiometricRegistered(true);
        setShowBiometricSetup(false);
        
        alert('Biometric authentication has been set up successfully! You can now use it to log in.');
      }
      
    } catch (error) {
      console.error('Biometric setup failed:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Biometric setup was cancelled. Please try again when ready.');
        } else if (error.name === 'NotSupportedError') {
          alert('Biometric authentication is not supported on this device or browser.');
        } else if (error.name === 'InvalidStateError') {
          alert('A biometric credential already exists for this account.');
          setBiometricRegistered(true);
          setShowBiometricSetup(false);
        } else if (error.name === 'AbortError') {
          alert('Biometric setup was interrupted. Please try again.');
        } else if (error.message.includes('Timeout')) {
          alert('Biometric setup timed out. Please try again and complete the biometric verification quickly.');
        } else {
          alert(`Setup failed: ${error.message}. Please try again.`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - The Broken Column</title>
      </Helmet>

      <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8"
        >
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Admin Portal</h2>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">Sign in to manage your content</p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || isBiometricLoading}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-2.5 sm:py-3 px-4 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </motion.form>

          {/* Biometric Authentication Section */}
          {biometricAvailable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-gray-400">or</span>
                </div>
              </div>

              {biometricRegistered ? (
                <motion.button
                  onClick={handleBiometricLogin}
                  disabled={isBiometricLoading || isLoading || !email}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 sm:py-3 px-4 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isBiometricLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Fingerprint size={18} />
                      <span>Sign in with Biometric</span>
                    </div>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowBiometricSetup(true)}
                  disabled={isBiometricLoading || isLoading || !email}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 sm:py-3 px-4 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Shield size={18} />
                    <span>Set up Biometric Login</span>
                  </div>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Biometric Setup Modal */}
          {showBiometricSetup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 rounded-lg p-6 max-w-md w-full"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Set up Biometric Authentication</h3>
                <p className="text-gray-300 mb-6 text-sm">
                  Enable biometric authentication (fingerprint, face, or other biometric methods) for faster and more secure login.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleBiometricSetup}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Setting up...' : 'Enable'}
                  </button>
                  <button
                    onClick={() => setShowBiometricSetup(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          <div className="text-center pt-2 sm:pt-4">
            <p className="text-gray-400 text-xs sm:text-sm px-4 leading-relaxed">
              {biometricAvailable && (
                <span className="block text-green-400 mb-2">
                  🔒 Biometric authentication available
                </span>
              )}
              <span className="block sm:inline sm:ml-1">
                Secure admin access for content management
              </span>
            </p>
          </div>

          {/* Background decoration for larger screens */}
          <div className="hidden sm:block absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl"></div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;



// import React, { useState } from 'react';
// import { Navigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { Helmet } from 'react-helmet-async';



// const AdminLogin: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { user, login } = useAuth();

//   if (user) {
//     return <Navigate to="/admin" replace />;
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       await login(email, password);
//     } catch (error) {
//       console.error('Login failed:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Admin Login - The Broken Column</title>
//       </Helmet>

//       <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8"
//         >
//           <div className="text-center">
//             <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Admin Portal</h2>
//             <p className="text-gray-300 mt-2 text-sm sm:text-base">Sign in to manage your content</p>
//           </div>

//           <motion.form
//             onSubmit={handleSubmit}
//             className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//           >
//             <div className="space-y-3 sm:space-y-4">
//               <div>
//                 <label htmlFor="email" className="sr-only">Email address</label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent backdrop-blur-sm text-sm sm:text-base"
//                     placeholder="Email address"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="password" className="sr-only">Password</label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                   <input
//                     id="password"
//                     name="password"
//                     type={showPassword ? 'text' : 'password'}
//                     autoComplete="current-password"
//                     required
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent backdrop-blur-sm text-sm sm:text-base"
//                     placeholder="Password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <motion.button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-2.5 sm:py-3 px-4 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center space-x-2">
//                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                   <span>Signing in...</span>
//                 </div>
//               ) : (
//                 'Sign in'
//               )}
//             </motion.button>
//           </motion.form>

//           <div className="text-center pt-2 sm:pt-4">
//             <p className="text-gray-400 text-xs sm:text-sm px-4 leading-relaxed">
              
//               <span className="block sm:inline sm:ml-1">
                
//               </span>
//             </p>
//           </div>

//           {/* Background decoration for larger screens */}
//           <div className="hidden sm:block absolute inset-0 -z-10 overflow-hidden">
//             <div className="absolute -top-40 -right-32 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl"></div>
//             <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl"></div>
//           </div>
//         </motion.div>
//       </div>
//     </>
//   );
// };

// export default AdminLogin;
