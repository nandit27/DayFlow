import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <div className="flex flex-col items-center justify-center text-sm">
          <h1 className="text-8xl font-bold text-sky-500">404</h1>
          <div className="h-1 w-16 rounded bg-sky-500 my-5"></div>
          <p className="text-2xl font-bold text-blue-800">Page Not Found</p>
          <p className="text-sm mt-4 text-blue-500 max-w-md text-center">
            Sorry we couldn't find the page you're looking for
          </p>
        </div>
      </div>
      <div className="px-8 py-4 bg-gray-900/50 flex justify-center">
        <p className="text-sm text-gray-400">
          Redirect to the home page?{" "}
          <Link to="/" className="text-sky-400 hover:underline">
            Click here
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default NotFound;
