import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  BreadcrumbSchema,
  type BreadcrumbItem,
} from '@/shared/components/SEO/BreadcrumbSchema';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Include structured data schema (default: true) */
  includeSchema?: boolean;
}

/**
 * Breadcrumb navigation component with SEO-optimized structured data
 * Displays hierarchical navigation path and generates BreadcrumbList schema
 *
 * @example
 * <Breadcrumbs
 *   items={[
 *     { name: 'Home', url: '/' },
 *     { name: 'Academy', url: '/academy' },
 *     { name: 'Learn Hiragana', url: '/academy/learn-hiragana' }
 *   ]}
 * />
 */
export function Breadcrumbs({
  items,
  className,
  includeSchema = true,
}: BreadcrumbsProps) {
  // Don't render if less than 2 items (Home only)
  if (items.length < 2) {
    return null;
  }

  return (
    <>
      {includeSchema && <BreadcrumbSchema items={items} />}
      <nav
        aria-label='Breadcrumb'
        className={cn('mb-4 flex items-center space-x-2 text-sm', className)}
      >
        <ol className='flex items-center space-x-2'>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.url} className='flex items-center space-x-2'>
                {index > 0 && (
                  <ChevronRight
                    className='h-4 w-4 text-muted-foreground'
                    aria-hidden='true'
                  />
                )}

                {isLast ? (
                  <span
                    className='font-medium text-foreground'
                    aria-current='page'
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className='text-muted-foreground transition-colors hover:text-foreground'
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
