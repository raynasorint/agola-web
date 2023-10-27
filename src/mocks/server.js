//@ts-check
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

console.log('configuring server');

// Mocking the secrets prop
const secretsMock = [
  {
    id: 'a5652bd8-547e-4523-9f56-82de2db868fd',
    name: 'sds',
    parent_path: 'user/rivanova',
  },
  {
    id: '9589d518-b85f-446a-9424-3d38dc1ac8ac',
    name: 'vvvv',
    parent_path: 'user/rivanova',
  },
  {
    id: '4548b892-b029-48dd-adee-61017dc4da65',
    name: 'gg',
    parent_path: 'user/rivanova',
  },
  {
    id: '8cf6951c-cef4-4bcc-859c-83ab29dbb18b',
    name: 'ddd',
    parent_path: 'user/rivanova',
  },
  {
    id: '0abfe045-659a-4ae5-8529-330f153a7c6a',
    name: 'hh',
    parent_path: 'user/rivanova',
  },
];

export const handlers = [
  rest.get(
    'http://localhost:3000/api/v1alpha/:refType/:projectef/secrets',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(secretsMock));
    }
  ),

  rest.post(
    'http://localhost:3000/api/v1alpha/:refType/:projectef/secrets',
    async (req, res, ctx) => {
      return res(ctx.json(secretsMock));
    }
  ),

  rest.delete(
    'http://localhost:3000/api/v1alpha/project/test/secrets:secretname',
    (req, res, ctx) => {
      return res(ctx.status(200));
    }
  ),
];

export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  console.log('beforeAll');
  return server.listen({
    onUnhandledRequest: 'error',
  });
});

//  Close server after all tests
afterAll(() => {
  console.log('afterAll');
  return server.close();
});

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  console.log('Reset handlers');
  return server.resetHandlers();
});
