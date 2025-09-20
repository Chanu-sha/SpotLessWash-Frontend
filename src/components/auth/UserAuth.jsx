import React, { useContext, useState, useEffect } from "react";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import { UserContext } from "../../context/UserContext";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const UserAuth = ({ sendTokenToBackend }) => {
  const { updateRole } = useContext(UserContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        // Already signed in & verified
      }
    });
    return () => unsubscribe();
  }, []);

  // ========= Email/Password Sign In =========
  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (!result.user.emailVerified) {
        await signOut(auth);
        toast.error(
          "Your email is not verified. Please check your inbox or resend verification."
        );
        setShowVerificationMessage(true);
        setVerificationEmail(email);
        return;
      }

      await sendTokenToBackend(result.user);
      updateRole();
      toast.success("Welcome back!");
    } catch (error) {
      console.error("Sign In Error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email. Please sign up!");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error(
          "Access to this account has been temporarily disabled due to many failed login attempts. Try again later or reset password."
        );
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Invalid credentials. Please check your email and password.");
      } else {
        toast.error(error.message || "Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========= Email/Password Sign Up =========
  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields: Full Name, Email, and Password.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const newUserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(newUserCredential.user, { displayName: fullName });

      await sendEmailVerification(newUserCredential.user);
      await signOut(auth);

      toast.success("Account created! Please check your email for a verification link.");
      setShowVerificationMessage(true);
      setVerificationEmail(email);
      setIsRegistering(false);

      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error) {
      console.error("Sign Up Error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email address is already registered. Please try signing in!");
      } else if (error.code === "auth/weak-password") {
        toast.error("The password is too weak. Please choose a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("The email address is not valid. Please enter a valid email.");
      } else {
        toast.error(error.message || "Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========= Resend Verification Email =========
  const handleResendVerification = async () => {
    if (!verificationEmail) {
      toast.error("No email found to resend verification.");
      return;
    }
    setLoading(true);
    try {
      toast.info(
        "Please sign in again. If your email is unverified, you'll be prompted to resend verification email."
      );
    } catch (error) {
      console.error("Resend Verification Error:", error);
      toast.error("Failed to resend verification email. Please try signing in again.");
    } finally {
      setLoading(false);
    }
  };

  // ========= Native Google Sign In ONLY =========
  const handleNativeGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Configure Firebase Authentication Plugin
      await FirebaseAuthentication.configure({
        skipNativeAuth: false,
        providers: ["google.com"],
        serverClientId: "231824837114-80sd16itpbi8bu729q2e5kk8sd03d8k6.apps.googleusercontent.com",
      });

      // Start Google Sign-In Flow
      const result = await FirebaseAuthentication.signInWithGoogle({
        serverClientId: "231824837114-80sd16itpbi8bu729q2e5kk8sd03d8k6.apps.googleusercontent.com",
      });

      if (!result.credential?.idToken) {
        throw new Error("No ID token returned from Google.");
      }

      // Create Firebase credential with Google token
      const googleCredential = GoogleAuthProvider.credential(result.credential.idToken);
      
      // Sign in to Firebase with Google credential
      const firebaseUserCredential = await signInWithCredential(auth, googleCredential);

      if (!firebaseUserCredential.user) {
        throw new Error("Firebase sign-in with Google credential failed.");
      }

      // Send token to backend and update role
      await sendTokenToBackend(firebaseUserCredential.user);
      updateRole();
      toast.success("Successfully signed in with Google!");

    } catch (error) {
      console.error("Native Google Sign-In Error:", error);
      
      if (error.code === "USER_CANCELLED") {
        toast.info("Google Sign-In cancelled.");
      } else if (error.code === "DEVELOPER_ERROR" || error.message?.includes("10:")) {
        toast.error("Google Sign-In configuration error. Check SHA-1 fingerprint setup.");
      } else if (error.message?.includes("12501")) {
        toast.info("Google Sign-In cancelled by user.");
      } else if (error.message?.includes("12500")) {
        toast.error("Google Sign-In service is currently unavailable.");
      } else if (error.message?.includes("network")) {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error(`Google Sign-In failed: ${error.message || "Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ========= Forgot Password =========
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address to reset password.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check inbox/spam folder.");
    } catch (error) {
      console.error("Forgot Password Error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("The email address is not valid.");
      } else {
        toast.error(error.message || "Failed to send password reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========= Handle Back to Auth Screen =========
  const handleBackToAuth = () => {
    setShowVerificationMessage(false);
    setVerificationEmail("");
  };

  // ========= UI Rendering Logic =========
  if (showVerificationMessage) {
    return (
      <div className="space-y-4 text-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800">
            <h3 className="font-semibold mb-2">Check Your Email!</h3>
            <p className="text-sm mb-3">
              We've sent a verification link to <strong>{verificationEmail}</strong>.
            </p>
            <p className="text-sm mb-3">
              Please click the link in your email to verify your account. Then, you can sign in.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>

          <button
            onClick={handleBackToAuth}
            className="w-full border border-gray-300 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Back to Sign In
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Didn't receive the email? Check spam/junk folder or try resending.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isRegistering ? "Create Your Account" : "Sign In to Your Account"}
      </h2>

      {isRegistering && (
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Full Name"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      )}

      <div className="relative">
        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="password"
          placeholder={isRegistering ? "Password (min 6 characters)" : "Password"}
          autoComplete={isRegistering ? "new-password" : "current-password"}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {isRegistering ? (
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors font-medium"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      ) : (
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors font-medium"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between text-sm mt-4">
        <p className="mb-2 sm:mb-0">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="ml-1 text-blue-600 font-medium hover:underline"
          >
            {isRegistering ? "Sign In" : "Sign Up"}
          </button>
        </p>
        {!isRegistering && (
          <button
            onClick={handleForgotPassword}
            className="text-blue-600 hover:underline font-medium"
          >
            Forgot Password?
          </button>
        )}
      </div>

      <div className="my-6 flex items-center">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-4 text-gray-500 font-medium">OR</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Native Google Sign-In Button */}
      <button
        onClick={handleNativeGoogleSignIn}
        disabled={loading}
        className="w-full bg-white border-2 border-gray-300 py-3 rounded-lg flex justify-center items-center disabled:opacity-50 hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span>Signing in with Google...</span>
          </>
        ) : (
          <>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google icon"
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </>
        )}
      </button>
    </div>
  );
};

export default UserAuth;