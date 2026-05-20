import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DeferredRenderProps {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: number;
  placeholder?: ReactNode;
}

export function DeferredRender({
  children,
  rootMargin = '200px',
  minHeight = 220,
  placeholder,
}: DeferredRenderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref}>
      {visible ? (
        children
      ) : (
        placeholder ?? <div className="animate-pulse bg-white/5 rounded-xl" style={{ minHeight }} />
      )}
    </div>
  );
}

