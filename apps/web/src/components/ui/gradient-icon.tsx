import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react'; interface GradientIconProps { icon: LucideIcon; className?: string; size?: 'sm' | 'md' | 'lg'; gradient?: string;
} const sizeMap = { sm: { container: 'w-8 h-8', icon: 'w-4 h-4' }, md: { container: 'w-10 h-10', icon: 'w-5 h-5' }, lg: { container: 'w-12 h-12', icon: 'w-6 h-6' },
}; export function GradientIcon({ icon: Icon, className, size = 'md', gradient = 'from-yellow-400 to-amber-500' }: GradientIconProps) { const s = sizeMap[size]; return ( <div className={cn( s.container, `bg-gradient-to-br ${gradient}`, 'rounded-xl flex items-center justify-center shadow-sm', className )}> <Icon className={cn(s.icon, 'text-white')} /> </div> );
}
