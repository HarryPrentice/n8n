import {
	createWorkflow,
	createWorkflowHistory,
	createWorkflowWithHistory,
	testDb,
} from '@n8n/backend-test-utils';
import {
	UserRepository,
	WorkflowHistoryRepository,
	WorkflowPublishHistoryRepository,
	WorkflowRepository,
} from '@n8n/db';
import { Container } from '@n8n/di';
import { v4 as uuid } from 'uuid';

import { createUser } from '../../shared/db/users';

describe('WorkflowHistoryRepository', () => {
	beforeAll(async () => {
		await testDb.init();
	});

	beforeEach(async () => {
		await testDb.truncate(['WorkflowPublishHistory', 'WorkflowHistory', 'WorkflowEntity', 'User']);
	});

	afterAll(async () => {
		await testDb.terminate();
	});

	describe('addRecord', () => {
		it('should create a publish history record with all fields', async () => {
			const id1 = uuid();

			const repository = Container.get(WorkflowPublishHistoryRepository);
			const user = await createUser();
			const workflow = await createWorkflowWithHistory({ versionId: id1 });

			await repository.addRecord({
				workflowId: workflow.id,
				versionId: workflow.versionId,
				event: 'activated',
				userId: user.id,
			});

			const record = await repository.findOne({
				where: { workflowId: workflow.id },
			});

			expect(record).toMatchObject({
				workflowId: workflow.id,
				versionId: workflow.versionId,
				event: 'activated',

				userId: user.id,
			});
			expect(record?.createdAt).toBeInstanceOf(Date);
		});
	});
});
