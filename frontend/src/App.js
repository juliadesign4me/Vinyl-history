import { useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const BG_URL =
  "https://customer-assets.emergentagent.com/job_bg-canvas-5/artifacts/kswe8qjc_2026new.png";

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
      className="relative min-h-screen w-full bg-neutral-950 bg-no-repeat bg-center bg-contain overflow-hidden"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <div
        className="absolute left-1/2"
        style={{
          width: 460,
          height: 460,
          marginLeft: -230,
          bottom: 145,
          perspective: 900,
        }}
      >
        <div
          ref={diskRef}
          data-testid="vinyl-disk"
          onClick={replay}
          className="vinyl-disk cursor-pointer"
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

      <img
        data-testid="tonearm"
        src="https://customer-assets.emergentagent.com/job_bg-canvas-5/artifacts/3rh1ej02_2020%20torn.png"
        alt="tonearm"
        draggable={false}
        className="absolute select-none pointer-events-none"
        style={{
          width: 128,
          height: 455,
          left: "calc(50% + 238px)",
          bottom: 139,
        }}
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
