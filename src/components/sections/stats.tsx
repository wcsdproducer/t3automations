export default function Stats() {
  const stats = [
    { value: '5,000+', label: 'Happy Customers' },
    { value: '20M+', label: 'Calls Handled' },
    { value: '1M+', label: 'Appointments Booked' },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-5xl font-bold text-primary">{stat.value}</p>
              <p className="mt-2 text-lg text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
