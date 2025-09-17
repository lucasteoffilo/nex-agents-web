'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  FolderOpen,
  Users,
  Bot,
  Ticket,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  BookMinus,
  BookCopy,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
    badge: '3',
  },
  {
    title: 'Conhecimento',
    href: '/dashboard/knowledge',
    icon: BookCopy,
    children: [
      {
        title: 'Coleção',
        href: '/dashboard/knowledge/collections',
        icon: FolderOpen,
      },
      // {
      //   title: 'Documentos',
      //   href: '/dashboard/knowledge/documents',
      //   icon: FileText,
      // },
      // {
      //   title: 'Upload',
      //   href: '/dashboard/knowledge/upload',
      //   icon: FileText,
      // },
    ],
  },
  // {
  //   title: 'Atendimento',
  //   href: '/dashboard/support',
  //   icon: Ticket,
  //   badge: '12',
  //   children: [
  //     {
  //       title: 'Tickets',
  //       href: '/dashboard/support/tickets',
  //       icon: Ticket,
  //     },
  //     {
  //       title: 'Histórico',
  //       href: '/dashboard/support/history',
  //       icon: Ticket,
  //     },
  //   ],
  // },
  {
    title: 'Agentes IA',
    href: '/dashboard/agentes',
    icon: Bot,
    // children: [
    //   {
    //     title: 'Treinamento',
    //     href: '/dashboard/agentes/training',
    //     icon: Bot,
    //   },
    // ],
  },
  {
    title: 'CRM',
    href: '/dashboard/crm',
    icon: Users,
    children: [
      {
        title: 'Contatos',
        href: '/dashboard/crm/contacts',
        icon: Users,
      },
      {
        title: 'Deals',
        href: '/dashboard/crm/deals',
        icon: Users,
      },
    ],
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useMultiTenantAuth();

  // Auto-expandir menus que contêm a página atual
  useEffect(() => {
    const itemsToExpand: string[] = [];
    
    sidebarItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          pathname === child.href || pathname.startsWith(child.href + '/')
        );
        
        if (hasActiveChild) {
          itemsToExpand.push(item.href);
        }
      }
    });
    
    setExpandedItems(prev => {
      const newExpanded = Array.from(new Set([...prev, ...itemsToExpand]));
      return newExpanded;
    });
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string, item?: SidebarItem) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    
    // Verificar se é um item filho
    const parentWithChildren = sidebarItems.find(parentItem => 
      parentItem.children?.some(child => child.href === href)
    );
    
    // Se é um item filho
    if (parentWithChildren) {
      // Para filhos, usar correspondência exata ou startsWith
      return pathname === href || pathname.startsWith(href + '/');
    }
    
    // Encontrar o item pai atual
    const parentItem = sidebarItems.find(item => item.href === href);
    
    // Se é um item pai com filhos
    if (parentItem?.children) {
      // Verificar se algum filho (que não seja o próprio pai) está ativo
      const hasActiveChild = parentItem.children.some(child => {
        // Se o filho tem href diferente do pai, verificar se está ativo
        if (child.href !== href) {
          return pathname === child.href || pathname.startsWith(child.href + '/');
        }
        return false;
      });
      
      // Se tem filho ativo (diferente do pai), o pai não deve estar ativo
      if (hasActiveChild) {
        return false;
      }
      
      // Caso contrário, só ativar se for correspondência exata
      return pathname === href;
    }
    
    // Para itens sem filhos, usar correspondência exata ou startsWith
    return pathname === href || pathname.startsWith(href + '/');
  };

  const SidebarItem = ({ item, level = 0 }: { item: SidebarItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const active = isActive(item.href);

    return (
      <div className="space-y-1">
        <div className="relative">
          {hasChildren ? (
            <div className="flex items-center">
              <Link
                href={item.href}
                className={cn(
                  'flex-1 flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group',
                  level > 0 && 'ml-4 pl-6',
                  active
                    ? 'bg-brand-500 text-brand-foreground shadow-lg shadow-brand-500/25'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-brand-500/10 dark:hover:bg-brand-500/10'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={cn(
                  'h-5 w-5 transition-colors',
                  active ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                )} />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant={active ? "secondary" : "default"} 
                    className="ml-auto text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
              <button
                onClick={() => toggleExpanded(item.href)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  level > 0 && 'mr-4',
                  active
                    ? 'text-white hover:bg-brand-600'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <ChevronDown className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )} />
              </button>
            </div>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group',
                level > 0 && 'ml-4 pl-6',
                active
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-brand-500/10 dark:hover:bg-brand-500/10'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={cn(
                'h-5 w-5 transition-colors',
                active ? 'text-white' : 'text-gray-500 dark:text-gray-400'
              )} />
              <span>{item.title}</span>
              {item.badge && (
                <Badge 
                  variant={active ? "secondary" : "default"} 
                  className="ml-auto text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1 animate-accordion-down">
            {item.children?.map((child) => (
              <SidebarItem key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image
                src="/nex-logo.png"
                alt="NEX Platform"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => (
              <SidebarItem key={item.href} item={item} />
            ))}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Theme toggle */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <Button
                  variant={theme === 'light' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="h-8 w-8 p-0"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="h-8 w-8 p-0"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="h-8 w-8 p-0"
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}