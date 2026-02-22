import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Pricing</h1>
        <p className="text-muted-foreground mb-8">
          Simple plans for card sellers.
        </p>
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Unlimited inventory and sales. FIFO profit tracking. Market estimates.
          </p>
          <Button asChild>
            <Link href="/signup">Subscribe</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
