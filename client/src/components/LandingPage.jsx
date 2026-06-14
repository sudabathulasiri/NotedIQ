import { useEffect, useRef, useState } from "react";

export default function LandingPage({ onNavigate }) {
    const canvasRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [bookRot, setBookRot] = useState({ x: 8, y: -25 });

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Particle canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;

        const particles = Array.from({ length: 55 }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.2 + 0.3,
            a: Math.random() * 0.35 + 0.05,
        }));

        function draw() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.a})`;
                ctx.fill();
            });
            // Connect close particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            animId = requestAnimationFrame(draw);
        }
        draw();

        const onResize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", onResize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
    }, []);

    // Book follows mouse
    useEffect(() => {
        const handler = (e) => {
            const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;
            setBookRot({ x: 8 - dy * 10, y: -25 + dx * 12 });
        };
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:wght@700;900&family=Caveat:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(52px,8vw,110px); font-weight: 900; line-height: 0.95; letter-spacing: -2px; }
        .hero-title span { color: #fff; -webkit-text-stroke: 1px rgba(255,255,255,0.15); }
        .hero-title em { font-style: italic; color: transparent; -webkit-text-stroke: 1.5px #fff; }
        .nav-link { color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500; cursor: pointer; transition: color 0.2s; background: none; border: none; font-family: inherit; letter-spacing: 0.04em; text-transform: uppercase; }
        .nav-link:hover { color: #fff; }
        .btn-primary { background: #fff; color: #000; border: none; border-radius: 4px; padding: 14px 32px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-primary:hover { background: #e5e5e5; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,255,255,0.12); }
        .btn-ghost { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.25); border-radius: 4px; padding: 13px 32px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.05); }
        .feature-card { background: rgba(255,255,255,0.03); border: 0.5px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 32px; transition: all 0.3s; cursor: default; }
        .feature-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .feature-num { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; color: rgba(255,255,255,0.08); line-height: 1; margin-bottom: 12px; }
        .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0; }
        .stat-num { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; color: #fff; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-top: 4px; }
        .pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 0.5px solid rgba(255,255,255,0.15); border-radius: 100px; font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; text-transform: uppercase; }
        .ticker { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .scroll-hint { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent); animation: scrollAnim 2s ease-in-out infinite; }
        @keyframes scrollAnim { 0%{opacity:0;transform:scaleY(0);transform-origin:top} 50%{opacity:1;transform:scaleY(1)} 100%{opacity:0;transform:scaleY(0);transform-origin:bottom} }
        .mode-card { background: rgba(255,255,255,0.02); border: 0.5px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; flex: 1; position: relative; overflow: hidden; transition: all 0.3s; }
        .mode-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); transform: translateY(-4px); box-shadow: 0 24px 48px rgba(0,0,0,0.5); }
        .mode-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent); }
        .tag { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
        .book-shadow { position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%); width: 200px; height: 30px; background: radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 70%); border-radius: 50%; pointer-events: none; animation: shadowPulse 4s ease-in-out infinite; }
        @keyframes shadowPulse { 0%,100%{transform:translateX(-50%) scaleX(1)} 50%{transform:translateX(-50%) scaleX(0.85)} }
        .float-card { position: absolute; backdrop-filter: blur(8px); animation: floatCard 3s ease-in-out infinite; }
        @keyframes floatCard { 0%,100%{transform:translateY(0) rotate(var(--rot,0deg))} 50%{transform:translateY(-8px) rotate(var(--rot,0deg))} }
        .grid-line { position: absolute; background: rgba(255,255,255,0.025); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.8s ease 0.1s forwards; opacity:0; }
        .fade-up-2 { animation: fadeUp 0.8s ease 0.2s forwards; opacity:0; }
        .fade-up-3 { animation: fadeUp 0.8s ease 0.35s forwards; opacity:0; }
        .fade-up-4 { animation: fadeUp 0.8s ease 0.5s forwards; opacity:0; }
      `}</style>

            {/* Particle canvas */}
            <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.6 }} />

            {/* Grid lines */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
                {[15, 30, 50, 70, 85].map(p => (
                    <div key={p} className="grid-line" style={{ left: `${p}%`, top: 0, bottom: 0, width: 1 }} />
                ))}
                {[20, 45, 70].map(p => (
                    <div key={p} className="grid-line" style={{ top: `${p}%`, left: 0, right: 0, height: 1 }} />
                ))}
            </div>

            {/* Nav */}
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "0.5px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", background: "rgba(0,0,0,0.8)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#000", fontSize: 14, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>N</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>NotedIQ</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <button className="nav-link" onClick={() => scrollToSection("modes")}>Features</button>
                    <button className="nav-link" onClick={() => scrollToSection("how-it-works")}>How it works</button>
                    <button className="nav-link" onClick={() => scrollToSection("modes")}>Modes</button>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn-ghost" style={{ padding: "10px 20px", fontSize: 12 }} onClick={() => onNavigate("login")}>Sign in</button>
                    <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 12 }} onClick={() => onNavigate("signup")}>Get started</button>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 48px 80px", position: "relative", zIndex: 1 }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 80 }}>
                    <div style={{ flex: 1 }}>
                        <div className="pill fade-up" style={{ marginBottom: 32 }}>
                            <span className="ticker" />
                            AI-powered note intelligence
                        </div>
                        <h1 className="hero-title fade-up-1" style={{ marginBottom: 28 }}>
                            <span>Think</span><br />
                            <em>faster.</em><br />
                            <span>Note</span><br />
                            <span>smarter.</span>
                        </h1>
                        <p className="fade-up-2" style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 420, marginBottom: 40, fontWeight: 300 }}>
                            Transform messy lecture notes and chaotic meeting chatter into beautifully structured, AI-powered documents — in seconds.
                        </p>
                        <div className="fade-up-3" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <button className="btn-primary" onClick={() => onNavigate("signup")}>Start for free →</button>
                            <button className="btn-ghost" onClick={() => onNavigate("login")}>Sign in</button>
                        </div>
                        <div className="fade-up-4" style={{ display: "flex", gap: 40, marginTop: 48, paddingTop: 40, borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
                            {[["2 modes", "Student & Corporate"], ["Real AI", "Powered by Groq"], ["Instant", "Live processing"]].map(([n, l]) => (
                                <div key={n}>
                                    <div className="stat-num" style={{ fontSize: 24, fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>{n}</div>
                                    <div className="stat-label">{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3D Book — mouse reactive */}
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", perspective: "900px" }}>
                        <div style={{ position: "relative" }}>
                            {/* Ambient glow */}
                            <div style={{ position: "absolute", inset: -60, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 65%)", pointerEvents: "none", borderRadius: "50%" }} />

                            {/* Book */}
                            <div style={{
                                position: "relative", width: 180, height: 240,
                                transformStyle: "preserve-3d",
                                transform: `rotateY(${bookRot.y}deg) rotateX(${bookRot.x}deg)`,
                                transition: "transform 0.15s ease-out",
                            }}>
                                {/* Back cover — BLACK */}
                                <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", borderRadius: "3px 12px 12px 3px", border: "1px solid #222", transform: "translateZ(-8px)" }} />
                                {/* Pages edge */}
                                <div style={{ position: "absolute", top: 4, bottom: 4, right: -6, width: 10, background: "repeating-linear-gradient(to bottom,#f0ede8 0px,#f0ede8 1px,#e8e4df 2px,#e8e4df 3px)", borderRadius: "0 2px 2px 0" }} />
                                {/* Spine */}
                                <div style={{ position: "absolute", left: -20, top: 0, bottom: 0, width: 20, background: "#111", borderRadius: "3px 0 0 3px", transform: "rotateY(-90deg) translateZ(10px)", transformOrigin: "right center", borderRight: "0.5px solid #333" }} />
                                {/* Front cover — WHITE */}
                                <div style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: "3px 12px 12px 3px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "inset -3px 0 8px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(255,255,255,0.1)" }}>
                                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: "#000", letterSpacing: "-0.5px", textAlign: "center", lineHeight: 1.1 }}>Noted<br /><em style={{ fontStyle: "italic" }}>IQ</em></div>
                                    <div style={{ width: 32, height: 1, background: "#000", margin: "4px 0" }} />
                                    <div style={{ fontSize: 9, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Intelligence Layer</div>
                                </div>
                            </div>

                            {/* Ground shadow */}
                            <div className="book-shadow" />

                            {/* Floating annotation cards */}
                            <div className="float-card" style={{ top: -30, right: -130, "--rot": "-2deg", animationDelay: "0.3s" }}>
                                <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", minWidth: 140 }}>
                                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>📌 Definition</div>
                                    <div style={{ color: "#fff", fontFamily: "'Caveat',cursive", fontSize: 14, lineHeight: 1.3 }}>NotedIQ is active...</div>
                                </div>
                            </div>
                            <div className="float-card" style={{ bottom: 10, left: -130, "--rot": "1.5deg", animationDelay: "0.8s" }}>
                                <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", minWidth: 140 }}>
                                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>✅ Task</div>
                                    <div style={{ color: "#fff", fontFamily: "'Caveat',cursive", fontSize: 14 }}>Srinivas → fix DB EOD</div>
                                </div>
                            </div>
                            <div className="float-card" style={{ top: 80, right: -110, "--rot": "2deg", animationDelay: "1.4s" }}>
                                <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", minWidth: 120 }}>
                                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>⚡ Exam alert</div>
                                    <div style={{ color: "#fff", fontFamily: "'Caveat',cursive", fontSize: 14 }}>Big O matters!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="scroll-hint">
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>scroll</span>
                    <div className="scroll-line" />
                </div>
            </section>

            <div className="divider" />

            {/* How it works */}
            <section id="how-it-works" style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div style={{ marginBottom: 64 }}>
                    <div className="pill" style={{ marginBottom: 20 }}>How it works</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-1px" }}>
                        Three steps.<br /><em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.4)" }}>Zero friction.</em>
                    </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
                    {[
                        ["01", "Feed raw input", "Paste messy shorthand, type rough notes, or drop a YouTube link. Voice recordings coming soon."],
                        ["02", "AI processes", "Groq's LLaMA 3 engine classifies, corrects, and structures your content into typed blocks."],
                        ["03", "Get your doc", "A beautiful notebook for students, or a professional MoM + action matrix for teams."],
                    ].map(([n, t, d]) => (
                        <div className="feature-card" key={n} style={{ borderRadius: n === "01" ? "12px 0 0 12px" : n === "03" ? "0 12px 12px 0" : "0", borderRight: n !== "03" ? "none" : undefined }}>
                            <div className="feature-num">{n}</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.3px" }}>{t}</h3>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>{d}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="divider" />

            {/* Modes */}
            <section id="modes" style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div style={{ marginBottom: 64 }}>
                    <div className="pill" style={{ marginBottom: 20 }}>Dual Space</div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-1px" }}>
                        Built for two<br /><em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.4)" }}>worlds.</em>
                    </h2>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                    <div className="mode-card">
                        <div className="tag" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>🎓 Student Mode</div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.3px" }}>Microsoft Foundry IQ</h3>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300, marginBottom: 24 }}>
                            Transforms lecture chaos into structured study material — definitions, examples, exam alerts, and riddles to gamify retention.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {["📌 Topic headings", "📖 Key definitions", "💡 Code examples", "⚡ Exam alerts", "🧩 Logic riddles"].map(f => (
                                <div key={f} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.3)", flexShrink: 0, display: "inline-block" }} />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mode-card">
                        <div className="tag" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>💼 Corporate Mode</div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.3px" }}>Microsoft Work IQ</h3>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300, marginBottom: 24 }}>
                            Resolves short names to full employee identities, generates official MoM reports and priority-sorted action item matrices.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {["👤 Name grounding", "📋 MoM generation", "✅ Action items", "🎯 Priority sorting", "📅 Deadline tracking"].map(f => (
                                <div key={f} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.3)", flexShrink: 0, display: "inline-block" }} />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="divider" />

            {/* CTA */}
            <section style={{ padding: "100px 48px", textAlign: "center", position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 24 }}>
                    Ready to think<br /><em style={{ fontStyle: "italic" }}>smarter?</em>
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 40, fontWeight: 300 }}>No credit card. No setup. Just better notes.</p>
                <button className="btn-primary" style={{ fontSize: 14, padding: "16px 40px" }} onClick={() => onNavigate("signup")}>
                    Get started free →
                </button>
            </section>

            {/* Footer */}
            <div className="divider" />
            <footer style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>© 2026 NotedIQ — Agents League Hackathon @AISF</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Powered by Groq LLaMA 3</span>
            </footer>
        </div>
    );
}