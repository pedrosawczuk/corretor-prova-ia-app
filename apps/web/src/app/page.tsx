import {
	CtaSection,
	FaqSection,
	FeaturesSection,
	HeroSection,
	HowItWorksSection,
	LandingFooter,
	LandingHeader,
	PainSection,
} from './(public)/_components'

export default function LandingPage() {
	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
			<LandingHeader />

			<main className="flex-1 flex flex-col">
				<HeroSection />
				<PainSection />
				<HowItWorksSection />
				<FeaturesSection />
				<FaqSection />
				<CtaSection />
			</main>

			<LandingFooter />
		</div>
	)
}
