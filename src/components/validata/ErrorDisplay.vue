<template>
  <div v-if="errors.length > 0">
    <h2>{{ title }}</h2>
    <div :id="containerId">
      <p v-if="errors.length === 0">Aucune erreur</p>

      <dl v-else>
        <template v-for="error in errors" :key="error.code">
          <dt>
            <mark>{{
              displayBy === "type" ? error.code : error.fieldName
            }}</mark>
          </dt>
          <dd>{{ error.message }}</dd>
        </template>
      </dl>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { Error } from "./types/report";

type DisplayBy = "type" | "field";

export default defineComponent({
  name: "ErrorDisplay",
  props: {
    title: {
      type: String,
      required: true,
    },
    errors: {
      type: Array as PropType<Error[]>,
      required: true,
    },
    displayBy: {
      type: String as PropType<DisplayBy>,
      required: true,
    },
  },
});
</script>
