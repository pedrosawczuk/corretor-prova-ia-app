import type { DriveStep } from 'driver.js'

export const ONBOARDING_TOUR_STORAGE_KEY = 'gabarita:onboarding-tour-completed'

export function isOnboardingTourCompleted() {
	return window.localStorage.getItem(ONBOARDING_TOUR_STORAGE_KEY) === '1'
}

export function markOnboardingTourCompleted() {
	window.localStorage.setItem(ONBOARDING_TOUR_STORAGE_KEY, '1')
}

export function buildOnboardingTourSteps(): DriveStep[] {
	return [
		{
			element: '[data-tour="brand"]',
			popover: {
				title: 'Bem-vindo ao gabarita.app 👋',
				description:
					'Vamos fazer um tour rápido pelas principais áreas da plataforma antes de você começar.',
				side: 'bottom',
				align: 'start',
			},
		},
		{
			element: '[data-tour="nav-dashboard"]',
			popover: {
				title: 'Dashboard',
				description:
					'Aqui você acompanha um resumo das suas turmas, matérias e provas geradas.',
				side: 'right',
				align: 'start',
			},
		},
		{
			element: '[data-tour="nav-turmas"]',
			popover: {
				title: 'Turmas',
				description:
					'Organize seus alunos em turmas e gerencie cada uma delas por aqui.',
				side: 'right',
				align: 'start',
			},
		},
		{
			element: '[data-tour="nav-configuracoes"]',
			popover: {
				title: 'Configurações',
				description: 'Ajuste as preferências da sua conta e da plataforma.',
				side: 'right',
				align: 'start',
			},
		},
		{
			element: '[data-tour="stats"]',
			popover: {
				title: 'Visão geral',
				description:
					'Esses cartões mostram, em tempo real, quantas turmas, matérias e provas você já tem.',
				side: 'bottom',
				align: 'center',
			},
		},
		{
			element: '[data-tour="turmas-section"]',
			popover: {
				title: 'Suas turmas recentes',
				description:
					'As turmas mais recentes aparecem aqui, com atalho para acessar cada uma.',
				side: 'top',
				align: 'center',
			},
		},
		{
			element: '[data-tour="provas-section"]',
			popover: {
				title: 'Suas provas recentes',
				description:
					'Acompanhe as últimas provas geradas pela IA e acesse os resultados dos alunos.',
				side: 'top',
				align: 'center',
			},
		},
	]
}
