import { invalidateCache } from '@/lib/cache/redis'

export const CLASSROOM_CACHE_TTL_SECONDS = 300

export function classroomCacheKey(id: string) {
	return `classroom:${id}`
}

export function classroomListCacheKey(teacherId: string) {
	return `classroom:list:${teacherId}`
}

export async function invalidateClassroomCache(id: string, teacherId: string) {
	await invalidateCache(classroomCacheKey(id), classroomListCacheKey(teacherId))
}
