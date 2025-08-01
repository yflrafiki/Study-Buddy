'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  CalendarDays,
  FileQuestion,
  LayoutDashboard,
  GraduationCap,
  Mic,
  ImagePlay,
  BookOpen,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mcq-generator', label: 'MCQ Generator', icon: FileQuestion },
  { href: '/chatbot', label: 'AI Chatbot', icon: Bot },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { href: '/transcription', label: 'Note Taker', icon: Mic },
  { href: '/image-animator', label: 'Image Animator', icon: ImagePlay },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold text-sidebar-foreground">ScholarAI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="md:hidden flex items-center justify-between p-2 border-b">
             <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold">ScholarAI</span>
             </div>
             <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
