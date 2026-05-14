import { useEffect, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const BG_URL =
  "https://customer-assets.emergentagent.com/job_bg-canvas-5/artifacts/kswe8qjc_2026new.png";

const MOBILE_BG_URL = "/assets/mobile-2020s.png";

const TONEARM_URL =
  "https://customer-assets.emergentagent.com/job_bg-canvas-5/artifacts/3rh1ej02_2020%20torn.png";

// Desktop stage = container with the SAME aspect ratio as the bg image (2048 x 1152).
const STAGE_W = 2048;
const STAGE_H = 1152;

// Mobile stage matches the mobile bg artwork (1000 x 1912 ≈ iPhone 16/17 Pro Max).
const MOBILE_STAGE_W = 1000;
const MOBILE_STAGE_H = 1912;

// Mobile/desktop breakpoint (portrait phone vs everything else)
const MOBILE_BREAKPOINT = 768;

// Tonearm geometry (desktop frame)
const ARM_W = 128;
const ARM_H = 455;
const ARM_PIVOT_FROM_TOP = 25;
const ARM_PIVOT_RATIO = ARM_PIVOT_FROM_TOP / ARM_H; // 0.0549

// Mobile slider tick X positions (in container px). Track is 400 long, ticks 36 from each end.
const MOBILE_SNAP_XS = [36, 36 + (400 - 72) / 3, 36 + (2 * (400 - 72)) / 3, 364];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
};

const Home = () => {
  const isMobile = useIsMobile();
  const diskRef = useRef(null);
  const armWrapRef = useRef(null);
  const dragRef = useRef(null);
  const armAngleRef = useRef(0);
  const sliderContainerRef = useRef(null);
  const thumbDragRef = useRef(null);
  const [armAngle, setArmAngle] = useState(0); // 0 = rest, +90 = full CW
  const [isSpinning, setIsSpinning] = useState(false);
  // Thumb position is locked to one of 4 tick centers. Each tick = a page.
  // Tick centers in container-px: 47, 223, 399, 575. Thumb height = 64, so thumb-top
  // (in container-px) for centered alignment is tick_center - 32 = 15, 191, 367, 543.
  const SNAP_TOPS_PCT = [
    (15 / 622) * 100,
    (191 / 622) * 100,
    (367 / 622) * 100,
    (543 / 622) * 100,
  ];
  const [pageIndex, setPageIndex] = useState(3); // 0=1940s, 1=1970s, 2=2000s, 3=2020s (current)
  const thumbTopPct = SNAP_TOPS_PCT[pageIndex];

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
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // Drag for the slider thumb — snaps to the nearest tick position.
  // Supports both vertical (desktop) and horizontal (mobile) axes.
  useEffect(() => {
    const onMove = (e) => {
      const d = thumbDragRef.current;
      if (!d) return;
      if (d.isHorizontal) {
        const nextPx = d.startThumbPx + (e.clientX - d.startMouse) / d.scale;
        let bestIdx = 0;
        let bestDist = Infinity;
        d.snapPxs.forEach((s, i) => {
          const dist = Math.abs(s - nextPx);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        });
        setPageIndex(bestIdx);
      } else {
        const nextPx = d.startThumbPx + (e.clientY - d.startMouse);
        const nextPct = (nextPx / d.containerHeight) * 100;
        let bestIdx = 0;
        let bestDist = Infinity;
        SNAP_TOPS_PCT.forEach((p, i) => {
          const dist = Math.abs(p - nextPct);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        });
        setPageIndex(bestIdx);
      }
    };
    const onUp = () => {
      if (!thumbDragRef.current) return;
      thumbDragRef.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onThumbMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const container = sliderContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (isMobile) {
      thumbDragRef.current = {
        isHorizontal: true,
        snapPxs: MOBILE_SNAP_XS,
        startMouse: e.clientX,
        startThumbPx: MOBILE_SNAP_XS[pageIndex],
        scale: 0.9,
      };
    } else {
      thumbDragRef.current = {
        isHorizontal: false,
        containerHeight: rect.height,
        startMouse: e.clientY,
        startThumbPx: (thumbTopPct / 100) * rect.height,
      };
    }
    document.body.style.userSelect = "none";
  };

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
    if (e.pointerId !== undefined && wrap.setPointerCapture) {
      try {
        wrap.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Percentages relative to the active stage
  const pct = (n, base) => `${(n * 100) / base}%`;

  // Active stage dimensions (desktop vs mobile)
  const stageW = isMobile ? MOBILE_STAGE_W : STAGE_W;
  const stageH = isMobile ? MOBILE_STAGE_H : STAGE_H;
  const bgUrl = isMobile ? MOBILE_BG_URL : BG_URL;

  return (
    <main
      data-testid={isMobile ? "home-page-mobile" : "home-page"}
      className="relative min-h-screen w-full bg-neutral-950 flex items-center justify-center overflow-hidden"
    >
      <div
        data-testid={isMobile ? "stage-mobile" : "stage"}
        className="relative"
        style={{
          width: `min(100vw, calc(100vh * ${stageW} / ${stageH}))`,
          aspectRatio: `${stageW} / ${stageH}`,
          containerType: "inline-size",
        }}
      >
        <img
          src={bgUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Heading */}
        <h1
          data-testid="hero-heading"
          className="absolute m-0 text-white select-none pointer-events-none"
          style={
            isMobile
              ? {
                  left: 0,
                  right: 0,
                  top: pct(60, stageH),
                  width: "100%",
                  textAlign: "center",
                  fontFamily: '"Instrument Serif", serif',
                  fontSize: "60px",
                  lineHeight: 1,
                  fontWeight: 400,
                  textTransform: "lowercase",
                  letterSpacing: 0,
                }
              : {
                  left: pct(337, stageW),
                  top: pct(375, stageH),
                  fontFamily: '"Instrument Serif", serif',
                  fontSize: `${(110 / stageW) * 100}cqw`,
                  lineHeight: 90 / 110,
                  fontWeight: 400,
                  textTransform: "lowercase",
                  letterSpacing: 0,
                }
          }
        >
          {isMobile ? (
            <>
              the time <em style={{ fontStyle: "italic" }}>player</em>
            </>
          ) : (
            <>
              the
              <br />
              time
              <br />
              <em style={{ fontStyle: "italic" }}>player</em>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p
          data-testid="hero-subtitle"
          className="absolute m-0 text-white select-none pointer-events-none"
          style={
            isMobile
              ? {
                  left: 0,
                  right: 0,
                  top: pct(60 + 60 + 16 + 30 + 40 + 16 - 6, stageH),
                  width: "100%",
                  textAlign: "center",
                  fontFamily: '"Abyssinica SIL", serif',
                  fontSize: "18px",
                  lineHeight: "normal",
                  fontWeight: 400,
                }
              : {
                  left: pct(337, stageW),
                  top: pct(375 + 90 * 3 + 30, stageH),
                  fontFamily: '"Abyssinica SIL", serif',
                  fontSize: `${(26 / stageW) * 100}cqw`,
                  lineHeight: "normal",
                  fontWeight: 400,
                }
          }
        >
          Travel through music history.
        </p>

        {/* Slider — vertical on desktop, horizontal on mobile */}
        {isMobile ? (
          <div
            ref={sliderContainerRef}
            data-testid="slider-container"
            className="absolute"
            style={{
              left: "50%",
              bottom: `calc(${pct(20, stageH)} + 20%)`,
              transform: "translateX(-50%) scale(0.9)",
              transformOrigin: "center center",
              width: 400,
              height: 11,
            }}
          >
            {/* Track (horizontal) */}
            <div
              data-testid="slider-track"
              className="absolute"
              style={{
                left: 0,
                top: 0,
                width: 400,
                height: 11,
                borderRadius: 4,
                border: "2px solid #FFF",
                boxSizing: "border-box",
              }}
            />
            {/* 4 vertical ticks + decade labels below them */}
            {[
              { x: MOBILE_SNAP_XS[0], label: "1940s" },
              { x: MOBILE_SNAP_XS[1], label: "1970s" },
              { x: MOBILE_SNAP_XS[2], label: "2000s" },
              { x: MOBILE_SNAP_XS[3], label: "2020s" },
            ].map(({ x, label }, idx) => {
              const active = idx === pageIndex;
              const fontPx = active ? 30 : 20;
              return (
                <div key={idx}>
                  <div
                    data-testid={`tick-${idx}`}
                    className="absolute"
                    style={{
                      left: x,
                      top: 11,
                      transform: "translateX(-50%)",
                      width: 2,
                      height: 36,
                      background: "#FFF",
                      borderRadius: 4,
                    }}
                  />
                  <span
                    data-testid={`label-${label}`}
                    className="absolute text-white select-none pointer-events-none"
                    style={{
                      left: x,
                      top: 11 + 36 + 4,
                      transform: "translateX(-50%)",
                      fontFamily: '"Instrument Serif", serif',
                      fontSize: `${fontPx}px`,
                      lineHeight: 1,
                      fontWeight: 400,
                      textTransform: "lowercase",
                      whiteSpace: "nowrap",
                      transition: "font-size 200ms ease",
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
            <img
              src="/assets/slider-thumb.svg"
              alt=""
              draggable={false}
              data-testid="slider-thumb"
              onPointerDown={onThumbMouseDown}
              className="absolute select-none cursor-grab active:cursor-grabbing"
              style={{
                left: MOBILE_SNAP_XS[pageIndex],
                top: -(44 - 11) / 2,
                transform: "translateX(-50%)",
                width: 34,
                height: 44,
                touchAction: "none",
                transition: "left 150ms ease-out",
              }}
            />
          </div>
        ) : (
          <div
            ref={sliderContainerRef}
            data-testid="slider-container"
            className="absolute"
            style={{
              right: pct(276, stageW),
              bottom: pct(53, stageH),
              width: pct(231, stageW),
              height: pct(622, stageH),
            }}
          >
            <div
              data-testid="slider-track"
              className="absolute"
              style={{
                left: pct(17, 231),
                top: "50%",
                transform: "translateY(-50%)",
                width: pct(17, 231),
                height: pct(600, 622),
                borderRadius: `${(4 / stageW) * 100}cqw`,
                border: `${(3 / stageW) * 100}cqw solid #FFF`,
                boxSizing: "border-box",
              }}
            />
            {/* 4 tick marks + decade labels anchored by their LEFT edge to the RIGHT edge of the track */}
            {[
              { y: 47, label: "1940s" },
              { y: 223, label: "1970s" },
              { y: 399, label: "2000s" },
              { y: 575, label: "2020s" },
            ].map(({ y, label }, idx) => {
              const active = idx === pageIndex;
              const fontPx = active ? 60 : 30;
              return (
                <div key={y}>
                  <div
                    data-testid={`tick-${y}`}
                    className="absolute"
                    style={{
                      left: pct(34, 231),
                      top: pct(y, 622),
                      transform: "translateY(-50%)",
                      width: pct(63, 231),
                      height: pct(2, 622),
                      background: "#FFF",
                      borderRadius: `${(4 / stageW) * 100}cqw`,
                    }}
                  />
                  <span
                    data-testid={`label-${label}`}
                    className="absolute text-white select-none pointer-events-none"
                    style={{
                      left: pct(113, 231),
                      top: pct(y, 622),
                      transform: "translateY(-50%)",
                      fontFamily: '"Instrument Serif", serif',
                      fontSize: `${(fontPx / stageW) * 100}cqw`,
                      lineHeight: 1,
                      fontWeight: 400,
                      textTransform: "lowercase",
                      whiteSpace: "nowrap",
                      transition: "font-size 200ms ease",
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
            <img
              src="/assets/slider-thumb.svg"
              alt=""
              draggable={false}
              data-testid="slider-thumb"
              onPointerDown={onThumbMouseDown}
              className="absolute select-none cursor-grab active:cursor-grabbing"
              style={{
                left: 0,
                top: `${thumbTopPct}%`,
                width: pct(51, 231),
                aspectRatio: "51 / 64",
                touchAction: "none",
                transition: "top 150ms ease-out",
              }}
            />
          </div>
        )}

        {/* Vinyl disk */}
        <div
          className="absolute"
          style={{
            left: "50%",
            bottom: isMobile
              ? `calc(${pct(320, stageH)} + 12%)`
              : pct(145, stageH),
            width: isMobile ? 270 : pct(460, stageW),
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
          onPointerDown={onArmMouseDown}
          className="absolute select-none cursor-grab active:cursor-grabbing"
          style={{
            left: isMobile
              ? `calc(50% + ${pct(238, stageW)} + 5%)`
              : `calc(50% + ${pct(238, stageW)})`,
            bottom: isMobile
              ? `calc(${pct(139, stageH)} + 30%)`
              : pct(139, stageH),
            width: pct(ARM_W, stageW),
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
