import { invalidateCache } from '@/lib/cache/redis'

export const EXAM_CACHE_TTL_SECONDS = 300

export function examCacheKey(id: string) {
	return `exam:${id}`
}

export function examListCacheKey(classroomId: string) {
	return `exam:list:${classroomId}`
}

export async function invalidateExamCache(id: string, classroomId: string) {
	await invalidateCache(examCacheKey(id), examListCacheKey(classroomId))
}
