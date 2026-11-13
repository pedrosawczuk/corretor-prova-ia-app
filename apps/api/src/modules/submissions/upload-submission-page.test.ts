import { readFileSync } from 'node:fs'
import path from 'node:path'
import { db } from '@app/db'
import type { FastifyInstance } from 'fastify'
import sharp from 'sharp'
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import {
	getSubmissionPageSignedUrl,
	uploadSubmissionPage,
} from '@/lib/storage/storage'
import { buildMultipartPayload } from '@/test/build-multipart-payload'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeSubmission } from '@/test/factories/make-submission'
import { makeSubmissionPage } from '@/test/factories/make-submission-page'

vi.mock('@/lib/storage/storage', () => ({
	MAX_SUBMISSION_PAGE_SIZE_BYTES: 10 * 1024 * 1024,
	uploadSubmissionPage: vi.fn(),
	getSubmissionPageSignedUrl: vi.fn(),
}))

const HEIC_FIXTURE_PATH = path.join(
	__dirname,
	'..',
	'..',
	'test',
	'fixtures',
	'sample.heic',
)

async function makeJpegBuffer(width: number, height: number) {
	return sharp({
		create: {
			width,
			height,
			channels: 3,
			background: { r: 255, g: 255, b: 255 },
		},
	})
		.jpeg()
		.toBuffer()
}

describe('POST /submissions/:submissionId/pages', () => {
	let app: FastifyInstance
	const user = makeAuthenticatedUser()

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		vi.mocked(getAuthenticatedUser).mockResolvedValue(user as never)
		vi.mocked(uploadSubmissionPage).mockResolvedValue(
			'submission-pages/fake-object',
		)
		vi.mocked(getSubmissionPageSignedUrl).mockResolvedValue(
			'https://minio.local/signed-url',
		)
	})

	function mockOwnedSubmission(
		overrides: {
			examCreatorId?: string
			templatePageCount?: number | null
			existingPagesCount?: number
		} = {},
	) {
		const exam = makeExam({
			creatorId: overrides.examCreatorId ?? user.id,
			templatePageCount: overrides.templatePageCount ?? null,
		})
		const submission = makeSubmission({ examId: exam.id })
		const existingPages = Array.from(
			{ length: overrides.existingPagesCount ?? 0 },
			(_, i) => ({ pageNumber: i + 1 }),
		)

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValue(createDbChain(existingPages) as never)

		const page = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: existingPages.length + 1,
		})
		const txSelect = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: submission.id }]) as never)
			.mockReturnValueOnce(createDbChain(existingPages) as never)
		const txInsert = vi.fn().mockReturnValue(createDbChain([page]) as never)
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ select: txSelect, insert: txInsert }) as never,
		)
		vi.mocked(db.insert).mockReturnValue(createDbChain([page]) as never)

		return { exam, submission, page, txInsert }
	}

	it('aceita uma foto JPEG e cria a página da submissão', async () => {
		const { submission } = mockOwnedSubmission()
		const jpeg = await makeJpegBuffer(1200, 1600)
		const { payload, headers } = buildMultipartPayload(
			jpeg,
			'pagina.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(201)
		expect(response.json()).toEqual(
			expect.objectContaining({ imageUrl: 'https://minio.local/signed-url' }),
		)
		expect(uploadSubmissionPage).toHaveBeenCalledWith(
			expect.any(Buffer),
			'image/jpeg',
		)
	})

	it('decodifica um arquivo HEIC real de galeria de iPhone e cria a página', async () => {
		const { submission } = mockOwnedSubmission()
		const heic = readFileSync(HEIC_FIXTURE_PATH)
		const { payload, headers } = buildMultipartPayload(
			heic,
			'IMG_0001.heic',
			'image/heic',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(201)
		expect(uploadSubmissionPage).toHaveBeenCalledWith(
			expect.any(Buffer),
			'image/jpeg',
		)
	})

	it('rejeita com 400 uma foto com a menor dimensão exatamente abaixo do mínimo de 900px', async () => {
		const { submission } = mockOwnedSubmission()
		const jpeg = await makeJpegBuffer(899, 1600)
		const { payload, headers } = buildMultipartPayload(
			jpeg,
			'baixa.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(400)
		expect(uploadSubmissionPage).not.toHaveBeenCalled()
	})

	it('aceita uma foto com a menor dimensão exatamente no mínimo de 900px', async () => {
		const { submission } = mockOwnedSubmission()
		const jpeg = await makeJpegBuffer(900, 1600)
		const { payload, headers } = buildMultipartPayload(
			jpeg,
			'limite.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(201)
	})

	it('rejeita com 400 uma imagem acima do limite de pixels de entrada sem estourar memória', async () => {
		const { submission } = mockOwnedSubmission()
		const bomb = await sharp({
			create: {
				width: 6000,
				height: 6000,
				channels: 3,
				background: { r: 0, g: 0, b: 0 },
			},
		})
			.png()
			.toBuffer()
		const { payload, headers } = buildMultipartPayload(
			bomb,
			'bomba.png',
			'image/png',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(400)
		expect(uploadSubmissionPage).not.toHaveBeenCalled()
	})

	it('rejeita com 400 um arquivo que não é imagem mesmo com Content-Type mentiroso', async () => {
		const { submission } = mockOwnedSubmission()
		const fakeImage = Buffer.from('isto não é uma imagem de verdade')
		const { payload, headers } = buildMultipartPayload(
			fakeImage,
			'fake.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(400)
		expect(uploadSubmissionPage).not.toHaveBeenCalled()
	})

	it('rejeita com 400 um arquivo maior que o limite de 10MB', async () => {
		const { submission } = mockOwnedSubmission()
		const oversized = Buffer.alloc(10 * 1024 * 1024 + 1024, 1)
		const { payload, headers } = buildMultipartPayload(
			oversized,
			'grande.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(400)
		expect(uploadSubmissionPage).not.toHaveBeenCalled()
	})

	it('corrige a orientação EXIF da foto antes de salvar', async () => {
		const { submission } = mockOwnedSubmission()
		const rotatedJpeg = await sharp({
			create: {
				width: 1400,
				height: 1000,
				channels: 3,
				background: { r: 10, g: 20, b: 30 },
			},
		})
			.withMetadata({ orientation: 6 })
			.jpeg()
			.toBuffer()
		const { payload, headers } = buildMultipartPayload(
			rotatedJpeg,
			'rotacionada.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(201)
		const savedBuffer = vi.mocked(uploadSubmissionPage).mock
			.calls[0]?.[0] as Buffer
		const savedMetadata = await sharp(savedBuffer).metadata()
		expect(savedMetadata.width).toBeLessThan(savedMetadata.height ?? 0)
		expect(savedMetadata.orientation ?? 1).toBe(1)
	})

	it('bloqueia com 409 o upload quando a submissão já está em processamento', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({ examId: exam.id, status: 'processing' })
		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ submission, exam }]) as never,
		)
		const jpeg = await makeJpegBuffer(1200, 1600)
		const { payload, headers } = buildMultipartPayload(
			jpeg,
			'pagina.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(409)
		expect(uploadSubmissionPage).not.toHaveBeenCalled()
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('bloqueia com 409 o upload quando a submissão já foi concluída', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({ examId: exam.id, status: 'completed' })
		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ submission, exam }]) as never,
		)
		const jpeg = await makeJpegBuffer(1200, 1600)
		const { payload, headers } = buildMultipartPayload(
			jpeg,
			'pagina.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(409)
		expect(uploadSubmissionPage).not.toHaveBeenCalled()
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('rejeita com 400 payload HEIC com dimensões acima de 30.000.000 pixels no header ispe antes de decodificar', async () => {
		const { submission } = mockOwnedSubmission()
		const heicBuffer = Buffer.from(readFileSync(HEIC_FIXTURE_PATH))
		const ispeIndex = heicBuffer.indexOf('ispe')
		expect(ispeIndex).toBeGreaterThan(-1)
		// ispe: [size(4)][type='ispe'(4)][version+flags(4)][width(4)][height(4)]
		heicBuffer.writeUInt32BE(10_000, ispeIndex + 8)
		heicBuffer.writeUInt32BE(10_000, ispeIndex + 12)

		const { payload, headers } = buildMultipartPayload(
			heicBuffer,
			'bomba.heic',
			'image/heic',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(400)
		expect(uploadSubmissionPage).not.toHaveBeenCalled()
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('rejeita com 400 payload HEIC sem box ispe válido', async () => {
		const { submission } = mockOwnedSubmission()
		// Minimal ftyp box for image/heic without any ispe box
		const heicWithoutIspe = Buffer.from([
			0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
			0x00, 0x00, 0x00, 0x00, 0x6d, 0x69, 0x66, 0x31, 0x68, 0x65, 0x69, 0x63,
		])

		const { payload, headers } = buildMultipartPayload(
			heicWithoutIspe,
			'sem-ispe.heic',
			'image/heic',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(400)
		expect(uploadSubmissionPage).not.toHaveBeenCalled()
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('bloqueia com 409 quando a submissão já atingiu o limite de exam.templatePageCount', async () => {
		const { submission, txInsert } = mockOwnedSubmission({
			templatePageCount: 1,
			existingPagesCount: 1,
		})
		const jpeg = await makeJpegBuffer(1200, 1600)
		const { payload, headers } = buildMultipartPayload(
			jpeg,
			'pagina-extra.jpg',
			'image/jpeg',
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/pages`,
			payload,
			headers,
		})

		expect(response.statusCode).toBe(409)
		expect(txInsert).not.toHaveBeenCalled()
	})
})
