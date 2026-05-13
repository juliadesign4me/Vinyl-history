import { useEffect, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const BG_URL =
  "https://customer-assets.emergentagent.com/job_bg-canvas-5/artifacts/kswe8qjc_2026new.png";

const TONEARM_URL =
  "https://customer-assets.emergentagent.com/job_bg-canvas-5/artifacts/3rh1ej02_2020%20torn.png";

const Home = () => {
  const diskRef = useRef(null);
  const armWrapRef = useRef(null);
  const dragRef = useRef(null);
  const [armAngle, setArmAngle] = useState(0); // 0deg = rest, +90deg = full CW (drag right)

  const replay = () => {
    const el = diskRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = "vinyl-flip 1.5s cubic-bezier(0.4,0,0.2,1) forwards";
  };

  // Drag-to-rotate tonearm around its top pivot, clamped to [-90deg, 0deg]
  useEffect(() => {
    const toDeg = (rad) => (rad * 180) / Math.PI;

    const onMove = (e) => {
      if (!dragRef.current) return;
      const { pivot, startMouseAngle, startArmAngle } = dragRef.current;
      const a = toDeg(Math.atan2(e.clientY - pivot.y, e.clientX - pivot.x));
      let next = startArmAngle + (a - startMouseAngle);
      if (next < 0) next = 0;
      if (next > 90) next = 90;
      setArmAngle(next);
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const onArmMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wrap = armWrapRef.current;
    if (!wrap) return;
    // Compute pivot from layout (not bounding rect) so it doesn't drift while rotated
    const parent = wrap.offsetParent || document.body;
    const parentRect = parent.getBoundingClientRect();
    const pivot = {
      x: parentRect.left + wrap.offsetLeft + wrap.offsetWidth / 2,
      y: parentRect.top + wrap.offsetTop,
    };
    const startMouseAngle =
      (Math.atan2(e.clientY - pivot.y, e.clientX - pivot.x) * 180) / Math.PI;
    dragRef.current = { pivot, startMouseAngle, startArmAngle: armAngle };
    document.body.style.userSelect = "none";
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

      <div
        ref={armWrapRef}
        data-testid="tonearm"
        onMouseDown={onArmMouseDown}
        className="absolute select-none cursor-grab active:cursor-grabbing"
        style={{
          width: 128,
          height: 455,
          left: "calc(50% + 238px)",
          bottom: 139,
          transformOrigin: "50% 0%",
          transform: `rotate(${armAngle}deg)`,
          willChange: "transform",
          touchAction: "none",
        }}
      >
        <img
          src={TONEARM_URL}
          alt="tonearm"
          draggable={false}
          className="w-full h-full block pointer-events-none select-none"
        />
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
