'use client'

import * as React from 'react'

interface UseCameraOptions {
	facingMode?: 'user' | 'environment'
}

export function useCamera({
	facingMode = 'environment',
}: UseCameraOptions = {}) {
	const videoRef = React.useRef<HTMLVideoElement | null>(null)
	const streamRef = React.useRef<MediaStream | null>(null)
	const [isReady, setIsReady] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	React.useEffect(() => {
		let cancelled = false

		async function start() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode,
						width: { ideal: 1920 },
						height: { ideal: 1080 },
					},
					audio: false,
				})

				if (cancelled) {
					for (const track of stream.getTracks()) track.stop()
					return
				}

				streamRef.current = stream
				if (videoRef.current) {
					videoRef.current.srcObject = stream
				}
				setIsReady(true)
			} catch {
				if (!cancelled) {
					setError(
						'Não foi possível acessar a câmera. Verifique as permissões do navegador.',
					)
				}
			}
		}

		start()

		return () => {
			cancelled = true
			for (const track of streamRef.current?.getTracks() ?? []) {
				track.stop()
			}
			streamRef.current = null
		}
	}, [facingMode])

	function captureFrame(): Promise<Blob | null> {
		const video = videoRef.current
		if (!video || video.videoWidth === 0) return Promise.resolve(null)

		const canvas = document.createElement('canvas')
		canvas.width = video.videoWidth
		canvas.height = video.videoHeight
		const context = canvas.getContext('2d')
		if (!context) return Promise.resolve(null)

		context.drawImage(video, 0, 0, canvas.width, canvas.height)

		return new Promise((resolve) => {
			canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
		})
	}

	return { videoRef, isReady, error, captureFrame }
}
