import { Link } from 'react-router-dom';
import {
  Zap, Shield, Database,
  CheckCircle, ArrowRight, Menu, X, Cat, ExternalLink,
  BarChart3, Search, Globe
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   Inline styles & CSS-in-JS keyframes
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --saffron: #FF9933;
    --white: #FFFFFF;
    --green: #138808;
    --navy: #000080;
    --sa: #E8530A;
    --sl: #FF7A3D;
    --sg: #138808;
    --bg-navy: #05080F;
    --card: #0D1220;
    --card2: #111827;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --muted: rgba(255,255,255,0.42);
    --mid: rgba(255,255,255,0.68);
    --fd: 'Syne', sans-serif;
    --fb: 'DM Sans', sans-serif;
    --fm: 'DM Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html {
    scroll-behavior: smooth;
  }

  body {
    overflow-x: hidden;
  }

  .land {
    font-family: var(--fb);
    background: var(--bg-navy);
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
    width: 100%;
  }

  /* India tri-color gradient background - fixed */
  .land::after {
    content: '';
    position: fixed;
    inset: 0;
    background: 
      radial-gradient(ellipse 80% 60% at 10% 10%, rgba(255, 153, 51, 0.15), transparent 60%),
      radial-gradient(ellipse 70% 55% at 90% 20%, rgba(0, 0, 128, 0.12), transparent 60%),
      radial-gradient(ellipse 70% 60% at 20% 90%, rgba(19, 136, 8, 0.15), transparent 60%),
      radial-gradient(circle at 50% 50%, rgba(0, 0, 128, 0.08), transparent 40%);
    pointer-events: none;
    z-index: 0;
    opacity: 0.8;
  }

  /* dot-grid background */
  .land::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .land > * { position: relative; z-index: 1; }

  /* glow orbs with India colors */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
    opacity: 0.5;
  }

  /* ── NAV ── */
  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(20px) saturate(180%);
    background: rgba(5,8,15,0.92);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .nav-brand-logo {
    width: 42px; 
    height: 42px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(255,153,51,0.3));
    transition: transform 0.3s ease, filter 0.3s ease;
  }
  .nav-brand:hover .nav-brand-logo {
    transform: scale(1.08) rotate(5deg);
    filter: drop-shadow(0 4px 12px rgba(255,153,51,0.5));
  }
  .nav-brand-text h1 {
    font-family: var(--fd);
    font-size: 18px; 
    font-weight: 800;
    background: linear-gradient(135deg, var(--saffron), var(--sl));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .nav-brand-text p {
    font-size: 10px; 
    color: var(--muted);
    letter-spacing: 1.4px; 
    text-transform: uppercase; 
    margin: 2px 0 0;
    font-weight: 500;
  }
  .nav-links {
    display: flex; 
    align-items: center; 
    gap: 2rem;
  }
  .nav-link {
    font-size: 14px; 
    color: var(--mid); 
    text-decoration: none;
    font-weight: 500; 
    transition: color 0.2s;
    position: relative;
    white-space: nowrap;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--saffron), var(--green));
    transform: scaleX(0);
    transition: transform 0.3s ease;
    border-radius: 2px;
  }
  .nav-link:hover { 
    color: #fff; 
  }
  .nav-link:hover::after {
    transform: scaleX(1);
  }
  .nav-cta {
    display: flex; 
    align-items: center; 
    gap: 10px; 
    margin-left: 0.5rem;
  }
  .btn-ghost {
    padding: 9px 18px; 
    border-radius: 9px;
    border: 1px solid var(--border2); 
    background: transparent;
    color: #fff; 
    font-family: var(--fb); 
    font-size: 13.5px;
    font-weight: 500; 
    cursor: pointer; 
    text-decoration: none;
    display: inline-flex; 
    align-items: center; 
    gap: 6px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .btn-ghost:hover { 
    background: rgba(255,255,255,0.08); 
    border-color: rgba(255,255,255,0.25);
    transform: translateY(-1px);
  }
  .btn-primary {
    padding: 10px 20px; 
    border-radius: 9px;
    background: linear-gradient(135deg, var(--saffron), var(--sa));
    border: none;
    color: #fff; 
    font-family: var(--fb); 
    font-size: 13.5px;
    font-weight: 600; 
    cursor: pointer; 
    text-decoration: none;
    display: inline-flex; 
    align-items: center; 
    gap: 7px;
    transition: all 0.25s ease;
    box-shadow: 0 4px 14px rgba(255,153,51,0.25);
    white-space: nowrap;
  }
  .btn-primary:hover { 
    background: linear-gradient(135deg, var(--sa), var(--sl));
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255,153,51,0.4);
  }
  .mob-toggle {
    display: none; 
    background: none; 
    border: none; 
    color: #fff; 
    cursor: pointer; 
    padding: 6px;
    transition: transform 0.2s;
  }
  .mob-toggle:active {
    transform: scale(0.95);
  }
  .mob-menu {
    border-top: 1px solid var(--border);
    padding: 1.25rem 1.5rem;
    display: flex; 
    flex-direction: column; 
    gap: 14px;
    background: rgba(5,8,15,0.98);
    backdrop-filter: blur(20px);
  }
  .mob-link {
    font-size: 15px; 
    color: var(--mid); 
    text-decoration: none; 
    font-weight: 500; 
    padding: 8px 0;
    transition: color 0.2s;
    display: block;
  }
  .mob-link:hover, .mob-link:active {
    color: var(--saffron);
  }

  /* ── HERO ── */
  .hero {
    max-width: 1280px; 
    margin: 0 auto;
    padding: 7rem 2rem 5rem;
    display: grid; 
    grid-template-columns: 1.1fr 0.9fr;
    gap: 5rem; 
    align-items: center;
    position: relative;
  }
  .hero-left { 
    position: relative; 
    z-index: 1; 
  }
  .hero-badge {
    display: inline-flex; 
    align-items: center; 
    gap: 9px;
    background: linear-gradient(135deg, rgba(255,153,51,0.1), rgba(232,83,10,0.08));
    border: 1px solid rgba(255,153,51,0.3);
    padding: 6px 16px; 
    border-radius: 100px;
    font-size: 12px; 
    font-weight: 600; 
    color: var(--saffron);
    letter-spacing: 0.4px; 
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(255,153,51,0.15);
  }
  .hero-badge-dot {
    width: 7px; 
    height: 7px; 
    border-radius: 50%; 
    background: var(--saffron);
    animation: blink 2s infinite ease-in-out;
    box-shadow: 0 0 8px var(--saffron);
  }
  @keyframes blink { 
    0%,100%{opacity:1; transform: scale(1);} 
    50%{opacity:0.3; transform: scale(0.9);} 
  }
  .hero h2 {
    font-family: var(--fd);
    font-size: clamp(2rem, 7vw, 3.8rem);
    font-weight: 800; 
    line-height: 1.1;
    letter-spacing: -2px; 
    margin: 0 0 1.5rem;
  }
  .hero h2 .accent { 
    background: linear-gradient(135deg, var(--saffron), var(--sa));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero h2 .accent2 { 
    background: linear-gradient(135deg, var(--green), #0ea5e9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-desc {
    font-size: clamp(15px, 2.5vw, 17px);
    color: var(--mid); 
    line-height: 1.8;
    max-width: 480px; 
    margin: 0 0 2.5rem;
  }
  .hero-actions {
    display: flex; 
    gap: 14px; 
    flex-wrap: wrap;
  }
  .btn-hero-primary {
    padding: 15px 32px; 
    border-radius: 11px;
    background: linear-gradient(135deg, var(--saffron), var(--sa));
    border: none; 
    color: #fff;
    font-family: var(--fb); 
    font-size: 15.5px; 
    font-weight: 600;
    cursor: pointer; 
    text-decoration: none;
    display: inline-flex; 
    align-items: center; 
    justify-content: center;
    gap: 9px;
    transition: all 0.25s ease;
    box-shadow: 0 6px 20px rgba(255,153,51,0.3);
    white-space: nowrap;
  }
  .btn-hero-primary:hover { 
    background: linear-gradient(135deg, var(--sa), var(--sl));
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(255,153,51,0.45);
  }
  .btn-hero-primary:active {
    transform: translateY(-1px);
  }
  .btn-hero-ghost {
    padding: 15px 28px; 
    border-radius: 11px;
    border: 1.5px solid var(--border2); 
    background: rgba(255,255,255,0.03);
    color: #fff; 
    font-family: var(--fb); 
    font-size: 15.5px;
    font-weight: 500; 
    cursor: pointer; 
    text-decoration: none;
    display: inline-flex; 
    align-items: center; 
    justify-content: center;
    gap: 9px;
    transition: all 0.25s ease;
    backdrop-filter: blur(10px);
    white-space: nowrap;
  }
  .btn-hero-ghost:hover { 
    background: rgba(255,255,255,0.08); 
    border-color: rgba(255,255,255,0.3);
    transform: translateY(-2px);
  }
  .btn-hero-ghost:active {
    transform: translateY(0);
  }

  /* hero stats */
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 2rem; 
    margin-top: 3rem;
    padding-top: 2.5rem; 
    border-top: 1px solid var(--border);
  }
  .hstat {
    text-align: center;
  }
  .hstat-num {
    font-family: var(--fd); 
    font-size: clamp(20px, 3.5vw, 24px);
    font-weight: 800;
    background: linear-gradient(135deg, var(--saffron), var(--sl));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hstat-label { 
    font-size: clamp(10px, 1.8vw, 11.5px);
    color: var(--muted); 
    margin-top: 4px; 
    letter-spacing: 0.4px; 
    font-weight: 500;
  }

  /* hero right – code block with India gradient border */
  .hero-right { 
    position: relative; 
    z-index: 1; 
  }
  .code-window {
    background: var(--card);
    border: 1.5px solid transparent;
    background-image: 
      linear-gradient(var(--card), var(--card)),
      linear-gradient(135deg, rgba(255,153,51,0.3), rgba(19,136,8,0.2));
    background-origin: border-box;
    background-clip: padding-box, border-box;
    border-radius: 16px;
    overflow: hidden;
    font-family: var(--fm);
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  }
  .code-bar {
    display: flex; 
    align-items: center; 
    gap: 8px;
    padding: 14px 18px;
    background: rgba(255,255,255,0.04);
    border-bottom: 1px solid var(--border);
  }
  .code-dot { 
    width: 12px; 
    height: 12px; 
    border-radius: 50%; 
  }
  .code-title {
    margin-left: auto; 
    font-size: 11.5px; 
    color: var(--muted);
    letter-spacing: 0.6px;
    font-weight: 500;
  }
  .code-body { 
    padding: 1.5rem 1.25rem;
    font-size: clamp(11px, 2vw, 13.5px);
    line-height: 1.9; 
    overflow-x: auto;
  }
  .c-dim { color: rgba(255,255,255,0.35); }
  .c-key { color: #93C5FD; }
  .c-str { color: #86EFAC; }
  .c-url { color: var(--sl); }
  .c-num { color: #FCA5A5; }
  .c-obj { color: #C4B5FD; }
  .code-response {
    margin: 0; 
    padding: 1.5rem 1.25rem;
    border-top: 1px solid var(--border);
    font-size: clamp(11px, 1.8vw, 12.5px);
    line-height: 1.9;
    background: linear-gradient(135deg, rgba(19,136,8,0.05), rgba(255,153,51,0.03));
    max-height: 240px; 
    overflow: auto;
  }

  /* Custom scrollbar */
  .code-response::-webkit-scrollbar,
  .code-body::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .code-response::-webkit-scrollbar-track,
  .code-body::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
  }
  .code-response::-webkit-scrollbar-thumb,
  .code-body::-webkit-scrollbar-thumb {
    background: rgba(255,153,51,0.3);
    border-radius: 3px;
  }

  /* ── SECTION SHARED ── */
  .section { 
    max-width: 1280px; 
    margin: 0 auto; 
    padding: 6rem 1.5rem;
  }
  .section-tag {
    font-size: 11.5px; 
    font-weight: 600; 
    color: var(--saffron);
    letter-spacing: 2.2px; 
    text-transform: uppercase; 
    margin-bottom: 1.25rem;
    display: block;
  }
  .section-h {
    font-family: var(--fd); 
    font-size: clamp(1.75rem, 5vw, 2.8rem);
    font-weight: 800; 
    letter-spacing: -1px; 
    margin: 0 0 1.25rem;
    line-height: 1.12;
  }
  .section-sub {
    font-size: clamp(14px, 2.5vw, 16.5px);
    color: var(--mid); 
    line-height: 1.75; 
    max-width: 580px;
  }
  .section-head { 
    margin-bottom: 4rem;
    text-align: center;
  }

  /* ── FEATURES with gradient borders ── */
  .features-grid {
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5px;
    border: 1.5px solid var(--border); 
    border-radius: 16px; 
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  .feat-card {
    background: var(--card); 
    padding: 2.5rem 2rem;
    transition: all 0.3s ease;
    position: relative;
  }
  .feat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,153,51,0.05), rgba(19,136,8,0.03));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .feat-card:hover { 
    background: var(--card2); 
    transform: translateY(-2px);
  }
  .feat-card:hover::before {
    opacity: 1;
  }
  .feat-icon-wrap {
    width: 48px; 
    height: 48px; 
    border-radius: 11px;
    display: flex; 
    align-items: center; 
    justify-content: center;
    margin-bottom: 1.5rem; 
    border: 1px solid var(--border2);
    background: rgba(255,255,255,0.04);
    position: relative;
    z-index: 1;
  }
  .feat-h { 
    font-family: var(--fd); 
    font-size: 17px; 
    font-weight: 700; 
    margin: 0 0 10px; 
    position: relative;
    z-index: 1;
  }
  .feat-p { 
    font-size: 13.5px; 
    color: var(--mid); 
    line-height: 1.7; 
    margin: 0; 
    position: relative;
    z-index: 1;
  }

  /* ── API PREVIEW with India gradient ── */
  .api-section { 
    background: linear-gradient(180deg, var(--card) 0%, rgba(13,18,32,0.5) 100%);
    border-top: 1px solid var(--border); 
    border-bottom: 1px solid var(--border); 
  }
  .api-inner {
    max-width: 1280px; 
    margin: 0 auto; 
    padding: 5rem 1.5rem;
    display: grid; 
    grid-template-columns: 1fr;
    gap: 3rem; 
    align-items: start;
  }
  .endpoint-list { 
    display: flex; 
    flex-direction: column; 
    gap: 12px; 
  }
  .ep {
    display: flex; 
    align-items: center; 
    gap: 14px;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--border); 
    background: rgba(255,255,255,0.02);
    cursor: pointer; 
    transition: all 0.25s ease;
    flex-wrap: wrap;
  }
  .ep:hover, .ep.active { 
    background: linear-gradient(135deg, rgba(255,153,51,0.08), rgba(232,83,10,0.06));
    border-color: rgba(255,153,51,0.3);
    transform: translateX(4px);
  }
  .ep-method {
    font-family: var(--fm); 
    font-size: 11.5px; 
    font-weight: 600;
    padding: 3px 10px; 
    border-radius: 6px;
    background: rgba(34,197,94,0.15); 
    color: #4ADE80;
    flex-shrink: 0;
  }
  .ep-path { 
    font-family: var(--fm); 
    font-size: clamp(11px, 2vw, 13.5px);
    color: var(--mid); 
    flex: 1;
    word-break: break-all;
  }
  .ep-desc { 
    font-size: clamp(11px, 1.8vw, 12.5px);
    color: var(--muted);
    width: 100%;
  }

  /* ── PRICING with gradient cards ── */
  .pricing-grid {
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    max-width: 1280px;
    margin: 0 auto;
  }
  .price-card {
    background: var(--card); 
    padding: 2.5rem 2rem;
    border: 1px solid var(--border);
    border-radius: 16px;
    position: relative; 
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }
  .price-card:hover { 
    background: var(--card2); 
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  }
  .price-card.popular { 
    background: linear-gradient(135deg, rgba(255,153,51,0.08), rgba(232,83,10,0.05));
    border-color: rgba(255,153,51,0.3);
  }
  .popular-badge {
    position: absolute; 
    top: -1px; 
    left: 50%; 
    transform: translateX(-50%);
    background: linear-gradient(135deg, var(--saffron), var(--sa));
    color: #fff; 
    font-size: 11.5px; 
    font-weight: 600;
    padding: 5px 16px; 
    border-radius: 0 0 9px 9px; 
    letter-spacing: 0.4px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(255,153,51,0.3);
  }
  .plan-name {
    font-family: var(--fd); 
    font-size: 19px; 
    font-weight: 700;
    margin: 0 0 1.25rem; 
    padding-top: 1.25rem;
  }
  .price-amount {
    display: flex; 
    align-items: baseline; 
    gap: 5px; 
    margin-bottom: 6px;
  }
  .price-inr { 
    font-family: var(--fd); 
    font-size: clamp(28px, 5vw, 34px);
    font-weight: 800; 
  }
  .price-period { 
    font-size: 13.5px; 
    color: var(--muted); 
  }
  .price-requests {
    font-size: 13.5px; 
    background: linear-gradient(135deg, var(--saffron), var(--sa));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600; 
    margin-bottom: 2rem;
  }
  .price-features { 
    list-style: none; 
    padding: 0; 
    margin: 0 0 2rem; 
    display: flex; 
    flex-direction: column; 
    gap: 10px;
    flex: 1;
  }
  .price-feature { 
    display: flex; 
    align-items: flex-start; 
    gap: 10px; 
    font-size: 13.5px; 
    color: var(--mid); 
  }
  .price-cta {
    display: block; 
    width: 100%; 
    padding: 12px; 
    border-radius: 9px;
    text-align: center; 
    font-family: var(--fb); 
    font-size: 13.5px; 
    font-weight: 600;
    text-decoration: none; 
    transition: all 0.25s ease; 
    cursor: pointer; 
    border: none;
  }
  .price-cta.outline { 
    background: transparent; 
    border: 1px solid var(--border2); 
    color: #fff; 
  }
  .price-cta.outline:hover { 
    background: rgba(255,255,255,0.08); 
    transform: translateY(-1px);
  }
  .price-cta.filled { 
    background: linear-gradient(135deg, var(--saffron), var(--sa));
    color: #fff; 
    box-shadow: 0 4px 14px rgba(255,153,51,0.25);
  }
  .price-cta.filled:hover { 
    background: linear-gradient(135deg, var(--sa), var(--sl));
    box-shadow: 0 6px 20px rgba(255,153,51,0.4);
    transform: translateY(-2px);
  }

  /* ── CTA BANNER with India gradient ── */
  .cta-banner {
    max-width: 1280px; 
    margin: 0 auto; 
    padding: 2rem 1.5rem 6rem;
  }
  .cta-inner {
    background: linear-gradient(135deg, rgba(255,153,51,0.12) 0%, rgba(19,136,8,0.08) 100%);
    border: 1.5px solid rgba(255,153,51,0.25);
    border-radius: 18px; 
    padding: clamp(2.5rem, 5vw, 5rem) clamp(1.5rem, 4vw, 4rem);
    text-align: center; 
    position: relative; 
    overflow: hidden;
    box-shadow: 0 10px 50px rgba(255,153,51,0.15);
  }
  .cta-inner::before {
    content: '🇮🇳';
    position: absolute; 
    right: clamp(1rem, 4vw, 4rem);
    top: 50%; 
    transform: translateY(-50%);
    font-size: clamp(4rem, 10vw, 8rem);
    opacity: 0.08; 
    pointer-events: none;
  }
  .cta-h { 
    font-family: var(--fd); 
    font-size: clamp(1.5rem, 4vw, 2.4rem);
    font-weight: 800; 
    letter-spacing: -0.8px; 
    margin: 0 0 1.25rem; 
  }
  .cta-p { 
    font-size: clamp(14px, 2.5vw, 17px);
    color: var(--mid); 
    margin: 0 0 2.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .cta-actions { 
    display: flex; 
    gap: 14px; 
    justify-content: center; 
    flex-wrap: wrap; 
  }

  /* ── FOOTER ── */
  .footer {
    border-top: 1px solid var(--border);
    background: var(--card);
  }
  .footer-inner {
    max-width: 1280px; 
    margin: 0 auto; 
    padding: 3.5rem 1.5rem 2.5rem;
  }
  .footer-top {
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 3rem; 
    margin-bottom: 3.5rem;
  }
  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .footer-brand-logo-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .footer-brand-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
  .footer-brand h3 {
    font-family: var(--fd); 
    font-size: 19px; 
    font-weight: 700; 
    margin: 0;
    background: linear-gradient(135deg, var(--saffron), var(--sl));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .footer-brand p { 
    font-size: 13.5px; 
    color: var(--muted); 
    line-height: 1.75; 
    max-width: 280px; 
    margin: 0 0 1.5rem; 
  }
  .footer-col h4 {
    font-size: 12.5px; 
    font-weight: 600; 
    color: var(--muted);
    letter-spacing: 1.2px; 
    text-transform: uppercase; 
    margin: 0 0 1.25rem;
  }
  .footer-links { 
    display: flex; 
    flex-direction: column; 
    gap: 11px; 
    list-style: none; 
    padding: 0; 
    margin: 0; 
  }
  .footer-links a { 
    font-size: 14.5px; 
    color: var(--mid); 
    text-decoration: none; 
    transition: all 0.2s; 
    display: inline-block;
  }
  .footer-links a:hover { 
    color: var(--saffron); 
    transform: translateX(2px);
  }
  .footer-bottom {
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    padding-top: 2rem; 
    border-top: 1px solid var(--border); 
    flex-wrap: wrap; 
    gap: 1.25rem;
  }
  .footer-bottom-left { 
    font-size: 13.5px; 
    color: var(--muted); 
  }
  .footer-bottom-left a { 
    color: var(--saffron); 
    text-decoration: none; 
  }
  .footer-bottom-left a:hover { 
    text-decoration: underline; 
  }
  .footer-bottom-right {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .gh-link {
    display: inline-flex; 
    align-items: center; 
    gap: 8px;
    font-size: 13.5px; 
    color: var(--mid); 
    text-decoration: none;
    border: 1px solid var(--border); 
    padding: 7px 16px; 
    border-radius: 9px;
    transition: all 0.25s ease;
    white-space: nowrap;
  }
  .gh-link:hover { 
    color: #fff; 
    border-color: var(--border2); 
    background: rgba(255,255,255,0.05); 
    transform: translateY(-1px);
  }

  /* ── RESPONSIVE ── */
  @media (min-width: 1025px) {
    .api-inner {
      grid-template-columns: 1fr 1fr;
      gap: 5rem;
      align-items: center;
    }
  }

  @media (max-width: 1024px) {
    .nav-inner {
      padding: 0 1.25rem;
      height: 64px;
    }
    .nav-brand-logo {
      width: 38px;
      height: 38px;
    }
    .hero { 
      grid-template-columns: 1fr; 
      gap: 3.5rem; 
      padding: 5rem 1.5rem 4rem; 
    }
    .hero-right { 
      max-width: 600px;
      margin: 0 auto;
    }
    .section {
      padding: 5rem 1.5rem;
    }
    .section-head {
      text-align: left;
    }
  }

  @media (max-width: 768px) {
    .nav-links, .nav-cta { 
      display: none; 
    }
    .mob-toggle { 
      display: flex; 
    }
    .nav-inner {
      padding: 0 1rem;
      height: 60px;
    }
    .nav-brand-logo {
      width: 36px;
      height: 36px;
    }
    .nav-brand-text h1 {
      font-size: 16px;
    }
    .nav-brand-text p {
      font-size: 9px;
    }
    .hero {
      padding: 4rem 1rem 3rem;
      gap: 3rem;
    }
    .hero h2 {
      letter-spacing: -1px;
    }
    .hero-badge {
      font-size: 11px;
      padding: 5px 14px;
    }
    .hero-actions {
      flex-direction: column;
      width: 100%;
    }
    .btn-hero-primary,
    .btn-hero-ghost {
      width: 100%;
      justify-content: center;
      padding: 14px 24px;
      font-size: 14.5px;
    }
    .hero-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      padding-top: 2rem;
      margin-top: 2.5rem;
    }
    .section {
      padding: 4rem 1rem;
    }
    .section-head {
      margin-bottom: 3rem;
    }
    .features-grid {
      grid-template-columns: 1fr;
      gap: 0;
    }
    .feat-card {
      border-bottom: 1px solid var(--border);
      padding: 2rem 1.5rem;
    }
    .feat-card:last-child {
      border-bottom: none;
    }
    .api-inner {
      padding: 4rem 1rem;
      gap: 2.5rem;
    }
    .ep {
      padding: 12px 14px;
      gap: 10px;
    }
    .ep-path {
      font-size: 12px;
    }
    .ep-desc {
      font-size: 11px;
    }
    .pricing-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .price-card {
      padding: 2rem 1.5rem;
    }
    .cta-banner {
      padding: 2rem 1rem 5rem;
    }
    .cta-inner {
      padding: 2.5rem 1.5rem;
    }
    .cta-actions {
      flex-direction: column;
      width: 100%;
    }
    .cta-actions .btn-hero-primary,
    .cta-actions .btn-hero-ghost {
      width: 100%;
    }
    .footer-inner {
      padding: 3rem 1rem 2rem;
    }
    .footer-top {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
    .footer-bottom {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }
    .footer-bottom-right {
      width: 100%;
      justify-content: flex-start;
    }
    .code-window {
      border-radius: 12px;
    }
    .code-bar {
      padding: 12px 14px;
    }
    .code-body,
    .code-response {
      padding: 1.25rem 1rem;
    }
  }

  @media (max-width: 480px) {
    .nav-inner {
      padding: 0 0.875rem;
    }
    .nav-brand-logo {
      width: 32px;
      height: 32px;
    }
    .nav-brand-text h1 {
      font-size: 15px;
    }
    .hero {
      padding: 3rem 0.875rem 2.5rem;
    }
    .hero-stats {
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    .section {
      padding: 3.5rem 0.875rem;
    }
    .feat-card {
      padding: 1.75rem 1.25rem;
    }
    .price-card {
      padding: 1.75rem 1.25rem;
    }
    .cta-inner {
      padding: 2rem 1.25rem;
    }
    .footer-inner {
      padding: 2.5rem 0.875rem 1.75rem;
    }
  }
`;

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const FEATURES = [
  { icon: <Zap size={22} color="#FF9933" />, title: 'Redis-Cached', desc: 'Sub-millisecond geo lookups on all static lists. Autocomplete returns in < 50ms.' },
  { icon: <Database size={22} color="#60A5FA" />, title: 'Full 5-Tier Hierarchy', desc: 'Country → State → District → Sub-District → Village. Every level queryable independently.' },
  { icon: <Shield size={22} color="#4ADE80" />, title: 'API Key Auth', desc: 'Per-client key + secret pairs with revocation, plan-based rate limiting, and usage tracking.' },
  { icon: <Search size={22} color="#C4B5FD" />, title: 'Fuzzy Search', desc: 'Trigram-powered full-text search with phonetic tolerance across all geo levels.' },
  { icon: <BarChart3 size={22} color="#FCA5A5" />, title: 'Usage Analytics', desc: 'Real-time request logs, daily aggregation charts, and per-key breakdowns in the dashboard.' },
  { icon: <Globe size={22} color="#86EFAC" />, title: '577K+ Villages', desc: 'Complete MDDS dataset covering all 30 states, 700+ districts, and 6,500+ sub-districts.' },
];

const ENDPOINTS = [
  { path: '/api/v1/states', desc: 'List all states' },
  { path: '/api/v1/states/:id/districts', desc: 'Districts by state' },
  { path: '/api/v1/districts/:id/subdistricts', desc: 'Sub-districts by district' },
  { path: '/api/v1/subdistricts/:id/villages', desc: 'Villages (paginated)' },
  { path: '/api/v1/search?q=pune', desc: 'Full-text geo search' },
  { path: '/api/v1/autocomplete?q=mumb', desc: 'Instant autocomplete' },
];

const PLANS = [
  {
    name: 'Free', price: '₹0', req: '5,000 req/day',
    features: ['5,000 requests/day', 'Basic geo endpoints', 'Community support', 'Usage dashboard'],
    popular: false,
  },
  {
    name: 'Premium', price: '₹999', req: '50,000 req/day',
    features: ['50,000 requests/day', 'All geo endpoints', 'Email support', 'Advanced analytics'],
    popular: true,
  },
  {
    name: 'Pro', price: '₹4,999', req: '3,00,000 req/day',
    features: ['3,00,000 requests/day', 'Priority support', 'Custom rate limits', 'Usage insights'],
    popular: false,
  },
  {
    name: 'Unlimited', price: '₹14,999', req: 'Unlimited',
    features: ['Unlimited requests', '24/7 support', 'SLA guarantee', 'Dedicated manager'],
    popular: false,
  },
];

const RESPONSE_SAMPLE = `{
  "data": [
    {
      "id": "MH",
      "name": "Maharashtra",
      "code": "27",
      "districtCount": 36
    },
    {
      "id": "DL",
      "name": "Delhi",
      "code": "07",
      "districtCount": 11
    }
  ],
  "meta": {
    "total": 30,
    "cached": true,
    "responseMs": 12
  }
}`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export const Landing = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeEp, setActiveEp] = useState(0);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!document.getElementById('landing-css')) {
      const el = document.createElement('style');
      el.id = 'landing-css';
      el.textContent = STYLES;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    return () => { styleRef.current?.remove(); };
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  return (
    <div className="land">

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-brand">
            <img 
              src="https://all-india-villages-api.vercel.app/icon0.svg" 
              alt="Village API Logo" 
              className="nav-brand-logo"
            />
            <div className="nav-brand-text">
              <h1>Village API</h1>
              <p>National Data Atlas</p>
            </div>
          </a>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#api" className="nav-link">API</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a
              href="https://github.com/JayeshJadhav28/all-india-villages-api"
              target="_blank"
              rel="noreferrer"
              className="nav-link"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Cat size={16} /> GitHub
            </a>
          </div>

          <div className="nav-cta">
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-primary">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>

          <button 
            className="mob-toggle" 
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mob-menu">
            <a href="#features" className="mob-link" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#api" className="mob-link" onClick={() => setMobileOpen(false)}>API</a>
            <a href="#pricing" className="mob-link" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="https://github.com/JayeshJadhav28/all-india-villages-api" target="_blank" rel="noreferrer" className="mob-link" style={{ display: 'flex', alignItems: 'center', gap: 7 }} onClick={() => setMobileOpen(false)}><Cat size={16} /> GitHub</a>
            <Link to="/login" className="mob-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ marginTop: 6 }} onClick={() => setMobileOpen(false)}>Get Started →</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        {/* India color glow orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: 'rgba(255,153,51,0.15)', top: -150, left: -150 }} />
        <div className="orb" style={{ width: 500, height: 500, background: 'rgba(19,136,8,0.12)', bottom: -100, right: 100 }} />
        <div className="orb" style={{ width: 400, height: 400, background: 'rgba(0,0,128,0.08)', top: '30%', right: -100 }} />

        <div className="hero-left">
          <div className="hero-badge">
            <span className="hero-badge-dot" /> Live &amp; production-ready
          </div>

          <h2>
            India's geography,<br />
            <span className="accent">one clean</span>{' '}
            <span className="accent2">API.</span>
          </h2>

          <p className="hero-desc">
            Access 577,000+ villages across every state, district, and sub-district —
            standardised, searchable, and always available via REST.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">
              Start Building Free <ArrowRight size={19} />
            </Link>
            <a
              href="https://github.com/JayeshJadhav28/all-india-villages-api"
              target="_blank"
              rel="noreferrer"
              className="btn-hero-ghost"
            >
              <Cat size={18} /> View on GitHub
            </a>
          </div>

          <div className="hero-stats">
            {[
              { num: '577K+', label: 'Villages indexed' },
              { num: '30', label: 'States' },
              { num: '700+', label: 'Districts' },
              { num: '< 50ms', label: 'Avg. response' },
            ].map(s => (
              <div key={s.label} className="hstat">
                <div className="hstat-num">{s.num}</div>
                <div className="hstat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Code preview */}
        <div className="hero-right">
          <div className="code-window">
            <div className="code-bar">
              <span className="code-dot" style={{ background: '#FF5F57' }} />
              <span className="code-dot" style={{ background: '#FEBC2E' }} />
              <span className="code-dot" style={{ background: '#28C840' }} />
              <span className="code-title">GET /api/v1/states</span>
            </div>
            <div className="code-body">
              <span className="c-dim">// Authenticate with your API key</span><br />
              <span className="c-key">const</span> res = <span className="c-key">await</span> fetch(<br />
              &nbsp;&nbsp;<span className="c-str">"https://api.villageapi.in/api/v1/states"</span>,<br />
              &nbsp;&nbsp;&#123; <span className="c-key">headers</span>: &#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="c-str">"X-API-Key"</span>: <span className="c-obj">process.env</span>.API_KEY,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="c-str">"X-API-Secret"</span>: <span className="c-obj">process.env</span>.API_SECRET<br />
              &nbsp;&nbsp;&#125; &#125;<br />
              );
            </div>
            <pre className="code-response">
              <span className="c-dim">// Response</span>{'\n'}
              <span className="c-obj">&#123;</span>{'\n'}
              &nbsp;&nbsp;<span className="c-key">"data"</span>: [{'\n'}
              &nbsp;&nbsp;&nbsp;&nbsp;&#123; <span className="c-key">"id"</span>: <span className="c-str">"MH"</span>, <span className="c-key">"name"</span>: <span className="c-str">"Maharashtra"</span>, <span className="c-key">"districts"</span>: <span className="c-num">36</span> &#125;,{'\n'}
              &nbsp;&nbsp;&nbsp;&nbsp;&#123; <span className="c-key">"id"</span>: <span className="c-str">"DL"</span>, <span className="c-key">"name"</span>: <span className="c-str">"Delhi"</span>, <span className="c-key">"districts"</span>: <span className="c-num">11</span> &#125;,{'\n'}
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="c-dim">... 28 more states</span>{'\n'}
              &nbsp;&nbsp;],{'\n'}
              &nbsp;&nbsp;<span className="c-key">"meta"</span>: &#123; <span className="c-key">"total"</span>: <span className="c-num">30</span>, <span className="c-key">"cached"</span>: <span className="c-str">true</span>, <span className="c-key">"ms"</span>: <span className="c-num">12</span> &#125;{'\n'}
              <span className="c-obj">&#125;</span>
            </pre>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="section">
        <div className="section-head">
          <span className="section-tag">Why Village API</span>
          <h2 className="section-h">Built for developers,<br />designed for scale.</h2>
          <p className="section-sub">Production infrastructure with Redis caching, rate limiting, and a full admin + B2B portal out of the box.</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card">
              <div className="feat-icon-wrap">{f.icon}</div>
              <h3 className="feat-h">{f.title}</h3>
              <p className="feat-p">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── API ENDPOINTS ── */}
      <section id="api" className="api-section">
        <div className="api-inner">
          <div>
            <span className="section-tag">REST API</span>
            <h2 className="section-h">Simple endpoints,<br />powerful data.</h2>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>
              All geo endpoints authenticate via <code style={{ fontFamily: 'var(--fm)', color: 'var(--saffron)', fontSize: 13 }}>X-API-Key</code> and <code style={{ fontFamily: 'var(--fm)', color: 'var(--saffron)', fontSize: 13 }}>X-API-Secret</code> headers.
            </p>
            <div className="endpoint-list">
              {ENDPOINTS.map((ep, i) => (
                <div key={i} className={`ep ${activeEp === i ? 'active' : ''}`} onClick={() => setActiveEp(i)}>
                  <span className="ep-method">GET</span>
                  <span className="ep-path">{ep.path}</span>
                  <span className="ep-desc">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="code-window" style={{ alignSelf: 'flex-start' }}>
            <div className="code-bar">
              <span className="code-dot" style={{ background: '#FF5F57' }} />
              <span className="code-dot" style={{ background: '#FEBC2E' }} />
              <span className="code-dot" style={{ background: '#28C840' }} />
              <span className="code-title">{ENDPOINTS[activeEp].path}</span>
            </div>
            <pre className="code-response" style={{ fontSize: 13, background: 'transparent' }}>
              <span className="c-dim">// {ENDPOINTS[activeEp].desc}</span>{'\n\n'}
              {RESPONSE_SAMPLE}
            </pre>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section">
        <div className="section-head">
          <span className="section-tag">Pricing</span>
          <h2 className="section-h">Simple, transparent pricing.</h2>
          <p className="section-sub">Start free. No credit card required. Upgrade anytime as your usage grows.</p>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`price-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="price-amount">
                <span className="price-inr">{plan.price}</span>
                {plan.price !== '₹0' && <span className="price-period">/mo</span>}
              </div>
              <div className="price-requests">{plan.req}</div>
              <ul className="price-features">
                {plan.features.map(f => (
                  <li key={f} className="price-feature">
                    <CheckCircle size={15} color="#4ADE80" style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`price-cta ${plan.popular ? 'filled' : 'outline'}`}
              >
                {plan.price === '₹0' ? 'Start Free' : 'Get Started'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-banner">
        <div className="cta-inner">
          <h2 className="cta-h">Ready to build with Indian geo data?</h2>
          <p className="cta-p">Join developers already using Village API in production. Free tier, no credit card required.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-hero-primary">
              Create Free Account <ArrowRight size={19} />
            </Link>
            <a
              href="https://github.com/JayeshJadhav28/all-india-villages-api"
              target="_blank"
              rel="noreferrer"
              className="btn-hero-ghost"
            >
              <Cat size={18} /> Star on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-brand-logo-wrapper">
                <img 
                  src="https://all-india-villages-api.vercel.app/icon0.svg" 
                  alt="Village API Logo" 
                  className="footer-brand-logo"
                />
                <h3>Village API</h3>
              </div>
              <p>Standardised India geography data — Country, State, District, Sub-District, and Village — via a simple REST API.</p>
              <a
                href="https://github.com/JayeshJadhav28/all-india-villages-api"
                target="_blank"
                rel="noreferrer"
                className="gh-link"
              >
                <Cat size={16} /> JayeshJadhav28/all-india-villages-api
                <ExternalLink size={13} style={{ opacity: 0.5 }} />
              </a>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#api">API Reference</a></li>
                <li><Link to="/login">Dashboard</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Developer</h4>
              <ul className="footer-links">
                <li><a href="https://github.com/JayeshJadhav28/all-india-villages-api" target="_blank" rel="noreferrer">GitHub Repo</a></li>
                <li><a href="https://github.com/JayeshJadhav28/all-india-villages-api/blob/main/README.md" target="_blank" rel="noreferrer">README</a></li>
                <li><a href="https://drive.google.com/drive/folders/1B0jJA2BPozpOgt0rkkgOhW7XFsao8Sxi" target="_blank" rel="noreferrer">Dataset</a></li>
                <li><Link to="/register">Get API Key</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Data Sources</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-bottom-left">
              © 2026 Village API. Built with ❤️ by{' '}
              <a href="https://jayeshjadhav.com/" target="_blank" rel="noreferrer">Jayesh Jadhav</a>.
            </p>
            <div className="footer-bottom-right">
              <a
                href="https://github.com/JayeshJadhav28/all-india-villages-api"
                target="_blank"
                rel="noreferrer"
                className="gh-link"
              >
                <Cat size={15} /> GitHub
              </a>
              <a
                href="https://jayeshjadhav.com/"
                target="_blank"
                rel="noreferrer"
                className="gh-link"
              >
                <ExternalLink size={15} /> jayeshjadhav.com
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};