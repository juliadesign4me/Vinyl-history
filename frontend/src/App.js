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
        className="absolute top-1/2 left-1/2 pointer-events-none select-none object-contain animate-vinyl-spin"
        style={{ width: 460, height: 460, marginLeft: -230, marginTop: -230 }}
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
