import { LogIn } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface IGetStartedButtonProps {
  text: string;
  className?: string;
  href?: string;
  disabled?: boolean;
  type?: 'submit' | 'button' | 'reset';
  onClick?: () => void;
}

export default function LoginButton({
  text = '',
  className,
  href
}: IGetStartedButtonProps) {
  const button = (
    <button
      className={cn(
        'group flex h-10 w-full items-center justify-center gap-3 rounded-md p-4 font-medium sm:w-auto',
        'btn-grad bg-[length:200%_auto] transition-all duration-500',
        'bg-gradient-to-r from-[#556270] via-[#FF6B6B] to-[#556270]',
        'hover:bg-[position:right_center]',
        className
      )}
    >
      <span
        className={cn('text-white text-sm transition-colors duration-100 ease-in-out')}
      >
        {text}
      </span>
      <div
        className={cn(
          'relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full',
          // 'bg-white/20'
        )}
      >
        <div className="absolute left-0 flex h-7 w-14 -translate-x-1/2 items-center justify-center transition-all duration-200 ease-in-out group-hover:translate-x-0">
          <LogIn
            size={16}
            className={cn(
              'size-7 transform p-1 text-white opacity-0 group-hover:opacity-100'
            )}
          />
          <LogIn
            size={16}
            className={cn(
              'size-7 transform p-1 text-white opacity-100 transition-transform duration-300 ease-in-out group-hover:opacity-0'
            )}
          />
        </div>
      </div>
    </button>
  );

  if (href) {
    return <Link href={href}>{button}</Link>;
  }

  return <div className="">{button}</div>;
}
