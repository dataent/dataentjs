<template>
  <div class="dataent-print-actions d-flex justify-content-between align-items-center p-3 border-bottom">
    <h5 class="m-0">Print {{ title }}</h5>

    <div class="button-group">
      <f-button secondary @click="$emit('view-form')">{{ _('View Form') }}</f-button>
      <f-button primary @click="$emit('pdf')">{{ _('PDF') }}</f-button>
    </div>

  </div>
</template>

<script>
import dataent from 'dataentjs';

export default {
  props: ['title'],
  data() {
    return {
      isDirty: false,
      showSubmit: false,
      showRevert: false
    }
  },
  created() {},
  methods: {},
  computed: {
    meta() {
      return dataent.getMeta(this.doc.doctype);
    },
  }
}
</script>

<style lang="scss">
@import "../../styles/variables";

.dataent-print-actions {
    background-color: $white;
}

</style>