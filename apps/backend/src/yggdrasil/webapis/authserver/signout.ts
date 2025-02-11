import { Elysia, t } from 'elysia';
import { yggCredentialsSchema } from '../../yggdrasil.entities';
import { UsersRepository } from '../../../users/users.repository';
import { PasswordService } from '../../../services/auth/password';
import { SessionService } from '../../../services/auth/session';
import { ForbiddenOperationException } from '../../utils/errors';

export const signoutHandler = new Elysia().post(
	'/signout',
	async ({ body, set }) => {
		set.status = 'No Content';

		// [TODO] Currently, this will invalidate all sessions of the user (not just Yggdrasil sessions).

		const user = await UsersRepository.findUserWithPassword(body.username);
		// [TODO] Consider add login limit to prevent possible attacks.
		if (!user) {
			throw new ForbiddenOperationException(
				'Invalid credentials. Invalid username or password.',
			);
		}

		const passwordCorrect = PasswordService.compare(user.passwordHash, body.password);
		if (!passwordCorrect) {
			throw new ForbiddenOperationException(
				'Invalid credentials. Invalid username or password.',
			);
		}

		await SessionService.revokeAll(user.id);
	},
	{
		body: yggCredentialsSchema,
		response: {
			204: t.Void(),
		},
		detail: {
			summary: 'Sign Out',
			description: 'Invalidate all tokens of the user.',
			tags: ['Yggdrasil'],
		},
	},
);
