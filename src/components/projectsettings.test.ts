import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import projectSettings from './projectsettings.vue';

export const handlers = [
  http.get('/api/v1alpha/projects/:projectref', () => {
    return HttpResponse.json({
      id: '1',
      name: 'proj01',
      visibility: 'public',
      members_can_perform_run_actions: false,
    });
  }),

  http.put('/api/v1alpha/projects/:projectref', () => {
    return HttpResponse.json({
      id: '1',
      name: 'newproj01',
      visibility: 'public',
      members_can_perform_run_actions: true,
    });
  }),

  http.get('/api/v1alpha/projects/:projectref/secrets', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/v1alpha/projects/:projectref/variables', () => {
    return HttpResponse.json([]);
  }),
];

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());

let wrapper: VueWrapper;

beforeEach(async () => {
  const api = newAPI();
  const appState = newAppState();
  wrapper = mount(projectSettings, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props: { ownertype: 'org', ownername: 'org01', projectref: ['proj01'] },
  });
});

test('get project', async () => {
  await flushPromises();

  const projectName = wrapper.find<HTMLInputElement>(
    '[data-test="projectNameInput"]'
  );
  const projectIsPrivate = wrapper.find<HTMLInputElement>(
    '[data-test="projectIsPrivateInput"]'
  );
  expect(projectName.element.value).toBe('proj01');
  expect(projectIsPrivate.element.checked).toBe(false);
});

test('update project name', async () => {
  await flushPromises();

  const projectName = wrapper.find<HTMLInputElement>(
    '[data-test="projectNameInput"]'
  );
  const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
    '[data-test="membersCanPerformRunActions"]'
  );
  const updateProjectButton = wrapper.find<HTMLInputElement>(
    '[data-test="updateProjectButton"]'
  );

  projectName.setValue('newproj01');
  membersCanPerformRunActions.setValue(true);
  updateProjectButton.element.click();

  await flushPromises();

  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/newproj01.proj/settings',
  });
});

test('update org project membersCanPerformRunActions', async () => {
  await flushPromises();

  const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
    '[data-test="membersCanPerformRunActions"]'
  );
  const updateProjectButton = wrapper.find<HTMLInputElement>(
    '[data-test="updateProjectButton"]'
  );
  const initialValue = membersCanPerformRunActions.element.checked;

  membersCanPerformRunActions.setValue(!initialValue);

  updateProjectButton.element.click();

  await flushPromises();

  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/proj01.proj/settings',
  });

  expect(membersCanPerformRunActions.element.checked).toBe(!initialValue);
});

test('check membersCanPerformRunActions is not shown on user projects', async () => {
  const api = newAPI();
  const appState = newAppState();
  wrapper = mount(projectSettings, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props: { ownertype: 'user01', ownername: 'org01', projectref: ['proj01'] },
  });

  await flushPromises();

  const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
    '[data-test="membersCanPerformRunActions"]'
  );

  expect(membersCanPerformRunActions.exists()).toBe(false);
});
