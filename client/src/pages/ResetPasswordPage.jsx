import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../components/Input";
import { Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const { resetPassword, isLoading, error } = useAuthStore();

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength("");
      return;
    }

    // Define criteria
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );
    const isLongEnough = password.length >= 8;

    // Calculate strength
    const criteriaCount = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLongEnough,
    ].filter(Boolean).length;

    if (criteriaCount <= 2) {
      setPasswordStrength("weak");
    } else if (criteriaCount <= 4) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  }, [password]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl border border-gray-800"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">
          Reset Password
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-2">
            <Input
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password strength indicator */}
          {password && (
            <div className="mb-4">
              <div className="flex items-center">
                <div className="h-1.5 flex-grow flex rounded overflow-hidden">
                  <div
                    className={`h-full ${
                      passwordStrength === "weak"
                        ? "w-1/3 bg-red-500"
                        : passwordStrength === "medium"
                        ? "w-2/3 bg-yellow-500"
                        : passwordStrength === "strong"
                        ? "w-full bg-sky-500"
                        : "w-0"
                    }`}
                  />
                  <div className="h-full flex-grow bg-gray-700" />
                </div>
                <span
                  className={`ml-2 text-xs ${
                    passwordStrength === "weak"
                      ? "text-red-500"
                      : passwordStrength === "medium"
                      ? "text-yellow-500"
                      : passwordStrength === "strong"
                      ? "text-sky-500"
                      : ""
                  }`}
                >
                  {passwordStrength &&
                    `${
                      passwordStrength.charAt(0).toUpperCase() +
                      passwordStrength.slice(1)
                    }`}
                </span>
              </div>
              <ul className="text-xs text-gray-400 mt-1 pl-1">
                {password.length < 8 && <li>• At least 8 characters</li>}
                {!/[A-Z]/.test(password) && (
                  <li>• At least one uppercase letter</li>
                )}
                {!/[a-z]/.test(password) && (
                  <li>• At least one lowercase letter</li>
                )}
                {!/\d/.test(password) && <li>• At least one number</li>}
                {!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && (
                  <li>• At least one special character</li>
                )}
              </ul>
            </div>
          )}

          <div className="relative mb-2">
            <Input
              icon={Lock}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password match indicator */}
          {password && confirmPassword && (
            <div className="mb-4">
              {password === confirmPassword ? (
                <p className="text-sm text-sky-500 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Passwords match
                </p>
              ) : (
                <p className="text-sm text-red-500 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Set New Password"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;
