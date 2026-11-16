import type { NextConfig } from 'next'

const contentSecurityPolicy = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'none'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data: https:",
	"style-src 'self' 'unsafe-inline'",
	"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
	"connect-src 'self' https: http://localhost:* ws://localhost:*",
].join('; ')

const nextConfig: NextConfig = {
	transpilePackages: ['@app/ui'],
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Content-Security-Policy',
						value: contentSecurityPolicy,
					},
				],
			},
		]
	},
}

export default nextConfig
