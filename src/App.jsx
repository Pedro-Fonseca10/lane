import "./App.css";

import { Routes, Route } from "react-router-dom";
import { ParabensPage } from "./pages/parabens";
import { Puzzle } from "./pages/puzzle";

const routes = [
  { path: "/", element: <Puzzle /> },
  { path: "/parabens", element: <ParabensPage /> },
];

function App() {
  return (
    <>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </>
  );
}

export default App;
