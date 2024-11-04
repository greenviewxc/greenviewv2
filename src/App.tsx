import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Calendar from "./pages/Calendar";
import Score from "./pages/Score";
<<<<<<< Updated upstream
=======
import Main from "./pages/Main";
>>>>>>> Stashed changes

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/about" element={<About />} />
        <Route path="/score" element={<Score />} />
      </Routes>
    </>
  );
};

export default App;
