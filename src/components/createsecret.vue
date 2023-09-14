<template>
  <div class="panel">
    <p class="panel-title">New Secret</p>
    <form @submit.prevent="submitForm" class="p-4">
      <div class="mt-4">
        <input
          class="mb-2 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          required
          placeholder="Secret name"
          v-model="secretName"
        />
      </div>
      <p
        v-if="formSubmitted && !isSecretNameValid"
        class="text-xs text-red-700 mb-2"
      >
        {{
          secretValueErrors[0].secretName || 'Please enter a valid secret name.'
        }}
      </p>
      <p
        v-if="formSubmitted && isDuplicateSecretName"
        class="text-xs text-red-700 mb-2"
      >
        Secret name is already in use.
      </p>
      <div v-for="(pair, index) in secretvalues" :key="index">
        <div class="flex items-center mt-4">
          <input
            class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            required
            placeholder="Key"
            v-model="pair.key"
          />
          <input
            class="ml-2 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            required
            placeholder="Value"
            v-model="pair.value"
          />
          <button
            class="btn-gray font-bold py-1 px-3 ml-2 rounded"
            v-if="secretvalues.length > 1"
            @click="removeKeyValuePair(index)"
            :disabled="secretvalues.length === 1"
          >
            Remove
          </button>
        </div>
        <div v-if="formSubmitted">
          <p
            class="text-xs text-red-700 mb-2"
            v-if="formSubmitted && secretValueErrors[index].keyValuePair"
          >
            {{ secretValueErrors[index].keyValuePair }}
          </p>
          <p
            class="text-xs text-red-700 mb-2"
            v-if="formSubmitted && secretValueErrors[index].key"
          >
            {{ secretValueErrors[index].key }}
          </p>
        </div>
      </div>
      <div class="flex mt-4">
        <button
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          @click="addKeyValuePair"
        >
          Add Key-Value Pair
        </button>
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-2 rounded"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>
<script lang="ts">
import { ApiError, SecretResponse, useAPI } from '../app/api';
import { projectGroupSettingsLink, projectSettingsLink } from '../util/link';
import { PropType, Ref, computed, onMounted, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncState } from '@vueuse/core';
import { useAppState } from '../app/appstate';
import _ from 'lodash';

interface SecretValues {
  key: string;
  value: string;
}

type FormError = Record<string, string | undefined>;

export default {
  name: 'createsecret',
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectref: { type: Array as PropType<Array<string>>, required: true },
    projectgroupref: { type: Array as PropType<Array<string>>, required: true },
    allSecrets: {
      type: Array as PropType<Array<SecretResponse>>,
      required: true,
    },
    refType: { type: String, required: true },
  },
  setup(props) {
    const { ownertype, ownername, projectref, projectgroupref, refType } =
      toRefs(props);
    const router = useRouter();
    const api = useAPI();
    const appState = useAppState();
    const secretName = ref('');
    const secretvalues = ref<SecretValues[]>([{ key: '', value: '' }]);
    const formSubmitted = ref(false);
    const createSecretError: Ref<unknown | undefined> = ref();
    const secretValueErrors = ref<FormError[]>([]);
    const fetchAbort = new AbortController();
    const secretNamePattern = /^[a-zA-Z][a-zA-Z0-9]*([-]?[a-zA-Z0-9]+)+$/;

    onMounted(() => {
      refreshSecrets();
    });

    const apiProjectGroupRef = computed(() => {
      if (refType.value === 'project') {
        return [ownertype.value, ownername.value, ...projectref.value].join(
          '/'
        );
      }
      if (refType.value === 'projectgroup') {
        return [
          ownertype.value,
          ownername.value,
          ...projectgroupref.value,
        ].join('/');
      }
      return '';
    });

    const fetchSecrets = async () => {
      try {
        return await api.getSecrets(
          refType.value,
          apiProjectGroupRef.value,
          false,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const { state: secrets, execute: refreshSecrets } = useAsyncState(
      async () => {
        return await fetchSecrets();
      },
      undefined,
      { immediate: false }
    );

    const isSecretNameValid = computed(() => {
      const secretNameValue = secretName.value.trim();
      return (
        secretNamePattern.test(secretNameValue) &&
        secretNameValue !== '' &&
        !secretNameValue.includes(' ')
      );
    });

    const isDuplicateSecretName = computed(() => {
      if (secrets.value) {
        const secretNameTrimmed = secretName.value.trim();
        return secrets.value.some(
          (secret) => secret.name === secretNameTrimmed
        );
      }
      return false;
    });
    const addKeyValuePair = () =>
      secretvalues.value.push({ key: '', value: '' });

    const removeKeyValuePair = (index: number) => {
      if (secretvalues.value.length > 1) {
        secretvalues.value.splice(index, 1);
      }
    };

    const isKeyValuePairValid = (pair: SecretValues) =>
      pair.key.trim() !== '' && pair.value.trim() !== '';

    const hasDuplicateKeyAtIndex = (index: number) => {
      const currentKey = secretvalues.value[index].key;
      return (
        currentKey &&
        secretvalues.value.findIndex(
          (pair, i) => pair.key === currentKey && i !== index
        ) !== -1
      );
    };

    const isFormValid = computed(
      () =>
        isSecretNameValid.value &&
        secretvalues.value.every(isKeyValuePairValid) &&
        !hasDuplicateKeyAtIndex
    );

    const submitForm = async () => {
      formSubmitted.value = true;
      createSecretError.value = undefined;
      secretValueErrors.value = secretvalues.value.map(() => ({}));
      let formIsValid = true;

      if (!isSecretNameValid.value) {
        formIsValid = false;
        secretValueErrors.value[0].secretName =
          'Please enter a valid secret name. The secret name cannot be emty or contains spaces and special characters.';
      } else {
        secretValueErrors.value[0].secretName = '';
      }

      secretvalues.value.forEach((pair, index) => {
        if (!isKeyValuePairValid(pair)) {
          formIsValid = false;
          secretValueErrors.value[index].keyValuePair =
            'Please enter valid key and value.';
        }
        if (hasDuplicateKeyAtIndex(index)) {
          formIsValid = false;
          secretValueErrors.value[index].key =
            'Duplicate key names are not allowed.';
        }
      });

      if (!formIsValid) return;

      const transformedSecretValues: Record<string, string> = {};

      for (const element of secretvalues.value) {
        _.set(transformedSecretValues, element.key, element.value);
      }

      try {
        if (props.refType === 'project') {
          await api.createProjectSecret(
            apiProjectGroupRef.value,
            secretName.value,
            transformedSecretValues
          );
          router.push(
            projectSettingsLink(
              ownertype.value,
              ownername.value,
              projectref.value
            )
          );
        }
        if (props.refType === 'projectgroup') {
          await api.createProjectGroupSecret(
            apiProjectGroupRef.value,
            secretName.value,
            transformedSecretValues
          );
          router.push(
            projectGroupSettingsLink(
              ownertype.value,
              ownername.value,
              projectgroupref.value
            )
          );
        }
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        createSecretError.value = e;
      }
    };

    return {
      secretName,
      secretvalues: secretvalues,
      formSubmitted,
      isFormValid,
      secretValueErrors,
      isSecretNameValid,
      isDuplicateSecretName,

      isKeyValuePairValid,
      hasDuplicateKeyAtIndex,
      addKeyValuePair,
      removeKeyValuePair,
      submitForm,
    };
  },
};
</script>
