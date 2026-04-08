import { ReactNode } from 'react';
import clsx from 'clsx';

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-zinc-50 p-4 md:p-8">{children}</main>;
}

export function Container({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={clsx('mx-auto', wide ? 'max-w-6xl' : 'max-w-2xl')}>{children}</div>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-3xl border bg-white shadow-sm', className)}>{children}</div>;
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="border-b p-6">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="p-6">{children}</div>;
}

export function Button({ children, className = '', variant = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'secondary' }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition',
        variant === 'default' && 'bg-zinc-900 text-white hover:bg-zinc-800',
        variant === 'outline' && 'border bg-white hover:bg-zinc-100',
        variant === 'secondary' && 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm" {...props} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm" {...props} />;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium">{children}</span>;
}
