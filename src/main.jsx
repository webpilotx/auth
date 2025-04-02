import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import reactLogo from "./assets/react.svg";
import "./index.css";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex justify-center space-x-4 my-8">
        <a href="https://vite.dev" target="_blank">
          <img
            src={viteLogo}
            className="h-24 transition-transform hover:scale-110"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="h-24 transition-transform hover:scale-110"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-4xl font-bold text-center mb-4">Vite + React</h1>
      <div className="card bg-gray-100 p-6 rounded-lg shadow-md text-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p className="mt-4 text-gray-600">
          Edit{" "}
          <code className="bg-gray-200 px-1 py-0.5 rounded">src/main.jsx</code>{" "}
          and save to test HMR
        </p>
      </div>
      <p className="text-center text-gray-500 mt-6">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
