import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Welcome to your dashboard.</p>
      </main>
      <Footer />
    </div>
  );
}
