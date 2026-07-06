"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

export default function AboutPage() {
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cal = calRef.current;
    if (!cal) return;
    cal.innerHTML = "";
    const onIdx = new Set([1,3,6,8,11,13,15,18,20,23,25,27,30,32,34]);
    const sparkIdx = new Set([4,17,29]);
    for (let i = 0; i < 35; i++) {
      const c = document.createElement("div");
      c.className = "ab-cell" + (sparkIdx.has(i) ? " spark" : onIdx.has(i) ? " on" : "");
      c.style.animationDelay = i * 32 + "ms";
      if (sparkIdx.has(i)) c.textContent = "✦";
      cal.appendChild(c);
    }

    const els = document.querySelectorAll(".ab-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en, idx) => {
          if (en.isIntersecting) {
            (en.target as HTMLElement).style.transitionDelay = (idx % 3) * 70 + "ms";
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const W: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 28px" };

  const eyebrow = (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 12.5,
      letterSpacing: "0.14em", textTransform: "uppercase", color: "#F97316"
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", boxShadow:"0 0 0 4px rgba(239,68,68,.15)", display:"inline-block", flexShrink:0 }} />
    </span>
  );
  void eyebrow;

  function Eyebrow({ label }: { label: string }) {
    return (
      <span style={{
        display:"inline-flex", alignItems:"center", gap:8,
        fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:12.5,
        letterSpacing:"0.14em", textTransform:"uppercase", color:"#F97316"
      }}>
        <span style={{ width:6,height:6,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 0 4px rgba(239,68,68,.15)",display:"inline-block",flexShrink:0 }} />
        {label}
      </span>
    );
  }

  return (
    <>
      <style>{`
        .ab-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1)}
        .ab-reveal.in{opacity:1;transform:none}
        .ab-cell{aspect-ratio:1;border-radius:7px;background:#f3f4f6;display:grid;place-items:center;font-size:10px;color:#9ca3af;position:relative;opacity:0;transform:scale(.6);animation:ab-pop .5s cubic-bezier(.2,.9,.3,1.4) forwards}
        .ab-cell.on{background:linear-gradient(135deg,#F97316,#EA580C);color:#fff}
        .ab-cell.spark{background:linear-gradient(135deg,#ef4444,#F97316);color:#fff}
        @keyframes ab-pop{to{opacity:1;transform:scale(1)}}
        .ab-float{position:absolute;right:-10px;top:60px;width:144px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:11px;box-shadow:0 20px 60px -20px rgba(249,115,22,.35);transform:rotate(3deg);animation:ab-sway 5s ease-in-out infinite}
        @keyframes ab-sway{0%,100%{transform:rotate(3deg) translateY(0)}50%{transform:rotate(3deg) translateY(-7px)}}
        .ab-float-img{height:62px;border-radius:9px;background:linear-gradient(135deg,#fed7aa,#F97316);margin-bottom:8px;display:grid;place-items:center;font-size:26px}
        .ab-step-connector{position:relative}
        .ab-step-connector:not(:last-child)::after{content:"";position:absolute;top:34px;right:-2px;width:4px;height:4px;border-radius:50%;background:#fb923c;box-shadow:14px 0 0 #fb923c,28px 0 0 rgba(249,115,22,.4),42px 0 0 rgba(249,115,22,.2)}
        .ab-pain-card{background:#fff;border:1px solid #e9e7f2;border-radius:18px;padding:26px 24px;transition:transform .25s ease,box-shadow .25s ease}
        .ab-pain-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px -12px rgba(249,115,22,.18)}
        .ab-why-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:30px 28px}
        @media(max-width:940px){
          .ab-hero-grid{grid-template-columns:1fr !important;gap:40px !important}
          .ab-visual{max-width:460px}
          .ab-trust-grid{grid-template-columns:repeat(3,1fr) !important}
          .ab-pain-grid{grid-template-columns:repeat(2,1fr) !important}
          .ab-steps{grid-template-columns:repeat(2,1fr) !important}
          .ab-steps .ab-step-connector:not(:last-child)::after{display:none}
          .ab-why-grid{grid-template-columns:1fr !important}
        }
        @media(max-width:600px){
          .ab-pain-grid{grid-template-columns:1fr !important}
          .ab-steps{grid-template-columns:1fr !important}
          .ab-trust-grid{grid-template-columns:repeat(2,1fr) !important}
          .ab-hero-ctas{flex-direction:column}
          .ab-float{display:none}
        }
        @media(prefers-reduced-motion:reduce){
          .ab-reveal{opacity:1 !important;transform:none !important}
          .ab-cell{animation:none !important;opacity:1 !important;transform:scale(1) !important}
          .ab-float{animation:none !important}
        }
      `}</style>

      <main style={{ fontFamily:"'Inter',system-ui,sans-serif", color:"#14121f", background:"#fff", lineHeight:1.6, overflowX:"hidden" }}>

        {/* ── HERO ── */}
        <header style={{ position:"relative", padding:"72px 0 48px", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, zIndex:-1, background:"radial-gradient(700px 400px at 78% 8%,rgba(249,115,22,.10),transparent 70%),radial-gradient(600px 380px at 10% 30%,rgba(249,115,22,.06),transparent 70%)" }} />
          <div style={W}>
            <div className="ab-hero-grid" style={{ display:"grid", gridTemplateColumns:"1.05fr .95fr", gap:56, alignItems:"center" }}>

              {/* copy */}
              <div>
                <Eyebrow label="About Shoutly AI" />
                <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"clamp(38px,5vw,58px)", letterSpacing:"-.02em", lineHeight:1.08, margin:"22px 0 20px" }}>
                  Your business posts{" "}
                  <span style={{ background:"linear-gradient(120deg,#F97316,#fb923c 60%,#ef4444)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>
                    every day.
                  </span>{" "}
                  Automatically.
                </h1>
                <p style={{ fontSize:19, color:"#4a4658", maxWidth:520, marginBottom:14 }}>
                  One business description. A full year of professionally designed social posts, branded posters, captions, hashtags — published for you across every platform.
                </p>
                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:15, color:"#14121f", marginBottom:30 }}>
                  No designers.{" "}<span style={{ color:"#8b8798", fontWeight:500 }}>No agencies.</span>{" "}No daily content planning.
                </p>
                <div className="ab-hero-ctas" style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:22 }}>
                  <Link href="https://go.shoutlyai.com/" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:9, fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:16, padding:"15px 28px", borderRadius:13, background:"linear-gradient(135deg,#F97316,#EA580C)", color:"#fff", boxShadow:"0 14px 30px -12px rgba(249,115,22,.65)", textDecoration:"none" }}>
                    Get Started
                  </Link>
                  <Link href="/" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:9, fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:16, padding:"15px 28px", borderRadius:13, background:"#fff", color:"#14121f", border:"1px solid #e9e7f2", boxShadow:"0 1px 2px rgba(20,18,31,.04),0 12px 40px -12px rgba(249,115,22,.10)", textDecoration:"none" }}>
                    <span style={{ width:22, height:22, borderRadius:"50%", background:"#fef3c7", display:"grid", placeItems:"center", color:"#F97316", fontSize:12, flexShrink:0 }}>▶</span>
                    Watch 2-Minute Demo
                  </Link>
                </div>
                <p style={{ fontSize:13.5, color:"#8b8798", display:"flex", alignItems:"center", gap:8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="#F97316" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Set up in minutes &nbsp;·&nbsp; You approve every post before it goes live
                </p>
              </div>

              {/* calendar visual */}
              <div className="ab-visual" style={{ position:"relative", background:"#fff", border:"1px solid #e9e7f2", borderRadius:24, boxShadow:"0 30px 80px -28px rgba(249,115,22,.22)", padding:20, overflow:"visible" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, padding:"2px 4px" }}>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:13, color:"#4a4658" }}>Your content calendar — auto-filled</span>
                  <span style={{ display:"flex", gap:6 }}>
                    {(["#ef4444","#e9e7f2","#e9e7f2"] as string[]).map((bg,i) => <span key={i} style={{ width:9,height:9,borderRadius:"50%",background:bg,display:"block" }}/>)}
                  </span>
                </div>
                <div ref={calRef} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }} />
                <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"#fff7ed", borderRadius:12, border:"1px solid #fed7aa" }}>
                  <span style={{ width:34,height:34,borderRadius:9,background:"#fff",display:"grid",placeItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.08)",fontSize:18,flexShrink:0 }}>✨</span>
                  <span>
                    <b style={{ fontFamily:"'Sora',sans-serif", fontSize:13.5, display:"block" }}>A full year of content, from one description</b>
                    <span style={{ fontSize:12.5, color:"#4a4658" }}>Posters, captions & hashtags, ready to publish</span>
                  </span>
                </div>
                <div className="ab-float">
                  <div className="ab-float-img">☕</div>
                  <div style={{ height:6,borderRadius:4,background:"#e9e7f2",marginBottom:5 }}/>
                  <div style={{ height:6,borderRadius:4,background:"#e9e7f2",width:"60%",marginBottom:5 }}/>
                  <div style={{ fontSize:9,color:"#F97316",fontWeight:600,marginTop:6 }}>#coffeelover #morningbrew</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── TRUST BAR ── */}
        <div style={{ padding:"30px 0 6px" }}>
          <div style={W}>
            <div className="ab-reveal ab-trust-grid" style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:14, background:"#14121f", borderRadius:20, padding:"26px 24px", color:"#fff" }}>
              {[
                { n:"155+",  l:"Business categories" },
                { n:"10",    l:"Social platforms" },
                { n:"Branded",l:"Designed posters" },
                { n:"Written",l:"Captions & hashtags" },
                { n:"Auto",  l:"Scheduling & publishing" },
                { n:"All",   l:"Businesses & teams" },
              ].map((item,i,arr) => (
                <div key={i} style={{ textAlign:"center", padding:"6px 4px", borderRight:i<arr.length-1?"1px solid rgba(255,255,255,.09)":"none" }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:24, letterSpacing:"-.02em", background:"linear-gradient(120deg,#fff,#fb923c)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>{item.n}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.62)", marginTop:4, lineHeight:1.35 }}>{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROBLEM ── */}
        <section style={{ padding:"86px 0", background:"#f9fafb" }}>
          <div style={W}>
            <div className="ab-reveal" style={{ maxWidth:660, marginBottom:52 }}>
              <Eyebrow label="The everyday struggle" />
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(30px,3.6vw,44px)", fontWeight:700, letterSpacing:"-.02em", lineHeight:1.08, margin:"16px 0 14px" }}>Why social media feels like a full-time job</h2>
              <p style={{ fontSize:18, color:"#4a4658" }}>Most businesses want to stay visible — but staying consistent takes time, creativity, and resources that are always in short supply.</p>
            </div>
            <div className="ab-pain-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
              {[
                { ic:"⏳", title:"Hours every week",       desc:"Planning, writing, and designing posts eats into the time you'd rather spend running your business." },
                { ic:"💭", title:"Running out of ideas",   desc:"The blank page comes back every single day. Fresh, on-brand ideas are hard to keep producing." },
                { ic:"🧑‍🎨",title:"Hiring specialists",     desc:"Designers and content writers add cost and coordination most small teams can't justify." },
                { ic:"📉", title:"Inconsistent posting",   desc:"Good weeks followed by silent ones. Algorithms and audiences both reward showing up daily." },
                { ic:"🚪", title:"Missed reach",           desc:"Every day you don't post is a day customers scroll past to someone who did." },
                { ic:"🔀", title:"Too many tools",         desc:"Design here, captions there, scheduling somewhere else — the stack is fragmented and slow." },
              ].map((item,i) => (
                <div key={i} className="ab-reveal ab-pain-card">
                  <div style={{ width:46,height:46,borderRadius:12,background:"#fff7ed",display:"grid",placeItems:"center",fontSize:22,marginBottom:16 }}>{item.ic}</div>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, marginBottom:8 }}>{item.title}</h3>
                  <p style={{ fontSize:15, color:"#4a4658" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOLUTION ── */}
        <section style={{ padding:"86px 0" }}>
          <div style={W}>
            <div className="ab-reveal" style={{ maxWidth:660, marginLeft:"auto", marginRight:"auto", textAlign:"center", marginBottom:52 }}>
              <Eyebrow label="How it works" />
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(30px,3.6vw,44px)", fontWeight:700, letterSpacing:"-.02em", lineHeight:1.08, margin:"16px 0 14px" }}>From one business description to a full year of content</h2>
              <p style={{ fontSize:18, color:"#4a4658" }}>Four steps. No design skills, no content calendar, no agency retainer.</p>
            </div>
            <div className="ab-steps" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
              {[
                { num:"1", glyph:"📝", title:"Describe your business",       desc:"Type a short description — or just paste your website. That's the only input Shoutly needs." },
                { num:"2", glyph:"🎯", title:"Shoutly learns your brand",     desc:"It picks up your voice, audience, colors, and offers to keep every post on-brand." },
                { num:"3", glyph:"🗓️", title:"Generate 365 days of content",  desc:"A full year of posters, captions, and hashtags — designed and written, ready to review." },
                { num:"4", glyph:"🚀", title:"Publish across 10 platforms",   desc:"Approve once and Shoutly schedules and publishes automatically, everywhere you post." },
              ].map((item,i) => (
                <div key={i} className={`ab-reveal ab-step-connector`} style={{ position:"relative", padding:"0 22px" }}>
                  <div style={{
                    width:68, height:68, borderRadius:18,
                    background: i===3 ? "linear-gradient(135deg,#ef4444,#F97316)" : "linear-gradient(135deg,#F97316,#EA580C)",
                    color:"#fff", display:"grid", placeItems:"center", marginBottom:22,
                    fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:26,
                    boxShadow: i===3 ? "0 16px 30px -12px rgba(239,68,68,.5)" : "0 16px 30px -12px rgba(249,115,22,.55)"
                  }}>{item.num}</div>
                  <span style={{ fontSize:26, marginBottom:14, display:"block" }}>{item.glyph}</span>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:19, fontWeight:700, marginBottom:9 }}>{item.title}</h3>
                  <p style={{ fontSize:15, color:"#4a4658" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY TRUST ── */}
        <section style={{ padding:"86px 0", background:"#14121f", color:"#fff" }}>
          <div style={W}>
            <div className="ab-reveal" style={{ maxWidth:660, marginBottom:52 }}>
              <Eyebrow label="Straight answers" />
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(30px,3.6vw,44px)", fontWeight:700, letterSpacing:"-.02em", lineHeight:1.08, margin:"16px 0 14px" }}>What you get, and why it beats doing it yourself</h2>
              <p style={{ fontSize:18, color:"rgba(255,255,255,.6)" }}>No jargon. Here&apos;s exactly what Shoutly does and where it earns its place in your week.</p>
            </div>
            <div className="ab-why-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
              {[
                { q:"What do I get?",                     title:"A year of finished, on-brand posts",              desc:"Designed posters, written captions, and researched hashtags for a full 12 months — not templates you still have to fill in yourself." },
                { q:"How does it work?",                  title:"One description in, content out",                 desc:"You describe your business once. Shoutly handles the design, the copy, the scheduling, and the publishing across all ten platforms." },
                { q:"Why should I trust it?",             title:"You approve everything before it goes live",      desc:"Nothing publishes without your say-so. Review, edit, or regenerate any post. Your data is encrypted and handled under GDPR, CCPA, and DPDP." },
                { q:"Why better than doing it myself?",   title:"Days of work, done in minutes",                   desc:"No hiring, no juggling five tools, no daily blank page. One setup replaces the designer, the copywriter, and the scheduler." },
              ].map((item,i) => (
                <div key={i} className="ab-reveal ab-why-card">
                  <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:13, color:"#fb923c", letterSpacing:".02em", marginBottom:10 }}>{item.q}</div>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, marginBottom:10 }}>{item.title}</h3>
                  <p style={{ fontSize:15.5, color:"rgba(255,255,255,.72)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MISSION ── */}
        <section style={{ padding:"86px 0", textAlign:"center" }}>
          <div style={W}>
            <div className="ab-reveal" style={{ display:"inline-block", marginBottom:32 }}>
              <Eyebrow label="Our mission" />
            </div>
            <p className="ab-reveal" style={{ maxWidth:860, margin:"0 auto", fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:"clamp(24px,3.2vw,36px)", lineHeight:1.3, letterSpacing:"-.02em" }}>
              To make professional social media marketing{" "}
              <em style={{ fontStyle:"normal", background:"linear-gradient(120deg,#F97316,#fb923c 55%,#ef4444)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>
                accessible to every business
              </em>{" "}
              — without the cost, time, or complexity of doing it manually.
            </p>
            <p className="ab-reveal" style={{ marginTop:24, fontSize:18, color:"#4a4658", maxWidth:600, marginLeft:"auto", marginRight:"auto" }}>
              We built Shoutly so any business can stay visible every day — without the overhead of doing it manually.
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding:"20px 0 96px" }}>
          <div style={W}>
            <div className="ab-reveal" style={{ position:"relative", overflow:"hidden", background:"linear-gradient(135deg,#F97316,#EA580C 55%,#ef4444)", borderRadius:28, padding:"64px 48px", textAlign:"center", color:"#fff", boxShadow:"0 30px 80px -28px rgba(249,115,22,.45)" }}>
              <div style={{ position:"absolute", top:"-40%", right:"-10%", width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,.15),transparent 65%)", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", bottom:"-50%", left:"-8%", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,.10),transparent 65%)", pointerEvents:"none" }}/>
              <div style={{ position:"relative", zIndex:1 }}>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(30px,3.8vw,46px)", fontWeight:800, marginBottom:16 }}>Give your business a year of content today.</h2>
                <p style={{ fontSize:19, color:"rgba(255,255,255,.85)", maxWidth:520, margin:"0 auto 32px" }}>Get started in minutes, review your first posts, and decide for yourself.</p>
                <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                  <Link href="https://go.shoutlyai.com/" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:16, padding:"15px 28px", borderRadius:13, background:"#fff", color:"#EA580C", boxShadow:"0 14px 30px -10px rgba(0,0,0,.3)", textDecoration:"none" }}>
                    Get Started
                  </Link>
                  <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:9, fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:16, padding:"15px 28px", borderRadius:13, background:"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.3)", textDecoration:"none" }}>
                    <span style={{ width:22,height:22,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"grid",placeItems:"center",fontSize:12,flexShrink:0 }}>▶</span>
                    Watch 2-Minute Demo
                  </Link>
                </div>
                <p style={{ marginTop:22, fontSize:14, color:"rgba(255,255,255,.7)" }}>Set up in minutes · You approve every post · Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
