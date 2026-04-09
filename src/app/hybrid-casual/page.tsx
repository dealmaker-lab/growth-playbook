import { cookies } from 'next/headers';
import HybridCasualContent from '@/components/ebooks/HybridCasualContent';

export default async function HybridCasualPage() {
  const cookieStore = await cookies();
  const unlocked = cookieStore.get('playbook_unlocked')?.value === '1';

  return <HybridCasualContent initialUnlocked={unlocked} />;
}
