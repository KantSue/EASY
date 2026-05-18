import CitoyenLayoutClient from '@/app/component/CitoyenLayoutClient';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CitoyenLayoutClient>{children}</CitoyenLayoutClient>;
}