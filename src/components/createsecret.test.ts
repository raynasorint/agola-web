import { VueWrapper, mount } from '@vue/test-utils';
import createsecret from './createsecret.vue';
import secrets from './secrets.vue';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';

// Mocking the secrets prop
const secretsMock = [
  {
    id: '1',
    name: 'Secret 1',
    parentPath: 'Parent 1',
  },
  {
    id: '2',
    name: 'Secret 2',
    parentPath: 'Parent 2',
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
  /*rest.get(
    'http://localhost:8000/api/v1alpha/projectgroups/user%2Frivanova/secrets',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(secretsMock));
    }*/
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
  wrapper = mount(createsecret, {
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
        path: 'http://localhost:5173/user/rivanova/projectgroups/.proj/settings', // Define a route for successful creation
        name: 'settings',
        component: {
          secrets,
        },
      },
    ],
  });
  await wrapper.find('form').trigger('submit.prevent');
  // Wait for any asynchronous tasks to complete
  await wrapper.vm.$nextTick();
  // Assuming you have a success message displayed after successful creation

  // Check if the router has redirected to the success page
  expect(router.currentRoute.value.fullPath).toBe('/settings');
});
/*
test('Fetches secrets', async () => {
  server.use(
    rest.get(
      'http://localhost:8000/api/v1alpha/projectgroups/user%2Frivanova/secrets',
      (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(secretsMock));
      }
    )
  );

  // Wait for the component to fetch secrets (you may need to adjust this based on actual behavior)
  await wrapper.vm.$nextTick();

  // Check if the secrets are displayed in the component
  const secretElements = wrapper.findAll('.secret'); // Assuming there's a class 'secret' for each secret element
  expect(secretElements.length).toBe(secretsMock.length);

  // Check if the secret names are displayed correctly
  for (let i = 0; i < secretsMock.length; i++) {
    expect(secretElements[i].text()).toContain(secretsMock[i].name);
  }
});*/
