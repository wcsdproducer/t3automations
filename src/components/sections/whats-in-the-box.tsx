import Link from 'next/link';

const features = [
  {
    title: 'Lead qualification',
    value: '',
    price: 'Free!',
    description: 'We\'ll capture and qualify your leads based on your custom criteria.',
    subDescription: 'Leads are screened to determine if they are a good fit based on needs, location, and budget.',
  },
  {
    title: 'GoHighLevel CRM',
    value: 'a $120 value',
    price: 'Free!',
    description: 'GoHighLevel CRM is included or we can create an integration with your CRM.',
    subDescription: 'We support GoHighLevel, HubSpot & Salesforce',
  },
  {
    title: 'AI Scheduling',
    value: 'a $500 value',
    price: 'Free!',
    description: 'AI integrates with GoHighLevel or your CRM to book appointments directly into your calendar — live on the call.',
    subDescription: 'Integrates directly into your CRM.',
  },
  {
    title: 'Custom Dashboard',
    value: 'a $200 value',
    price: 'Free!',
    description: 'View all your stats in one location on your custom dashboard.',
    subDescription: 'View stats, call flow and call summaries at anytime.',
  },
  {
    title: 'Call Summary',
    value: '',
    price: 'Free!',
    description: 'Your custom dashboard will keep track of all customer interaction details.',
    subDescription: 'Call summaries can be viewed at anytime via the custom dashboard.',
  },
  {
    title: 'Customer Qualifying',
    value: '',
    price: 'Free!',
    description: 'No more wasting time with customers who are not a fit for your business.',
    subDescription: 'Custom call flow based on your criteria.',
  },
  {
    title: 'Marketing Ads',
    value: 'a $3,000 value',
    price: 'Free!',
    description: 'Our creative team will create 4 custom video ads per month for you using AI.',
    learnMore: true,
    subDescription: 'Ads are 10-15 seconds each in 1:1 and 4:5 aspect ratios and optimized for Facebook and Instagram.',
  },
  {
    title: 'Ad Management',
    value: 'a $2,500 value',
    price: 'Free!',
    description: 'We will manage your ad campaigns on Facebook and Instagram, optimize and rotate ads monthly.',
    subDescription: 'Requires min ad spend of $2500 per month.',
  },
  {
    title: 'Automations',
    value: 'a $1,500 value',
    price: 'Free!',
    description: 'Custom reminders and followups for your leads and exiting customer base.',
    subDescription: 'Great for repeat business generation.',
  },
];

export default function WhatsInTheBox() {
  return (
    <section className="bg-[#FBF8F3] text-zinc-800 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            What&apos;s in the box?
          </h2>
          <p className="mt-4 text-2xl text-muted-foreground">
            Over <span className="text-primary">$7,000 worth</span> of features included:
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="border-l-2 border-zinc-300 px-8 py-4 flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-bold">
                  {feature.title}{' '}
                  {feature.value && <span className="text-base font-normal text-muted-foreground">({feature.value})</span>}
                </h3>
                <span className="font-bold text-lg">{feature.price}</span>
              </div>
              <p className="text-muted-foreground">
                {feature.description}
                {feature.learnMore && (
                  <Link href="#" className="text-primary underline ml-1">
                    Learn More
                  </Link>
                )}
              </p>
              {feature.subDescription && (
                <p className="text-sm text-muted-foreground/80">{feature.subDescription}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
