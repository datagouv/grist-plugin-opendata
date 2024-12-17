<template>
  <div v-if="errors.length > 0">
    <h2>{{ title }}</h2>
    <div :id="containerId">
      <p v-if="errors.length === 0">Aucune erreur</p>

      <dl v-else>
        <template v-for="error in errors" :key="error.type">
          <dt>
            <DsfrBadge
              type="warning"
              :label="'fieldName' in error ? error.fieldName : error.type"
              noIcon
            />
          </dt>
          <dd>
            {{ error.message }}
          </dd>
        </template>
      </dl>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { DsfrBadge } from "@gouvminint/vue-dsfr";
import type { Error } from "./types/report";

export default defineComponent({
  name: "ErrorDisplay",
  components: { DsfrBadge },
  props: {
    title: {
      type: String,
      required: true,
    },
    errors: {
      type: Array as PropType<Error[]>,
      required: true,
    },
  },
});
</script>
