import { cookies } from 'next/headers';
import PlaybookContent from '@/components/PlaybookContent';

export default async function GrowthPlaybookPage() {
  const cookieStore = await cookies();
  const unlocked = cookieStore.get('playbook_unlocked')?.value === '1';

  return <PlaybookContent initialUnlocked={unlocked} />;
}
