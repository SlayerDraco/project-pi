import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Accessibility Layer — Keyboard Orbit
 * -----------------------------------------------------
 * OrbitControls from drei only respond to mouse/touch by default. This
 * hook lets arrow keys rotate a group directly, so exhibits remain
 * explorable via keyboard alone. Attach the returned ref to the group
 * you want to rotate, and render the returned hint text near the canvas
 * (or pass to an aria-label) so keyboard users know the controls exist.
 */
export function useKeyboardOrbit(speed = 1.2) {
  const ref = useRef();
  const keys = useRef({ left: false, right: false, up: false, down: false });

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'ArrowLeft') keys.current.left = true;
      if (e.key === 'ArrowRight') keys.current.right = true;
      if (e.key === 'ArrowUp') keys.current.up = true;
      if (e.key === 'ArrowDown') keys.current.down = true;
    };
    const up = (e) => {
      if (e.key === 'ArrowLeft') keys.current.left = false;
      if (e.key === 'ArrowRight') keys.current.right = false;
      if (e.key === 'ArrowUp') keys.current.up = false;
      if (e.key === 'ArrowDown') keys.current.down = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const k = keys.current;
    if (k.left) ref.current.rotation.y -= speed * dt;
    if (k.right) ref.current.rotation.y += speed * dt;
    if (k.up) ref.current.rotation.x -= speed * dt;
    if (k.down) ref.current.rotation.x += speed * dt;
  });

  return ref;
}
