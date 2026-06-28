import { createContext, useCallback, useContext, useState } from 'react';

type SnackbarVariant = 'error' | 'success' | 'info';

interface SnackbarItem {
  id: number;
  message: string;
  variant: SnackbarVariant;
}

interface SnackbarContextValue {
  showSnackbar: (message: string, variant?: SnackbarVariant) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

const AUTO_DISMISS_MS = 3500;

const variantStyles: Record<SnackbarVariant, string> = {
  error:   'border-red-500/40   bg-red-950/80   text-red-300',
  success: 'border-green-500/40 bg-green-950/80 text-green-300',
  info:    'border-marquee-gold/40 bg-velvet-900/90 text-marquee-gold',
};

const iconMap: Record<SnackbarVariant, string> = {
  error:   '✕',
  success: '✓',
  info:    '·',
};

function SnackbarToast({
  snack,
  onDismiss,
}: {
  snack: SnackbarItem;
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className={`
        flex items-center gap-3 rounded-lg border px-4 py-3
        font-mono text-sm shadow-xl backdrop-blur-sm
        animate-[snack-in_0.25s_ease-out]
        ${variantStyles[snack.variant]}
      `}
    >
      <span className="shrink-0 text-xs">{iconMap[snack.variant]}</span>
      <span className="max-w-xs leading-snug">{snack.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(snack.id)}
        className="ml-2 shrink-0 opacity-50 transition hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snacks, setSnacks] = useState<SnackbarItem[]>([]);

  const showSnackbar = useCallback(
    (message: string, variant: SnackbarVariant = 'info') => {
      const id = Date.now();
      setSnacks((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setSnacks((prev) => prev.filter((s) => s.id !== id));
      }, AUTO_DISMISS_MS);
    },
    []
  );

  const dismiss = useCallback((id: number) => {
    setSnacks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {/* Portal anchor — fixed bottom centre */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col-reverse items-center gap-2">
        {snacks.map((snack) => (
          <div key={snack.id} className="pointer-events-auto">
            <SnackbarToast snack={snack} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used inside <SnackbarProvider>');
  return ctx;
}