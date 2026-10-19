import React, { useEffect, useRef, useState } from 'react';
import { GAME_IMAGES } from './Game.jsx';

const BASE = import.meta.env.BASE_URL; // './'
const w = (name) => `${BASE}assets/welcome/${name}.png`;

// Welcome-screen art. The door is split into layers (all on the same
// 640x836 canvas, so they line up exactly):
//   door_inside       – glowing doorway seen through the open door
//   door_frame        – stone arch, skull and leaves (hollow in the middle)
//   door_leaf_closed  – the closed wooden door
//   door_leaf_open    – the same door swung open
const ART = {
  title: w('title'),
  moon: w('moon'),
  starBig: w('star_big'),
  starMid: w('star_mid'),
  starSmall: w('star_small'),
  bat1: w('bat_1'),
  bat2: w('bat_2'),
  lantern: w('lantern'),
  ground: w('ground'),
  doorInside: w('door_inside'),
  doorFrame: w('door_frame'),
  doorLeafClosed: w('door_leaf_closed'),
  doorLeafOpen: w('door_leaf_open'),
  open: w('button_open'),
};

const OPEN_MS = 1000;
const OPEN_MS_REDUCED = 450;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Welcome({ onEnter }) {
  const [opening, setOpening] = useState(false);
  const [brokenImages, setBrokenImages] = useState([]);
  const timer = useRef(null);

  // Preload the door layers and the whole game, so entering is instant.
  useEffect(() => {
    Object.values(ART)
      .concat(GAME_IMAGES)
      .forEach((src) => {
        const img = new Image();
        img.onerror = () => setBrokenImages((b) => (b.includes(src) ? b : [...b, src]));
        img.src = src;
      });
    return () => clearTimeout(timer.current);
  }, []);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    timer.current = setTimeout(onEnter, prefersReducedMotion() ? OPEN_MS_REDUCED : OPEN_MS);
  };

  const img = (className, src) => <img className={className} src={src} alt="" draggable="false" />;

  return (
    <main className="app">
      <div className={`stage stage--welcome${opening ? ' is-opening' : ''}`}>
        <h1 className="sr-only">SPOOPY PUP</h1>

        {img('w-ground', ART.ground)}
        {img('w-moon', ART.moon)}
        {img('w-star w-star--a', ART.starBig)}
        {img('w-star w-star--b', ART.starSmall)}
        {img('w-star w-star--c', ART.starSmall)}
        {img('w-star w-star--d', ART.starMid)}
        {img('w-bat w-bat--a', ART.bat1)}
        {img('w-bat w-bat--b', ART.bat2)}
        {img('w-title', ART.title)}
        {img('w-lantern', ART.lantern)}

        <div className="door" role="img" aria-label={opening ? 'The door swings open' : 'A closed wooden Halloween door'}>
          <div className="door-glow" />
          {img('door-layer door-inside', ART.doorInside)}
          {img('door-layer door-frame', ART.doorFrame)}
          {img('door-layer door-leaf-closed', ART.doorLeafClosed)}
          {img('door-layer door-leaf-open', ART.doorLeafOpen)}
          {opening && (
            <div className="door-sparkles" aria-hidden="true">
              {img('door-spark s1', ART.starMid)}
              {img('door-spark s2', ART.starSmall)}
              {img('door-spark s3', ART.starSmall)}
              {img('door-spark s4', ART.starMid)}
              {img('door-spark s5', ART.starSmall)}
            </div>
          )}
        </div>

        <button
          type="button"
          className="open-btn"
          onClick={handleOpen}
          aria-label="Open the door"
          aria-disabled={opening}
        >
          <img src={ART.open} alt="" draggable="false" />
        </button>

        {/* Warm flash as we step through; the game screen fades it back out */}
        <div className="welcome-flash" aria-hidden="true" />

        {brokenImages.length > 0 && (
          <div className="load-error" role="alert">
            Some game images didn’t load ({brokenImages.length}). Check that the <code>assets</code> folder
            sits next to this page.
          </div>
        )}
      </div>
    </main>
  );
}
