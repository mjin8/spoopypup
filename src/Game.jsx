import React, { useCallback, useEffect, useRef, useState } from 'react';

// Every path is relative to the page, so it works in `vite dev`, in `dist/`,
// and when the build is hosted inside a sub-folder (like a Claude Artifact).
const BASE = import.meta.env.BASE_URL; // './'
const asset = (path) => `${BASE}assets/${path}`;

const IMG = {
  background: asset('scene/empty_pumpkin_background.png'),
  trick: asset('ui/button_trick.png'),
  treat: asset('ui/button_treat.png'),
  candy: asset('effects/candy.png'),
  heart: asset('effects/heart.png'),
  sparkles: asset('effects/sparkles.png'),
};

// The TRICK costumes, in cycle order. All sprites share one 640x580 canvas
// with the paws on the same baseline, but the puppy itself is drawn at a
// different size in each file. `fit` scales each sprite (around its paws) so
// the puppy's body comes out the same size in every costume.
// Measured per sprite: eye-line-to-paws height and ear-to-ear head width,
// relative to puppy_normal.png. fit = TARGET / measured size.
const TARGET_SIZE = 0.85;
const COSTUMES = [
  { id: 'ghost', label: 'Ghost', size: 1.0 },
  { id: 'pumpkin', label: 'Pumpkin', size: 0.8 },
  { id: 'bat', label: 'Bat', size: 0.87 },
  { id: 'wizard', label: 'Wizard', size: 0.73 },
  { id: 'stripes', label: 'Stripes', size: 0.885 },
  { id: 'cinema', label: 'Spooky movie mask', size: 0.96 },
  { id: 'monster', label: 'Frankenpup', size: 1.0 }, // pre-fitted to match puppy_normal
].map((c) => ({
  ...c,
  fit: +(TARGET_SIZE / c.size).toFixed(3),
  src: asset(`sprites/puppy_${c.id}.png`),
}));

const START_INDEX = 1; // pumpkin
const STORAGE_KEY = 'spoopy-pup:costume';
const TREAT_MS = 2000;
const SWAP_DELAY_MS = 120; // swap costume under the sparkle burst

function loadCostumeIndex() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const i = COSTUMES.findIndex((c) => c.id === saved);
    return i >= 0 ? i : START_INDEX;
  } catch {
    return START_INDEX;
  }
}

function saveCostume(id) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* storage blocked (private mode etc.) — the game still works */
  }
}

// Restart a CSS animation class on an element, even mid-animation.
function replay(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // force reflow so the animation starts over
  el.classList.add(className);
}

// Everything the game screen shows, so the welcome screen can preload it.
export const GAME_IMAGES = Object.values(IMG).concat(COSTUMES.map((c) => c.src));

export default function Game() {
  const [costumeIndex, setCostumeIndex] = useState(loadCostumeIndex);
  const [sparkleId, setSparkleId] = useState(0);
  const [treatId, setTreatId] = useState(0);
  const [treating, setTreating] = useState(false);
  const [brokenImages, setBrokenImages] = useState([]);

  const trickLayer = useRef(null);
  const treatLayer = useRef(null);
  const treatTimer = useRef(null);
  const trickButton = useRef(null);

  const costume = COSTUMES[costumeIndex];

  useEffect(() => saveCostume(costume.id), [costume.id]);

  // Arriving from the welcome door: put keyboard focus on the first game button.
  useEffect(() => {
    trickButton.current?.focus({ preventScroll: true });
  }, []);

  // Preload every sprite so costume swaps never flash empty.
  useEffect(() => {
    GAME_IMAGES.forEach((src) => {
      const img = new Image();
      img.onerror = () => setBrokenImages((b) => (b.includes(src) ? b : [...b, src]));
      img.src = src;
    });
    return () => clearTimeout(treatTimer.current);
  }, []);

  const handleTrick = useCallback(() => {
    setSparkleId((n) => n + 1);
    replay(trickLayer.current, 'is-poofing');
    setTimeout(() => setCostumeIndex((i) => (i + 1) % COSTUMES.length), SWAP_DELAY_MS);
  }, []);

  const handleTreat = useCallback(() => {
    clearTimeout(treatTimer.current);
    setTreatId((n) => n + 1);
    setTreating(true);
    replay(treatLayer.current, 'is-treating');
    treatTimer.current = setTimeout(() => {
      setTreating(false);
      treatLayer.current?.classList.remove('is-treating');
    }, TREAT_MS);
  }, []);

  return (
    <main className="app">
      <div className="stage stage--game">
        <img className="scene" src={IMG.background} alt="" draggable="false" />

        <h1 className="sr-only">SPOOPY PUP</h1>

        {/* The puppy: one sprite, layered wrappers so idle, treat and trick
            transforms stack without fighting each other. */}
        <div className="pup">
          <div className="pup-idle">
            <div className="pup-treat" ref={treatLayer}>
              <div className="pup-trick" ref={trickLayer}>
                <img
                  className="pup-sprite"
                  src={costume.src}
                  alt={`Brown and white puppy in a ${costume.label.toLowerCase()} costume`}
                  style={{ transform: `scale(${costume.fit})` }}
                  draggable="false"
                />
              </div>
            </div>
          </div>

          {sparkleId > 0 && (
            <img key={`s${sparkleId}`} className="fx-sparkles" src={IMG.sparkles} alt="" draggable="false" />
          )}

          {treating && (
            <React.Fragment key={`t${treatId}`}>
              <img className="fx-candy" src={IMG.candy} alt="" draggable="false" />
              <img className="fx-heart h1" src={IMG.heart} alt="" draggable="false" />
              <img className="fx-heart h2" src={IMG.heart} alt="" draggable="false" />
              <img className="fx-heart h3" src={IMG.heart} alt="" draggable="false" />
            </React.Fragment>
          )}
        </div>

        <div className="buttons">
          <button
            type="button"
            className="game-btn"
            onClick={handleTrick}
            aria-label="Trick: change costume"
            ref={trickButton}
          >
            <img src={IMG.trick} alt="" draggable="false" />
          </button>
          <button type="button" className="game-btn" onClick={handleTreat} aria-label="Treat: give the puppy a candy">
            <img src={IMG.treat} alt="" draggable="false" />
          </button>
        </div>

        <p className="sr-only" aria-live="polite">
          {`Costume: ${costume.label}.${treating ? ' Yum, a treat!' : ''}`}
        </p>

        {/* Warm glow from the doorway that fades as we arrive inside */}
        <div className="enter-glow" aria-hidden="true" />

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
