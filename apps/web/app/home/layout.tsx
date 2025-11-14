import { use } from 'react';

import { cookies } from 'next/headers';

import {
  Page,
  PageLayoutStyle,
  PageMobileNavigation,
  PageNavigation,
} from '@kit/ui/page';
import { SidebarProvider } from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { navigationConfig } from '~/config/navigation.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

// home imports
import { HomeMenuNavigation } from './_components/home-menu-navigation';
import { HomeMobileNavigation } from './_components/home-mobile-navigation';
import { HomeSidebar } from './_components/home-sidebar';

function HomeLayout({ children }: React.PropsWithChildren) {
  // Require user + get layout style in parallel
  const [user, style] = use(
    Promise.all([requireUserInServerComponent(), getLayoutStyle()]),
  );

  if (style === 'sidebar') {
    return <SidebarLayout user={user}>{children}</SidebarLayout>;
  }

  return <HeaderLayout user={user}>{children}</HeaderLayout>;
}

export default withI18n(HomeLayout);

type LayoutProps = React.PropsWithChildren<{
  user: Awaited<ReturnType<typeof requireUserInServerComponent>>;
}>;

function SidebarLayout({ children, user }: LayoutProps) {
  const sidebarMinimized = navigationConfig.sidebarCollapsed;

  return (
    <SidebarProvider defaultOpen={sidebarMinimized}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <HomeSidebar user={user} />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <MobileNavigation />
        </PageMobileNavigation>

        {children}
      </Page>
    </SidebarProvider>
  );
}

function HeaderLayout({ children }: LayoutProps) {
  return (
    <Page style={'header'}>
      <PageNavigation>
        <HomeMenuNavigation />
      </PageNavigation>

      <PageMobileNavigation className={'flex items-center justify-between'}>
        <MobileNavigation />
      </PageMobileNavigation>

      {children}
    </Page>
  );
}

function MobileNavigation() {
  return (
    <>
      <AppLogo />
      <HomeMobileNavigation />
    </>
  );
}

async function getLayoutStyle() {
  const cookieStore = await cookies();

  return (
    (cookieStore.get('layout-style')?.value as PageLayoutStyle) ??
    navigationConfig.style
  );
}
