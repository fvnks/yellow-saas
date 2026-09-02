import AutoTalleresSidebar from './components/sidebar';

interface Props {
  children: React.ReactNode;
}

export default function AutoTalleresLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 h-screen fixed left-0 top-0 border-r border-slate-800 z-20">
        <AutoTalleresSidebar />
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 ml-64 pt-16">
        {children}
      </div>
    </div>
  );
}
