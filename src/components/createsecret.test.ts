import { VueWrapper, mount } from '@vue/test-utils';
import createsecret from './createsecret.vue';
import { rest } from 'msw';
import { afterAll, afterEach, beforeAll, describe } from 'vitest';
import { createRouter, createWebHistory, useRouter } from 'vue-router';
import { setupServer } from 'msw/node';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';

// Mocking the secrets prop
/*const secretsMock = [
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

export const restHandlers = [
  rest.post(
    'http://localhost:3000/api/v1alpha/:refType/:projectref/secrets',
    (req, res, ctx) => {
      console.log('req', req.text);
      return res(ctx.status(200), ctx.json(secretsMock));
    }
  ),
  rest.get(
    'http://localhost:3000/api/v1alpha/:refType/:projectref/secrets',
    (req, res, ctx) => {
      console.log('req', req.text);
      return res(ctx.status(200), ctx.json(secretsMock));
    }
  ),
];
const server = setupServer(...restHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());*/

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
      projectref: ['test'],
      projectgroupref: ['testgroup'],
      allSecrets: [], // Provide mock data if needed
      refType: 'project', // Provide the appropriate refType
    },
  });
});
describe(`Test fetch secrets`, () => {
  it(`Test fetch secrets api`, () =>
    new Promise<void>((done) => {
      fetch(
        `http://localhost:3000/api/v1alpha/projects/type%2Fname%2Ftest/secrets`,
        { method: 'GET' }
      )
        .then((value) => {
          console.log('xxxxxxxx');
          return value.json();
        })
        .then((values) => {
          console.log(values);
          done();

          return values;
        });
    }));
});
describe('Create Secret API', () => {
  it('renders correctly', async () => {
    vi.mock('vue-router', () => ({
      useRoute: vi.fn(),
      useRouter: vi.fn(() => ({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        push: () => {},
      })),
    }));

    const push = vi.fn();
    //@ts-ignore
    useRouter.mockImplementationOnce(() => ({
      push,
    }));
    wrapper.find('#secret-name').setValue('Secretnametest');
    wrapper.find('#secret-name-input-0').setValue('Secret key nam');
    wrapper.find('#secret-value-input-0').setValue('sssdfsdfsfsfs');
    wrapper.find('form').trigger('submit.prevent');
    //  await wrapper.vm.$nextTick();
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/settings');
    vi.restoreAllMocks();
  });
});

describe(`Home`, () => {
  it('renders correctly', () => {
    vi.mock('vue-router', () => ({
      useRoute: vi.fn(),
      useRouter: vi.fn(() => ({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        push: () => {},
      })),
    }));

    const push = vi.fn();
    //@ts-ignore
    useRouter.mockImplementationOnce(() => ({
      push,
    }));

    wrapper.find('#toAbout').trigger('click');
    console.log(wrapper.html);
    expect(push).toBeCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/settings');

    vi.restoreAllMocks();
  });
});
