import { useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const BG_URL =
  "https://customer-assets.emergentagent.com/job_139e49d9-ed0d-4528-9378-55c2a07ab8fa/artifacts/9jbks09n_2026s.png";

const Home = () => {
  const diskRef = useRef(null);

  const replay = () => {
    const el = diskRef.current;
    if (!el) return;
    el.style.animation = "none";
    // force reflow so the animation restarts cleanly
    void el.offsetHeight;
    el.style.animation = "vinyl-flip 1.5s cubic-bezier(0.4,0,0.2,1) forwards";
  };

  return (
    <main
      data-testid="home-page"
      onClick={replay}
      className="relative min-h-screen w-full bg-neutral-950 bg-no-repeat bg-center bg-contain overflow-hidden cursor-pointer"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: 460,
          height: 460,
          left: 789,
          bottom: 140,
          perspective: 900,
        }}
      >
        <div
          ref={diskRef}
          data-testid="vinyl-disk"
          className="vinyl-disk"
          style={{ width: 460, height: 460 }}
        >
          <img
            src="/assets/vinyl-disk.png"
            alt="vinyl disk"
            className="w-full h-full block select-none"
            draggable={false}
          />
        </div>
      </div>
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
