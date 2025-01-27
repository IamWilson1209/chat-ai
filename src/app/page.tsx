'use client';

import LeftDashboard from '@/components/home/(left-dashboard)/page';
import RightDashboard from '@/components/home/(right-dashboard)/page';

export default function Home() {
  return (
    <main className="m-5">
      <div className="flex overflow-y-hidden h-[calc(100vh-50px) max-w-[1700px] mx-auto bg-left-dashboard">
        {/* background decorator for Light Mode */}
        <div className="fixed top-0 left-0 w-full h-36 dark:bg-transparent -z-30" />
        <LeftDashboard />
        <RightDashboard />
      </div>
    </main>
  );
}
