// src/pages/NotFound.jsx

import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      
      <h1 className="text-7xl font-bold text-indigo-600">404</h1>

      <h2 className="text-2xl md:text-3xl font-semibold mt-4">
        Page Not Found
      </h2>

      <p className="text-gray-500 mt-2 max-w-md">
        Oops! The page you are looking for doesn’t exist or has been moved.
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Go to Home
      </button>

    </div>
  );
};

export default NotFound;