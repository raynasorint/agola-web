import { VueWrapper, mount } from '@vue/test-utils';
import confirmationDialog from './confirmationDialog.vue';

let wrapper: VueWrapper;
beforeEach(async () => {
  wrapper = mount(confirmationDialog, {
    props: { show: true },
    global: {
      stubs: {
        teleport: true,
      },
    },
  });
});

test('confirmationDialog confirm', async () => {
  await wrapper.get('#modal-confirm').trigger('click');
  expect(wrapper.emitted()).toHaveProperty('result');
  const result = wrapper.emitted('result')!;
  expect(result).toHaveLength(1);
  expect(result[0]).toStrictEqual([true]);
});

test('confirmationDialog cancel', async () => {
  await wrapper.get('#modal-cancel').trigger('click');
  expect(wrapper.emitted()).toHaveProperty('result');
  const result = wrapper.emitted('result')!;
  expect(result).toHaveLength(1);
  expect(result[0]).toStrictEqual([false]);
});
