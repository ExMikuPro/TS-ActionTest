import { Elysia, t } from 'elysia';
import { SessionScope } from '../../auth/auth.entities';
import { authMiddleware } from '../../shared/auth/middleware';
import { AppError } from '../../shared/middlewares/errors/app-error';
import { createErrorResps } from '../../shared/middlewares/errors/docs';
import { userSchema } from '../user.entities';
import { UsersRepository } from '../users.repository';

export const getUserInfoHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).get(
	'/:id',
	async ({ params, user }) => {
		// [TODO] Allow get other user's info (profile digest).
		if (user.id !== params.id) throw new AppError('users/forbidden');

		const userInfo = await UsersRepository.findById(params.id);
		if (!userInfo) throw new AppError('users/not-found');

		return {
			user: userInfo,
		};
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: t.Object({
				user: userSchema,
			}),
			...createErrorResps(403, 404),
		},
		detail: {
			summary: 'Get User Info',
			description: 'Get account info of a user.',
			tags: ['Users'],
			security: [{ session: [] }],
		},
	},
);
