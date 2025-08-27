import React, { useContext, useState } from "react";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { toast } from "react-toastify";
import { UserContext } from "../../context/UserContext";

const UserAuth = ({ sendTokenToBackend }) => {
  const { updateRole } = useContext(UserContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  //  Handle Sign In with Email Verification Check
  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Enter email & password");
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!result.user.emailVerified) {
        // Sign out the user immediately
        await signOut(auth);
        toast.error("Please verify your email before signing in!");
        setShowVerificationMessage(true);
        setVerificationEmail(email);
        return;
      }
      
      await sendTokenToBackend(result.user);
      updateRole();
      toast.success("Welcome back 🎉");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found. Please sign up!");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Try again later.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  //  Handle Sign Up with Email Verification
  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast.error("Fill all fields");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      const newUser = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(newUser.user);
      
      // Sign out the user immediately after signup
      await signOut(auth);
      
      toast.success("Account created! Please check your email for verification.");
      setShowVerificationMessage(true);
      setVerificationEmail(email);
      setIsRegistering(false);
      
      // Clear form
      setEmail("");
      setPassword("");
      setFullName("");
      
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already registered. Try signing in!");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak!");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address!");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  //  Resend Verification Email
  const handleResendVerification = async () => {
    if (!verificationEmail) {
      toast.error("No email found to resend verification");
      return;
    }
    
    setLoading(true);
    try {
      // Create a temporary user to send verification
      const tempUser = await signInWithEmailAndPassword(auth, verificationEmail, password);
      await sendEmailVerification(tempUser.user);
      await signOut(auth); // Sign out immediately
      toast.success("Verification email resent! Check your inbox.");
    } catch (error) {
      toast.error("Failed to resend verification email. Try signing up again.");
    } finally {
      setLoading(false);
    }
  };

  //  Google SignIn (Google accounts are automatically verified)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await sendTokenToBackend(result.user);
      updateRole();
      toast.success("Signed in with Google 🎉");
    } catch (error) {
      toast.error(`Google login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  //  Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email first!");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email!");
      } else {
        toast.error(error.message);
      }
    }
  };

  // Hide verification message and go back to normal auth
  const handleBackToAuth = () => {
    setShowVerificationMessage(false);
    setVerificationEmail("");
  };

  // Email Verification Message Screen
  if (showVerificationMessage) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800">
            <h3 className="font-semibold mb-2">Check Your Email!</h3>
            <p className="text-sm mb-3">
              We've sent a verification link to <strong>{verificationEmail}</strong>
            </p>
            <p className="text-sm mb-3">
              Please click the verification link in your email, then come back and sign in.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>
          
          <button
            onClick={handleBackToAuth}
            className="w-full border border-gray-300 py-3 rounded-lg text-gray-700"
          >
            Back to Sign In
          </button>
        </div>
        
        <p className="text-xs text-gray-500">
          Don't see the email? Check your spam folder or try resending.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/*  Sign In Form */}
      {!isRegistering && (
        <>
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {loading ? "Please wait..." : "Sign In"}
          </button>
        </>
      )}

      {/*  Sign Up Form */}
      {isRegistering && (
        <>
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-green-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            By signing up, you'll receive a verification email that must be confirmed before you can sign in.
          </p>
        </>
      )}

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-center">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="ml-2 text-blue-600 font-medium hover:underline"
          >
            {isRegistering ? "Sign In" : "Sign Up"}
          </button>
        </p>
        {!isRegistering && (
          <div className="text-right">
            <button
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}
      </div>

      {/* OR divider */}
      <div className="my-4 flex items-center">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full border py-3 rounded-lg flex justify-center items-center disabled:opacity-50 hover:bg-gray-50 transition-colors"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5 mr-2"
        />
        {loading ? "Please wait..." : "Continue with Google"}
      </button>
    </div>
  );
};

export default UserAuth;