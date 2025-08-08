import { Plus } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface IGetStartedButtonProps {
  text: string;
  className?: string;
  href?: string;
}

export default function AddButton({
  text = '',
  className,
  href
}: IGetStartedButtonProps) {
  const button = (
    <button
      className={cn(
        'w-30 group flex h-10 items-center justify-center gap-3 rounded-md p-4 font-medium',
        'btn-grad bg-[length:200%_auto] transition-all duration-500',
        'bg-gradient-to-r from-[#2b5876] via-[#4e4376] to-[#2b5876]',
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
          'relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full',
          'bg-white/20'
        )}
      >
        <div className="absolute left-0 flex h-6 w-12 -translate-x-1/2 items-center justify-center transition-all duration-200 ease-in-out group-hover:translate-x-0">
          <Plus
            size={16}
            className={cn(
              'size-6 transform p-1 text-white opacity-0 group-hover:opacity-100'
            )}
          />
          <Plus
            size={16}
            className={cn(
              'size-6 transform p-1 text-white opacity-100 transition-transform duration-300 ease-in-out group-hover:opacity-0'
            )}
          />
        </div>
      </div>
    </button>
  );

  if (href) {
    return <Link href={href}>{button}</Link>;
  }

  return <div className="min-h-12 w-48">{button}</div>;
}

