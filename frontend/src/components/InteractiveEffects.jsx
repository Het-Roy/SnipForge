import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setHoveringInteractive,
  setPointerInside,
  setPointerPosition,
  setPointerPressed,
} from '../store/uiEffectsSlice';

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  '[role="button"]',
  '[class*="cursor-pointer"]',
  '.card',
].join(', ');

const tagInteractiveElements = () => {
  document.querySelectorAll(INTERACTIVE_SELECTOR).forEach((element) => {
    element.classList.add('fx-surface');
  });
};

const InteractiveEffects = () => {
  const dispatch = useDispatch();
  const { activeX, activeY, isInside, isPressed, isHoveringInteractive } = useSelector(
    (state) => state.uiEffects
  );

  useEffect(() => {
    let frameId = null;
    const handlePointerEnter = () => dispatch(setPointerInside(true));
    const handlePointerLeave = () => dispatch(setPointerInside(false));
    const handlePointerDown = () => dispatch(setPointerPressed(true));
    const handlePointerUp = () => dispatch(setPointerPressed(false));

    const updatePointerPosition = (event) => {
      if (frameId) {
        return;
      }

      const { clientX, clientY } = event;

      frameId = window.requestAnimationFrame(() => {
        dispatch(setPointerPosition({ x: clientX, y: clientY }));
        frameId = null;
      });
    };

    const updateHoverState = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      dispatch(setHoveringInteractive(Boolean(target?.closest(INTERACTIVE_SELECTOR))));
    };

    tagInteractiveElements();

    const observer = new MutationObserver(() => {
      tagInteractiveElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('pointermove', updatePointerPosition, { passive: true });
    window.addEventListener('pointerenter', handlePointerEnter);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mouseover', updateHoverState);
    document.addEventListener('focusin', updateHoverState);
    document.addEventListener('mouseout', updateHoverState);

    return () => {
      observer.disconnect();
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('pointermove', updatePointerPosition);
      window.removeEventListener('pointerenter', handlePointerEnter);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseover', updateHoverState);
      document.removeEventListener('focusin', updateHoverState);
      document.removeEventListener('mouseout', updateHoverState);
    };
  }, [dispatch]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <div className="fx-grid" />
      <div
        className={`fx-mouse-glow ${isInside ? 'opacity-100' : 'opacity-0'} ${
          isHoveringInteractive ? 'fx-mouse-glow-active' : ''
        } ${isPressed ? 'scale-90' : 'scale-100'}`}
        style={{
          transform: `translate(${activeX}px, ${activeY}px) translate(-50%, -50%)`,
        }}
      />
      <div
        className={`fx-mouse-ring ${isInside ? 'opacity-100' : 'opacity-0'} ${
          isHoveringInteractive ? 'fx-mouse-ring-active' : ''
        }`}
        style={{
          transform: `translate(${activeX}px, ${activeY}px) translate(-50%, -50%)`,
        }}
      />
      <div className="fx-ambient fx-ambient-one" />
      <div className="fx-ambient fx-ambient-two" />
    </div>
  );
};

export default InteractiveEffects;
