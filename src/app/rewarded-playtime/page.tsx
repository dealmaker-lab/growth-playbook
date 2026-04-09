import { cookies } from 'next/headers';
import RewardedPlaytimeContent from '@/components/ebooks/RewardedPlaytimeContent';

export default async function RewardedPlaytimePage() {
  const cookieStore = await cookies();
  const unlocked = cookieStore.get('playbook_unlocked')?.value === '1';

  return <RewardedPlaytimeContent initialUnlocked={unlocked} />;
}
