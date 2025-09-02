import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Your Gateway to Unforgettable Experiences
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        From intimate concerts to grand festivals, find and book tickets for
        events that create lasting memories.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button>Get started</Button>
        <Button variant="ghost">Learn more &rarr;</Button>
      </div>
    </div>
  );
};

export default Hero;
