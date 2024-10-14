<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import type {Error} from "./types/report";

  type DisplayBy = 'type' | 'field';

  export default defineComponent({
    name: 'ErrorDisplay',
    props: {
      errors: {
        type: Array as PropType<Error[]>,
        required: true,
      },
      noErrorMsg: {
        type: String,
        required: true,
      },
      displayBy: {
        type: String as PropType<DisplayBy>,
        required: true,
      },
    }
  });
</script>

<template>
  <div :id="containerId">
    <p v-if="errors.length === 0">{{ noErrorMsg }}</p>

    <dl v-else>
      <template v-for="error in errors" :key="error.code">
        <dt><mark>{{ displayBy === "type" ? error.code : error.fieldName }}</mark></dt>
        <dd>{{ error.message }}</dd>
      </template>
    </dl>
  </div>
</template>
