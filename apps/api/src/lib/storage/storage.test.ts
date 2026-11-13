import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteObjectByPublicUrl, storageClient, uploadAvatar } from './storage'

describe('storage avatar ownership', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(storageClient, 'putObject').mockResolvedValue({} as never)
		vi.spyOn(storageClient, 'removeObject').mockResolvedValue(
			undefined as never,
		)
	})

	it('grava avatar sob avatars/${userId}/${uuid}.webp', async () => {
		const url = await uploadAvatar('user-123', Buffer.from('webp'))

		expect(storageClient.putObject).toHaveBeenCalledWith(
			expect.any(String),
			expect.stringMatching(/^avatars\/user-123\/[0-9a-f-]+\.webp$/),
			expect.any(Buffer),
			4,
			{ 'Content-Type': 'image/webp' },
		)
		expect(url).toMatch(/\/avatars\/user-123\/[0-9a-f-]+\.webp$/)
	})

	it('remove avatar quando pertence ao callerUserId', async () => {
		const url = await uploadAvatar('user-123', Buffer.from('webp'))

		await deleteObjectByPublicUrl(url, 'user-123')

		expect(storageClient.removeObject).toHaveBeenCalledTimes(1)
	})

	it('não remove avatar de outro usuário (cross-user)', async () => {
		const otherUserUrl = await uploadAvatar('other-user', Buffer.from('webp'))

		await deleteObjectByPublicUrl(otherUserUrl, 'user-123')

		expect(storageClient.removeObject).not.toHaveBeenCalled()
	})

	it('não remove quando há dot-segments, barras extras ou formato inválido', async () => {
		const validUrl = await uploadAvatar('user-123', Buffer.from('webp'))
		const baseUrl = validUrl.slice(0, validUrl.indexOf('avatars/'))

		await deleteObjectByPublicUrl(
			`${baseUrl}avatars/user-123/../other-user/00000000-0000-0000-0000-000000000000.webp`,
			'user-123',
		)
		await deleteObjectByPublicUrl(
			`${baseUrl}avatars/user-123//00000000-0000-0000-0000-000000000000.webp`,
			'user-123',
		)
		await deleteObjectByPublicUrl(
			`${baseUrl}avatars/00000000-0000-0000-0000-000000000000.webp`,
			'user-123',
		)

		expect(storageClient.removeObject).not.toHaveBeenCalled()
	})
})
