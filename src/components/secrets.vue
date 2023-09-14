<template>
  <div>
    <div class="my-3 flex font-bold">
      <div class="w-2/12">Name</div>
    </div>
    <div class="flex" v-for="secret in secrets" :key="secret.id">
      <div class="w-11/12 flex justify-between py-2 border-gray-200">
        <div class="flex flex-col">
          <span class="name">{{ secret.name }}</span>
          <div v-if="showparentpath" class="text-sm font-light">
            from {{ secret.parentPath }}
          </div>
        </div>
        <div v-if="!showparentpath" class="text-sm font-light">
          <button
            class="hover:text-blue-700 text-blue-500 italic px-3 ml-2"
            @click="openDialog(secret)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>

  <confirmationDialog
    v-if="showDialog"
    :show="showDialog"
    @result="handleResult"
  >
    <template v-slot:title> Delete secret title</template>
    <template v-slot:body>
      Delete secret titleDelete secret titleDelete secret titleDelete secret
      title?</template
    >
  </confirmationDialog>
</template>

<script lang="ts">
import { ApiError, SecretResponse, errorToString, useAPI } from '../app/api';
import { computed, defineComponent, PropType, ref, Ref, toRefs } from 'vue';
import { useAppState } from '../app/appstate';
import confirmationDialog from './modals/confirmationDialog.vue';

export default defineComponent({
  components: { confirmationDialog },
  name: 'secrets',
  props: {
    secrets: {
      type: Array as PropType<Array<SecretResponse>>,
      required: true,
    },
    refType: { type: String },
    ownertype: {
      type: String,
    },
    ownername: {
      type: String,
    },
    projectref: { type: Array as PropType<Array<string>> },
    showparentpath: Boolean,
  },
  setup(props, { emit }) {
    const { ownertype, ownername, projectref, refType } = toRefs(props);
    const api = useAPI();
    const appState = useAppState();
    const confirmationMessage = ref('');
    const showDialog = ref(false);
    const secretNameToDelete = ref<SecretResponse>({
      id: '',
      name: '',
      parentPath: '',
    });

    const deleteSecretError: Ref<unknown | undefined> = ref();

    const apiRef = computed(() => {
      if (projectref.value) {
        return [ownertype.value, ownername.value, ...projectref.value].join(
          '/'
        );
      }

      return '';
    });

    const modalDescription = computed(() => {
      return `Are you sure you want to delete the secret
        '${secretNameToDelete.value.name}'?`;
    });

    function handleResult(value: boolean) {
      showDialog.value = false;
      if (value) {
        removeSecret(secretNameToDelete.value);
      }
    }

    const openDialog = (secretToDelete: SecretResponse) => {
      showDialog.value = true;
      secretNameToDelete.value = secretToDelete;
    };

    const closeDialog = () => {
      showDialog.value = false;
    };

    const removeSecret = async (secretNameToDelete: SecretResponse) => {
      try {
        if (refType.value === 'project') {
          await api.deleteProjectSecret(secretNameToDelete.name, apiRef.value);
        } else {
          await api.deleteProjectGroupSecret(
            secretNameToDelete.name,
            apiRef.value
          );
        }
        emit('delete-secret', secretNameToDelete);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };
    return {
      deleteSecretError: computed(() => errorToString(deleteSecretError.value)),
      modalDescription,
      showDialog,
      confirmationMessage,

      openDialog,
      closeDialog,
      handleResult,
    };
  },
});
</script>
