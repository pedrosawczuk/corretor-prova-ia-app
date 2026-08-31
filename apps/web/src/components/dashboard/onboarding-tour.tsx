'use client'

import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import * as React from 'react'
import {
	buildOnboardingTourSteps,
	isOnboardingTourCompleted,
	markOnboardingTourCompleted,
} from './onboarding-tour.utils'
import './onboarding-tour.css'

const START_DELAY_MS = 700

export function OnboardingTour() {
	React.useEffect(() => {
		if (isOnboardingTourCompleted()) return

		const tour = driver({
			showProgress: true,
			overlayOpacity: 0.55,
			stagePadding: 6,
			stageRadius: 12,
			popoverOffset: 12,
			popoverClass: 'gabarita-tour',
			allowClose: true,
			nextBtnText: 'Próximo',
			prevBtnText: 'Voltar',
			doneBtnText: 'Concluir',
			progressText: '{{current}} de {{total}}',
			steps: buildOnboardingTourSteps(),
			onDestroyed: markOnboardingTourCompleted,
		})

		const timeoutId = window.setTimeout(() => tour.drive(), START_DELAY_MS)

		return () => {
			window.clearTimeout(timeoutId)
			tour.destroy()
		}
	}, [])

	return null
}
