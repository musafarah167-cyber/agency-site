'use client';

import { useEffect, useRef } from 'react';

type Scene = { dispose: () => void };
type SceneModule = {
  initHeroScene: (options: {
    canvas: HTMLCanvasElement;
    stage: HTMLElement;
    onReady: (ready: boolean) => void;
  }) => Promise<Scene>;
};

export default function HeroArt() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = stage.current,
      surface = canvas.current;
    if (!el || !surface) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType || ''))
      return;
    let scene: Scene | undefined,
      visible = false,
      pending = false,
      disposed = false,
      posterReady = false;
    function sync() {
      if (disposed || !el || !surface) return;
      if (motion.matches) {
        scene?.dispose();
        scene = undefined;
        el.dataset.ready = 'false';
        return;
      }
      if (!posterReady || !visible || pending || scene) return;
      pending = true;
      const url = '/assets/js/hero-3d.js';
      void (async () => {
        try {
          const mod: SceneModule = await import(/* webpackIgnore: true */ url);
          if (disposed || motion.matches) return;
          const next = await mod.initHeroScene({
            canvas: surface,
            stage: el,
            onReady: (ready) => {
              if (!disposed) el.dataset.ready = String(ready);
            },
          });
          if (disposed || motion.matches) next.dispose();
          else scene = next;
        } catch {
          if (!disposed) el.dataset.ready = 'false';
        } finally {
          pending = false;
        }
      })();
    }
    // On a phone, paint the small still and the headline before loading the 3D engine.
    const poster = el.querySelector('img');
    const paint = () => {
      if (!disposed)
        requestAnimationFrame(() => {
          posterReady = true;
          sync();
        });
    };
    if (poster) void poster.decode().then(paint, paint);
    else paint();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    motion.addEventListener('change', sync);
    return () => {
      disposed = true;
      observer.disconnect();
      motion.removeEventListener('change', sync);
      scene?.dispose();
    };
  }, []);
  return (
    <div ref={stage} className="hero-art" aria-hidden="true">
      <picture>
        <source media="(max-width: 650px)" srcSet="/assets/hero-small.webp" />
        <img src="/assets/hero-large.webp" alt="" width="1320" height="1016" fetchPriority="high" />
      </picture>
      <canvas ref={canvas} />
    </div>
  );
}
