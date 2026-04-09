'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GP_HASHES = ['ch1', 'ch2', 'ch3', 'ch4', 'calculator', 'ch1-dsp', 'ch2-rewarded', 'ch3-oem', 'ch4-asa'];

export default function HashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && GP_HASHES.some(h => hash.startsWith(h))) {
      router.replace(`/growth-playbook#${hash}`);
    }
  }, [router]);
  return null;
}
