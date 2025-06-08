import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import HomePage from "./pages/HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
