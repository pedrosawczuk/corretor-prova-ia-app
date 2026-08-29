import { randomUUID } from 'node:crypto'
import {
	account as accountTable,
	classroomsTable,
	client,
	db,
	examsTable,
	questionOptionsTable,
	questionsTable,
	user as userTable,
} from '@app/db'
import { env } from '@app/env'
import { faker } from '@faker-js/faker'
import { hashPassword } from 'better-auth/crypto'

/**
 * `local:credential` matches better-auth's `createLocalAccountIssuer('credential')`
 * (@better-auth/core/db) — the synthetic issuer it stamps on password accounts.
 */
const CREDENTIAL_ISSUER = 'local:credential'
const SEED_PASSWORD = 'teste123@'

const SUBJECTS = [
	'Matemática',
	'Português',
	'História',
	'Geografia',
	'Física',
	'Química',
	'Biologia',
]

const OPTION_LETTERS = ['A', 'B', 'C', 'D']
const QUESTION_TYPES = ['multiple_choice', 'true_false'] as const

interface SeedOptionData {
	letter: string
	text: string
	isCorrect: boolean
}

function buildOptions(type: (typeof QUESTION_TYPES)[number]): SeedOptionData[] {
	if (type === 'true_false') {
		const isTrue = faker.datatype.boolean()
		return [
			{ letter: 'A', text: 'Verdadeiro', isCorrect: isTrue },
			{ letter: 'B', text: 'Falso', isCorrect: !isTrue },
		]
	}

	const correctIndex = faker.number.int({
		min: 0,
		max: OPTION_LETTERS.length - 1,
	})

	return OPTION_LETTERS.map((letter, index) => ({
		letter,
		text: faker.lorem.words({ min: 1, max: 4 }),
		isCorrect: index === correctIndex,
	}))
}

async function seedTeacher() {
	const name = faker.person.fullName()
	const userId = randomUUID()
	const email = faker.internet
		.email({
			firstName: name.split(' ')[0],
			lastName: randomUUID().slice(0, 6),
		})
		.toLowerCase()
	const passwordHash = await hashPassword(SEED_PASSWORD)

	await db.insert(userTable).values({
		id: userId,
		name,
		email,
		emailVerified: true,
	})

	await db.insert(accountTable).values({
		id: randomUUID(),
		accountId: userId,
		providerId: 'credential',
		userId,
		password: passwordHash,
		issuer: CREDENTIAL_ISSUER,
	})

	return { id: userId, name, email }
}

async function seedClassroom(teacherId: string) {
	const [classroom] = await db
		.insert(classroomsTable)
		.values({
			name: `Turma ${faker.string.alpha({ length: 1, casing: 'upper' })} - ${faker.word.noun()}`,
			subject: faker.helpers.arrayElement(SUBJECTS),
			description: faker.lorem.sentence(),
			teacherId,
		})
		.returning()

	return classroom
}

async function seedExam(classroomId: string, creatorId: string) {
	const questionCount = faker.number.int({ min: 3, max: 10 })

	const [exam] = await db
		.insert(examsTable)
		.values({
			title: `Prova de ${faker.word.noun()}`,
			description: faker.lorem.sentence(),
			totalPoints: questionCount.toFixed(2),
			status: faker.helpers.arrayElement(['draft', 'finalized']),
			classroomId,
			creatorId,
		})
		.returning()

	for (let order = 0; order < questionCount; order++) {
		const type = faker.helpers.arrayElement(QUESTION_TYPES)

		const [question] = await db
			.insert(questionsTable)
			.values({
				examId: exam.id,
				order,
				statement: faker.lorem.sentence(),
				type,
				maxPoints: '1.00',
			})
			.returning()

		await db.insert(questionOptionsTable).values(
			buildOptions(type).map((option) => ({
				questionId: question.id,
				...option,
			})),
		)
	}

	return exam
}

async function seed() {
	if (env.NODE_ENV === 'prod') {
		console.error(
			'❌ Recusando rodar o seed com NODE_ENV=prod. Isso criaria contas de teste com senha conhecida em produção.',
		)
		process.exit(1)
	}

	console.log('⏳ Iniciando seed...')

	const createdTeachers: { name: string; email: string }[] = []

	try {
		const teacherCount = faker.number.int({ min: 3, max: 6 })

		for (let i = 0; i < teacherCount; i++) {
			const teacher = await seedTeacher()
			createdTeachers.push(teacher)

			const classroomCount = faker.number.int({ min: 1, max: 4 })
			for (let c = 0; c < classroomCount; c++) {
				const classroom = await seedClassroom(teacher.id)

				const examCount = faker.number.int({ min: 1, max: 3 })
				for (let e = 0; e < examCount; e++) {
					await seedExam(classroom.id, teacher.id)
				}
			}
		}

		console.log(`\n✅ Seed concluído! ${teacherCount} professores criados.`)
		console.log(`   Senha de todas as contas: ${SEED_PASSWORD}`)
		for (const teacher of createdTeachers) {
			console.log(`   • ${teacher.name} — ${teacher.email}`)
		}
	} catch (error) {
		console.error('❌ Erro ao rodar o seed:', error)
		process.exit(1)
	} finally {
		await client.end()
	}
}

seed()
