import { redirect } from 'next/navigation';

export default function LoginPage({ params }: { params: { locale: string } }) {
  // Redirect to signin page
  redirect(`/${params.locale}/auth/signin?redirect=/admin`);
}

