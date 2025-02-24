import { Button } from "@/components/ui/button"
import { Car, ArrowRight, Shield, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { BackgroundBeams } from "@/components/ui/background-beams"

export default function Home() {
  return (
    <div className="min-h-screen bg-secondary relative">
      <BackgroundBeams />
      <div className="relative">
        <header className="px-4 lg:px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center justify-center">
            <Car className="h-6 w-6 text-primary" />
            <span className="ml-2 text-xl font-bold">Track-kar</span>
          </Link>
          <nav className="ml-auto flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="default">Get Started</Button>
            </Link>
          </nav>
        </header>
        <TracingBeam>
          <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 h-screen">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                      Track Your Fleet in Real-Time
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                      Monitor your fleet's location, status, and performance with our advanced GPS tracking system.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/signup">
                      <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                        Start Tracking <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/get-gps">
                      <Button size="lg" variant="outline">
                        Get GPS Device
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-12 md:py-24 bg-background">
              <div className="container px-4 md:px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose Track-kar?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                    <Clock className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
                    <p className="text-muted-foreground">Monitor your vehicles' locations and status updates in real-time.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                    <Shield className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Enhanced Security</h3>
                    <p className="text-muted-foreground">Protect your fleet with advanced security features and alerts.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                    <MapPin className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Route Optimization</h3>
                    <p className="text-muted-foreground">Optimize routes and improve efficiency with smart navigation.</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </TracingBeam>
      </div>
    </div>
  )
}

