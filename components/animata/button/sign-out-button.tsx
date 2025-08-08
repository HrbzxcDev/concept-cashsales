import { LogOut } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface IGetStartedButtonProps {
  className?: string;
  href?: string;
  disabled?: boolean;
  type?: 'submit' | 'button' | 'reset';
  onClick?: () => void;
}

export default function SignOutButton({
  className,
  href,
  disabled,
  type = 'button',
  onClick
}: IGetStartedButtonProps) {
  const button = (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group flex items-center justify-center rounded-md p-1 font-medium sm:w-auto',
        'btn-grad bg-[length:200%_auto] transition-all duration-500',
        'bg-gradient-to-r from-[#232526] via-[#414345] to-[#232526]',
        'hover:bg-[position:right_center]',
        className
      )}
    >
      <div
        className={cn(
          'relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full',
          // 'bg-white/20'
        )}
      >
        <div className="absolute left-0 flex h-7 w-14 -translate-x-1/2 items-center justify-center transition-all duration-200 ease-in-out group-hover:translate-x-0">
          <LogOut
            size={16}
            className={cn(
              'size-7 transform p-1 text-white  opacity-0 group-hover:opacity-100'
            )}
          />
          <LogOut
            size={16}
            className={cn(
              'size-7 transform p-1 text-white opacity-100 transition-transform duration-300 ease-in-out group-hover:opacity-0'
            )}
          />
        </div>
      </div>
      <span
        className={cn('text-white text-sm transition-colors duration-100 ease-in-out')}
      >
      </span>
    </button>
  );

  if (href) {
    return <Link href={href}>{button}</Link>;
  }

  return <div className="">{button}</div>;
}



