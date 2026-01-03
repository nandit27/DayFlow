import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl border border-black"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-black">
        Dashboard
      </h2>

      <div className="space-y-6">
        <motion.div
          className="p-4 bg-white rounded-lg border border-black"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-black mb-3">
            Profile Information
          </h3>
          <p className="text-black/70">Employee ID: {user.employeeId}</p>
          <p className="text-black/70">Name: {user.name}</p>
          <p className="text-black/70">Email: {user.email}</p>
          <p className="text-black/70">Phone: {user.phone}</p>
          <p className="text-black/70">Role: {user.role}</p>
          <p className="text-black/70">Company: {user.companyName}</p>
        </motion.div>
        <motion.div
          className="p-4 bg-white rounded-lg border border-black"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-black mb-3">
            Account Activity
          </h3>
          <p className="text-black/70">
            <span className="font-bold">Joined: </span>
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-black/70">
            <span className="font-bold">Last Login: </span>

            {formatDate(user.lastLogin)}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-black text-white font-bold rounded-lg shadow-md hover:bg-white hover:text-black border border-black focus:outline-none focus:ring-2 focus:ring-black"
        >
          Logout
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
export default DashboardPage;
