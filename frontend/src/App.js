import { useEffect, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const BG_URL =
  "https://customer-assets.emergentagent.com/job_bg-canvas-5/artifacts/kswe8qjc_2026new.png";

const TONEARM_URL =
  "https://customer-assets.emergentagent.com/job_bg-canvas-5/artifacts/3rh1ej02_2020%20torn.png";

// Stage = container with the SAME aspect ratio as the bg image (2048 x 1152).
// All children are positioned in % of the stage so they always stay aligned to
// the artwork beneath them, regardless of viewport size.
const STAGE_W = 2048;
const STAGE_H = 1152;

// Tonearm geometry (in stage-pixel reference frame)
const ARM_W = 128;
const ARM_H = 455;
const ARM_PIVOT_FROM_TOP = 25;
const ARM_PIVOT_RATIO = ARM_PIVOT_FROM_TOP / ARM_H; // 0.0549

const Home = () => {
  const diskRef = useRef(null);
  const armWrapRef = useRef(null);
  const dragRef = useRef(null);
  const armAngleRef = useRef(0);
  const [armAngle, setArmAngle] = useState(0); // 0 = rest, +90 = full CW
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    armAngleRef.current = armAngle;
  }, [armAngle]);

  const replay = () => {
    const el = diskRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = "vinyl-flip 1.5s cubic-bezier(0.4,0,0.2,1) forwards";
  };

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
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.userSelect = "";
      if (armAngleRef.current >= 30) setIsSpinning(true);
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
    setIsSpinning(false);
    const wrap = armWrapRef.current;
    if (!wrap) return;
    // Pivot derived from the rendered element so it scales with the stage
    const parent = wrap.offsetParent || document.body;
    const parentRect = parent.getBoundingClientRect();
    const pivot = {
      x: parentRect.left + wrap.offsetLeft + wrap.offsetWidth / 2,
      y: parentRect.top + wrap.offsetTop + wrap.offsetHeight * ARM_PIVOT_RATIO,
    };
    const startMouseAngle =
      (Math.atan2(e.clientY - pivot.y, e.clientX - pivot.x) * 180) / Math.PI;
    dragRef.current = { pivot, startMouseAngle, startArmAngle: armAngle };
    document.body.style.userSelect = "none";
  };

  // Percentages relative to stage (2048 x 1152)
  const pct = (n, base) => `${(n * 100) / base}%`;

  return (
    <main
      data-testid="home-page"
      className="relative min-h-screen w-full bg-neutral-950 flex items-center justify-center overflow-hidden"
    >
      <div
        data-testid="stage"
        className="relative"
        style={{
          // Stage always fits inside the viewport while keeping the bg aspect.
          width: `min(100vw, calc(100vh * ${STAGE_W} / ${STAGE_H}))`,
          aspectRatio: `${STAGE_W} / ${STAGE_H}`,
          containerType: "inline-size",
        }}
      >
        <img
          src={BG_URL}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Heading */}
        <h1
          data-testid="hero-heading"
          className="absolute m-0 text-white select-none pointer-events-none"
          style={{
            left: pct(337, STAGE_W),
            top: pct(375, STAGE_H),
            fontFamily: '"Instrument Serif", serif',
            fontSize: `${(110 / STAGE_W) * 100}cqw`,
            lineHeight: 90 / 110,
            fontWeight: 400,
            textTransform: "lowercase",
            letterSpacing: 0,
          }}
        >
          the time
          <br />
          <em style={{ fontStyle: "italic" }}>player</em>
        </h1>

        {/* Vinyl disk */}
        <div
          className="absolute"
          style={{
            left: "50%",
            bottom: pct(145, STAGE_H),
            width: pct(460, STAGE_W),
            aspectRatio: "1 / 1",
            transform: "translateX(-50%)",
            perspective: "60vw",
          }}
        >
          <div
            ref={diskRef}
            data-testid="vinyl-disk"
            onClick={replay}
            className="vinyl-disk cursor-pointer w-full h-full"
          >
            <img
              src="/assets/vinyl-disk.png"
              alt="vinyl disk"
              className="w-full h-full block select-none vinyl-spin"
              style={{
                animationPlayState: isSpinning ? "running" : "paused",
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Tonearm */}
        <div
          ref={armWrapRef}
          data-testid="tonearm"
          onMouseDown={onArmMouseDown}
          className="absolute select-none cursor-grab active:cursor-grabbing"
          style={{
            left: `calc(50% + ${pct(238, STAGE_W)})`,
            bottom: pct(139, STAGE_H),
            width: pct(ARM_W, STAGE_W),
            aspectRatio: `${ARM_W} / ${ARM_H}`,
            transformOrigin: `50% ${ARM_PIVOT_RATIO * 100}%`,
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
