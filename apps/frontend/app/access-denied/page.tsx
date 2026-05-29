'use client';

import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="tpo-root">
      <style>{tpoStyles}</style>

      {/* Animated background layers */}
      <div className="tpo-bg" aria-hidden="true">
        <div className="tpo-grid" />
        <div className="tpo-orb tpo-orb-1" />
        <div className="tpo-orb tpo-orb-2" />
        <div className="tpo-orb tpo-orb-3" />
        <div className="tpo-scan" />
        <div className="tpo-noise" />
        {/* floating particles */}
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="tpo-particle"
            style={{
              left: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 9) * 0.9}s`,
              animationDuration: `${9 + (i % 6) * 2.5}s`,
              opacity: 0.15 + (i % 5) * 0.12,
            }}
          />
        ))}
      </div>

      <main className="tpo-content">
        {/* Intro notice */}
        <div className="tpo-notice">
          <span className="tpo-badge">
            <Lock className="tpo-badge-icon" />
            Secure Access Control
          </span>
          <p className="tpo-notice-text">
            The TPO Portal now uses a secure access control system. Access is
            restricted to authorized users only through unique, trackable links. No
            public entry!
          </p>
        </div>

        {/* Card */}
        <div className="tpo-card">
          <div className="tpo-card-glow" aria-hidden="true" />

          <div className="tpo-icon-wrap">
            <div className="tpo-icon-ring" />
            <div className="tpo-icon-ring tpo-icon-ring-2" />
            <div className="tpo-icon-core">
              <ShieldAlert className="tpo-shield" />
            </div>
          </div>

          <h1 className="tpo-title">Access Denied</h1>
          <p className="tpo-desc">
            This link has expired or is invalid. Please contact the <span className="font-extrabold"> Training and
              Placement Officer (TPO) </span> or the <span className="font-extrabold cursor-pointer hover:underline" onClick={() => {
                window.open("https://shubhashish.me")
              }}>
              developer
            </span> for assistance.
          </p>

          <a href="/contact" className="tpo-btn">
            <span>Contact TPO</span>
            <ArrowRight className="tpo-btn-icon" />
          </a>
        </div>
      </main>
    </div>
  );
}

const tpoStyles = `
.tpo-root {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
  background: radial-gradient(125% 125% at 50% 10%, #1a0a0a 0%, #0b0b0d 45%, #060608 100%);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

/* ---------- Background ---------- */
.tpo-bg { position: absolute; inset: 0; pointer-events: none; }

.tpo-grid {
  position: absolute; inset: -2px;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 75%);
  animation: tpo-grid-pan 26s linear infinite;
}
@keyframes tpo-grid-pan { to { background-position: 46px 46px; } }

.tpo-orb {
  position: absolute; border-radius: 9999px; filter: blur(70px);
  opacity: 0.5; animation: tpo-float 16s ease-in-out infinite;
}
.tpo-orb-1 { width: 460px; height: 460px; top: -120px; left: -90px;
  background: radial-gradient(circle, rgba(239,68,68,0.55), transparent 65%); }
.tpo-orb-2 { width: 520px; height: 520px; bottom: -160px; right: -120px;
  background: radial-gradient(circle, rgba(120,30,30,0.6), transparent 65%); animation-delay: -5s; }
.tpo-orb-3 { width: 360px; height: 360px; top: 40%; left: 55%;
  background: radial-gradient(circle, rgba(190,40,40,0.35), transparent 65%); animation-delay: -9s; }
@keyframes tpo-float {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(28px,-34px) scale(1.08); }
}

.tpo-scan {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(239,68,68,0.06) 50%, transparent);
  background-size: 100% 8px;
  mix-blend-mode: overlay;
  animation: tpo-scan-move 8s linear infinite;
  opacity: 0.5;
}
@keyframes tpo-scan-move { to { background-position: 0 200px; } }

.tpo-noise {
  position: absolute; inset: 0; opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.tpo-particle {
  position: absolute; bottom: -10px; width: 3px; height: 3px; border-radius: 9999px;
  background: rgba(248,113,113,0.9);
  box-shadow: 0 0 8px 1px rgba(239,68,68,0.6);
  animation-name: tpo-rise; animation-timing-function: linear; animation-iteration-count: infinite;
}
@keyframes tpo-rise {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) scale(0.4); opacity: 0; }
}

/* ---------- Content ---------- */
.tpo-content {
  position: relative; z-index: 1;
  width: 100%; max-width: 30rem;
  display: flex; flex-direction: column; align-items: center;
}

.tpo-notice {
  width: 100%; max-width: 36rem; text-align: center; margin-bottom: 1.75rem;
  animation: tpo-fade-up 0.7s ease-out both;
}
.tpo-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: #fca5a5; padding: 0.35rem 0.8rem; border-radius: 9999px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
  margin-bottom: 0.85rem;
}
.tpo-badge-icon { width: 0.85rem; height: 0.85rem; }
.tpo-notice-text { color: rgba(255,255,255,0.62); font-size: 0.95rem; line-height: 1.6; }

.tpo-card {
  position: relative; width: 100%;
  background: linear-gradient(160deg, rgba(24,24,27,0.85), rgba(12,12,14,0.9));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1.5rem; padding: 2.5rem 2rem; text-align: center;
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 30px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(239,68,68,0.06) inset;
  animation: tpo-fade-up 0.7s ease-out 0.1s both;
}
.tpo-card-glow {
  position: absolute; inset: -1px; border-radius: 1.5rem; padding: 1px; pointer-events: none;
  background: linear-gradient(140deg, rgba(239,68,68,0.5), transparent 40%, transparent 60%, rgba(239,68,68,0.3));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0.7;
}

.tpo-icon-wrap {
  position: relative; width: 6.5rem; height: 6.5rem; margin: 0 auto 1.5rem;
  display: flex; align-items: center; justify-content: center;
}
.tpo-icon-ring {
  position: absolute; inset: 0; border-radius: 9999px;
  border: 1px solid rgba(239,68,68,0.4); animation: tpo-pulse 2.6s ease-out infinite;
}
.tpo-icon-ring-2 { animation-delay: 1.3s; }
@keyframes tpo-pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}
.tpo-icon-core {
  width: 4.5rem; height: 4.5rem; border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 30% 25%, rgba(239,68,68,0.3), rgba(239,68,68,0.08));
  border: 1px solid rgba(239,68,68,0.35);
  box-shadow: 0 0 40px -4px rgba(239,68,68,0.5);
}
.tpo-shield { width: 2.25rem; height: 2.25rem; color: #f87171; animation: tpo-shake 4s ease-in-out infinite; }
@keyframes tpo-shake {
  0%,92%,100% { transform: rotate(0); }
  94% { transform: rotate(-8deg); }
  96% { transform: rotate(8deg); }
  98% { transform: rotate(-5deg); }
}

.tpo-title {
  font-size: 1.85rem; font-weight: 800; color: #fff; margin-bottom: 0.6rem;
  letter-spacing: -0.02em;
}
.tpo-desc { color: rgba(255,255,255,0.55); font-size: 0.95rem; line-height: 1.65; margin-bottom: 2rem; }

.tpo-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; padding: 0.85rem 1.5rem; border-radius: 0.85rem;
  font-weight: 600; font-size: 0.98rem; color: #fff; text-decoration: none;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  box-shadow: 0 12px 30px -8px rgba(239,68,68,0.6);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.tpo-btn:hover { transform: translateY(-2px); filter: brightness(1.08);
  box-shadow: 0 18px 40px -8px rgba(239,68,68,0.75); }
.tpo-btn:active { transform: translateY(0); }
.tpo-btn-icon { width: 1.1rem; height: 1.1rem; transition: transform 0.2s ease; }
.tpo-btn:hover .tpo-btn-icon { transform: translateX(4px); }


.tpo-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #fca5a5; letter-spacing: 0.04em; }

@keyframes tpo-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .tpo-orb, .tpo-grid, .tpo-scan, .tpo-particle, .tpo-icon-ring, .tpo-shield,
  .tpo-notice, .tpo-card { animation: none !important; }
}
`;