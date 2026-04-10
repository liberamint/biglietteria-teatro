import * as React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'secondary';
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function PageShell({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        'min-h-screen',
        className
      )}
      {...props}
    />
  );
}

export function Container({
  className,
  wide = false,
  ...props
}: DivProps & { wide?: boolean }) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-3 sm:px-5',
        wide ? 'max-w-7xl' : 'max-w-5xl',
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        'rounded-[30px] border border-[#e2d1ba] bg-white/88 shadow-[0_10px_30px_rgba(90,24,33,0.07)] backdrop-blur',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        'border-b border-[#efe2d2] px-5 py-4 sm:px-6',
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        'text-lg font-semibold tracking-tight text-[#5a1821] sm:text-xl',
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        'px-5 py-5 sm:px-6 sm:py-6',
        className
      )}
      {...props}
    />
  );
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-2xl border border-[#d4b28a] bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition',
          'placeholder:text-[#9a8a7a]',
          'focus:border-[#8a3843] focus:ring-2 focus:ring-[#8a3843]/10',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-2xl border border-[#d4b28a] bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition',
          'placeholder:text-[#9a8a7a]',
          'focus:border-[#8a3843] focus:ring-2 focus:ring-[#8a3843]/10',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', type = 'button', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60';

    const styles = {
      primary:
        'border border-[#5a1821] bg-[#5a1821] text-white hover:bg-[#49141b]',
      outline:
        'border border-[#d4b28a] bg-white text-[#5a1821] hover:bg-[#fff8f0]',
      secondary:
        'border border-[#d7c3a6] bg-[#f7ecdf] text-[#5a1821] hover:bg-[#f3e5d4]',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, styles[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export function Badge({
  className,
  children,
  ...props
}: DivProps) {
  let tone =
    'border-[#d7c3a6] bg-[#fbf1e4] text-[#5a1821]';

  const label = String(children ?? '').toLowerCase();

  if (label.includes('pagato')) {
    tone = 'border-green-200 bg-green-50 text-green-700';
  } else if (label.includes('confermato')) {
    tone = 'border-[#d4b28a] bg-[#fff7ee] text-[#7a4b14]';
  } else if (label.includes('entrato')) {
    tone = 'border-blue-200 bg-blue-50 text-blue-700';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm',
        tone,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}