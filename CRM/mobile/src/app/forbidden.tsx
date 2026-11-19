import { router } from 'expo-router';
import { AccessDenied } from '@/shared/components/AccessDenied';

export default function ForbiddenScreen() {
  return <AccessDenied onBack={() => router.back()} />;
}
