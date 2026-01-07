import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Reindirizza alla dashboard challenge come pagina principale admin
  redirect('/admin/challenges');
}
