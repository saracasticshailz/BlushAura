import type { ButtonHTMLAttributes } from 'react';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'plain' | 'primary' | 'icon' | 'outline' | 'text';
};
const styles = {
  plain: '',
  primary: 'primary',
  icon: 'icon-button',
  outline: 'outline',
  text: 'text-link',
};
export function Button({ variant = 'plain', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={[styles[variant], className].filter(Boolean).join(' ') || undefined}
      {...props}
    />
  );
}
