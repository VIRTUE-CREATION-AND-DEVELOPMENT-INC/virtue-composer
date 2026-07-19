import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  root = null;
  rootMargin = "0px";
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

Object.defineProperty(globalThis, "ResizeObserver", { value: ResizeObserverMock, writable: true });
Object.defineProperty(globalThis, "IntersectionObserver", { value: IntersectionObserverMock, writable: true });
Object.defineProperty(Element.prototype, "hasPointerCapture", { value: () => false });
Object.defineProperty(Element.prototype, "setPointerCapture", { value: () => {} });
Object.defineProperty(Element.prototype, "releasePointerCapture", { value: () => {} });
Object.defineProperty(Element.prototype, "scrollIntoView", { value: () => {} });
Object.defineProperty(window, "matchMedia", {
  value: (query: string) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }),
  writable: true,
});
