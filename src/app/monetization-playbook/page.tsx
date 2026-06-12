import { cookies } from 'next/headers';
import MonetizationPlaybookContent from '@/components/ebooks/MonetizationPlaybookContent';

export default async function MonetizationPlaybookPage() {
  const cookieStore = await cookies();
  const unlocked = cookieStore.get('playbook_unlocked')?.value === '1';

  return <MonetizationPlaybookContent initialUnlocked={unlocked} />;
}
