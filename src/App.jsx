import React, { useState } from 'react';
import Welcome from './Welcome.jsx';
import Game from './Game.jsx';

// Two screens. The app always starts on WELCOME (even after a refresh);
// the chosen costume is remembered separately in localStorage by the game.
const SCREENS = { WELCOME: 'welcome', GAME: 'game' };

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);

  return screen === SCREENS.WELCOME ? (
    <Welcome onEnter={() => setScreen(SCREENS.GAME)} />
  ) : (
    <Game />
  );
}
