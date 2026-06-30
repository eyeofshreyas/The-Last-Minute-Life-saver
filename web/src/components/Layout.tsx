import { Outlet } from 'react-router-dom';
import type { User } from 'firebase/auth';
import Sidebar from './Sidebar';

interface Props {
  user: User;
}

export default function Layout({ user }: Props) {
  return (
    <div className="flex min-h-screen bg-surf-base">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
