import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Tag, MessageSquare, Users, BarChart3, Menu } from 'lucide-react';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${params.locale}/auth/login`);
  }

  // TODO: Add proper admin role check
  // For now, check if user is admin
  const adminEmails = [
    'admin@giftcards.com', 
    'test@test.com', 
    '123aijsdfhawe08912ea@asihjfbo.comasiaug' // lowercase because Supabase stores emails in lowercase
  ];
  
  // Case-insensitive email comparison
  const userEmailLower = (user.email || '').toLowerCase();
  if (!adminEmails.some(email => email.toLowerCase() === userEmailLower)) {
    redirect(`/${params.locale}`);
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: `/${params.locale}/admin`,
      icon: BarChart3,
    },
    {
      name: 'Promo Codes',
      href: `/${params.locale}/admin/promo-codes`,
      icon: Tag,
    },
    {
      name: 'Reviews',
      href: `/${params.locale}/admin/reviews`,
      icon: MessageSquare,
    },
    {
      name: 'Referrals',
      href: `/${params.locale}/admin/referrals`,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-background-secondary border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <Menu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/${params.locale}`}
                className="text-text-secondary hover:text-white transition-colors"
              >
                ← Back to Site
              </Link>
              <div className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-background-secondary hover:text-white transition-all group"
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
