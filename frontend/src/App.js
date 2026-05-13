import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const BG_URL =
  "https://customer-assets.emergentagent.com/job_139e49d9-ed0d-4528-9378-55c2a07ab8fa/artifacts/9jbks09n_2026s.png";

const Home = () => {
  return (
    <main
      data-testid="home-page"
      className="min-h-screen w-full bg-neutral-950 bg-no-repeat bg-center bg-contain"
      style={{ backgroundImage: `url(${BG_URL})` }}
    />
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
