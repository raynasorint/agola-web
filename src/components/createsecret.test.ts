import { VueWrapper, mount } from '@vue/test-utils';
import createsecret from './createsecret.vue';
import { rest } from 'msw';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
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

export const restHandlers = [
  rest.post(
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
  wrapper = mount(createsecret, {
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
      allSecrets: [], // Provide mock data if needed
      refType: 'project', // Provide the appropriate refType
    },
  });
});

test('Create Secret API', async () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/settings', // Define a route for successful creation
        name: 'settings',
        component: {
          createsecret,
        },
      },
    ],
  });
  await wrapper.find('form').trigger('submit.prevent');
  await wrapper.vm.$nextTick();
  expect(router.currentRoute.value.fullPath).toBe('/settings');
});
