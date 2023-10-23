import { VueWrapper, mount } from '@vue/test-utils';
import secrets from './secrets.vue';
import { rest } from 'msw';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';

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
global.fetch = vi.fn();
/*const server = setupServer(
  rest.get(
    'http://localhost:8000/api/v1alpha/projectgroups/user%2Frivanova/secrets',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(secretsMock));
    }
  )
);*/
export const restHandlers = [
  rest.get(
    'http://localhost:8000/api/v1alpha/projectgroups/user%2Frivanova/secrets',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(secretsMock));
    }
  ),
];
const server = setupServer(...restHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

let wrapper: VueWrapper;
beforeEach(async () => {
  const api = newAPI();
  const appState = newAppState();
  wrapper = mount(secrets, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props: {
      ownertype: 'type',
      ownername: 'name',
      projectref: ['ref1', 'ref2'],
      projectgroupref: ['groupref1', 'groupref2'],
      secrets: [],
      refType: 'project', // Provide the appropriate refType
    },
  });
});

test('Fetches secrets', async () => {
  server.use(
    rest.get(
      'http://localhost:8000/api/v1alpha/projectgroups/user%2Frivanova/secrets',
      (req, res, ctx) => {
        console.log('Mock server called...'); // Add this line
        return res(ctx.status(200), ctx.json(secretsMock));
      }
    )
  );

  // Wait for the component to fetch secrets (you may need to adjust this based on actual behavior)
  await wrapper.vm.$nextTick();

  // Check if the secrets are displayed in the component
  const secretElements = wrapper.findAll('span'); // Assuming there's a class 'secret' for each secret element
  expect(secretElements.length).toBe(secretsMock.length);
  console.log('secrets', secretElements);
  // Check if the secret names are displayed correctly
  for (let i = 0; i < secretsMock.length; i++) {
    expect(secretElements[i].text()).toContain(secretsMock[i].name);
  }
});
