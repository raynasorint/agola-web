import { mount } from '@vue/test-utils';
import baseModal from './baseModal.vue';

test('baseModal', () => {
  it('renders modal and handles focus trapping', async () => {
    const wrapper = mount(baseModal, {
      props: { show: true },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });
    vi.useFakeTimers();
    await wrapper.find('[tabindex="0"]').trigger('keydown', { key: 'Escape' });
    vi.runAllTicks();
    const dismissEvent = wrapper.emitted('dismiss')!;
    expect(dismissEvent).toHaveLength(1);
    expect(dismissEvent[0]).toEqual([false]);
  });
});
