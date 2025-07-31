import React from "react";
import { FiMail, FiLock } from "react-icons/fi";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { toast } from "react-toastify";

const UserAuth = ({ isRegistering, setIsRegistering, email, setEmail, password, setPassword, sendTokenToBackend }) => {
  const handleEmailAuth = async () => {
    if (!email || !password) return toast.error("Enter email & password");
    try {
      const result = isRegistering
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      await sendTokenToBackend(result.user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await sendTokenToBackend(result.user);
    } catch (error) {
      toast.error(`Google login failed: ${error.message}`);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <FiMail className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            placeholder="Email address"
            className="w-full pl-10 pr-4 py-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <FiLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-10 pr-4 py-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button onClick={handleEmailAuth} className="w-full bg-blue-600 text-white py-3 rounded-lg">
          {isRegistering ? "Create Account" : "Sign In"}
        </button>
      </div>

      <div className="my-4 flex items-center">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button onClick={handleGoogleSignIn} className="w-full border py-3 rounded-lg flex justify-center items-center">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
        Continue with Google
      </button>

      <p className="text-sm text-center mt-4">
        {isRegistering ? "Already have an account?" : "Don't have an account?"}
        <button onClick={() => setIsRegistering(!isRegistering)} className="ml-2 text-blue-600 font-medium">
          {isRegistering ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </>
  );
};

export default UserAuth;
