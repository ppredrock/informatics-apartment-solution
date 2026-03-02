"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { start, done, useRouteProgress } from "@/hooks/use-route-progress";

function RouteChangeDetector() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    done();
  }, [pathname, searchParams]);

  return null;
}

export function RouteProgressBar() {
  const { progress, active } = useRouteProgress();
  const pathnameRef = useRef<string | null>(null);

  useEffect(() => {
    pathnameRef.current = window.location.pathname;

    function getAnchorHref(target: EventTarget | null): string | null {
      let el = target as HTMLElement | null;
      while (el) {
        if (el.tagName === "A") {
          return (el as HTMLAnchorElement).href;
        }
        el = el.parentElement;
      }
      return null;
    }

    function isInternalNavigation(href: string): boolean {
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return false;
        if (url.pathname === pathnameRef.current) return false;
        return true;
      } catch {
        return false;
      }
    }

    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const href = getAnchorHref(e.target);
      if (href && isInternalNavigation(href)) {
        start();
      }
    }

    function handlePopState() {
      if (window.location.pathname !== pathnameRef.current) {
        start();
      }
    }

    // Monkey-patch history methods to catch router.push / router.replace
    const origPushState = history.pushState.bind(history);
    const origReplaceState = history.replaceState.bind(history);

    history.pushState = function (...args) {
      origPushState(...args);
      const newPath =
        typeof args[2] === "string"
          ? new URL(args[2], window.location.origin).pathname
          : window.location.pathname;
      if (newPath !== pathnameRef.current) {
        pathnameRef.current = newPath;
        start();
      }
    };

    history.replaceState = function (...args) {
      origReplaceState(...args);
      const newPath =
        typeof args[2] === "string"
          ? new URL(args[2], window.location.origin).pathname
          : window.location.pathname;
      if (newPath !== pathnameRef.current) {
        pathnameRef.current = newPath;
        start();
      }
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      history.pushState = origPushState;
      history.replaceState = origReplaceState;
    };
  }, []);

  return (
    <>
      <Suspense>
        <RouteChangeDetector />
      </Suspense>
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-hidden={!active}
        className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
        style={{ opacity: active || progress === 100 ? 1 : 0 }}
      >
        <div
          className="h-full bg-primary origin-left progress-bar"
          style={{
            transform: `scaleX(${progress / 100})`,
            transition:
              progress === 100
                ? "transform 200ms ease-out, opacity 300ms ease 200ms"
                : progress === 10
                  ? "transform 0ms"
                  : "transform 200ms linear",
            opacity: progress === 100 ? 0 : 1,
          }}
        >
          <div className="progress-shimmer absolute right-0 top-0 h-full w-20 opacity-80" />
        </div>
      </div>
    </>
  );
}
