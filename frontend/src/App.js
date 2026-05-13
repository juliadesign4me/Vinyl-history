import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const BG_URL =
  "https://customer-assets.emergentagent.com/job_139e49d9-ed0d-4528-9378-55c2a07ab8fa/artifacts/9jbks09n_2026s.png";

const Home = () => {
  return (
    <main
      data-testid="home-page"
      className="relative min-h-screen w-full bg-neutral-950 bg-no-repeat bg-center bg-contain overflow-hidden"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <img
        data-testid="vinyl-disk"
        src="/assets/vinyl-disk.png"
        alt="vinyl disk"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain"
        draggable={false}
      />
    </main>
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
