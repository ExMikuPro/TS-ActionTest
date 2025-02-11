import { Elysia, t } from 'elysia';
import { ProfilesRepository } from '../profiles.repository';
import { profileSchema } from '../profile.entities';
import { AppError } from '../../shared/middlewares/errors/app-error';
import { authMiddleware } from '../../shared/auth/middleware';
import { SessionScope } from '../../auth/auth.entities';
import { createErrorResps } from '../../shared/middlewares/errors/docs';

export const createHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/',
	async ({ body, set, user }) => {
		const nameExists = !!(await ProfilesRepository.findByName(body.name));
		if (nameExists) throw new AppError('profiles/name-exists');

		const hasPrimary = !!(await ProfilesRepository.findPrimaryByUser(user.id));

		set.status = 'Created';
		return {
			profile: await ProfilesRepository.create({
				authorId: user.id,
				name: body.name,
				isPrimary: !hasPrimary,
			}),
		};
	},
	{
		body: t.Object({
			name: t.String({ pattern: '[0-9A-Za-z_]{3,16}' }),
		}),
		response: {
			201: t.Object({
				profile: profileSchema,
			}),
			...createErrorResps(409),
		},
		detail: {
			summary: 'Create profile',
			description:
				'Create a new profile. \n *Primary profile will be automatically handled.*',
			tags: ['Profiles'],
			security: [{ session: [] }],
		},
	},
);
