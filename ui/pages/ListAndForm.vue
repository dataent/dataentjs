<template>
    <div class="dataent-list-form row no-gutters">
        <div class="col-4 border-right">
            <dataent-list :doctype="doctype" :key="doctype" @newDoc="openNewDoc" @openForm="openForm" />
        </div>
        <div class="col-8">
            <dataent-form v-if="name" :key="doctype + name" :doctype="doctype" :name="name" @save="onSave" />
        </div>
    </div>
</template>
<script>
import List from '../components/List/List';
import Form from '../components/Form/Form';

export default {
  props: ['doctype', 'name'],
  components: {
    dataentList: List,
    dataentForm: Form
  },
  methods: {
    onSave(doc) {
      if (doc.name !== this.$route.params.name) {
        this.$router.push(`/edit/${doc.doctype}/${doc.name}`);
      }
    },
    openForm(name) {
      name = encodeURIComponent(name);
      this.$router.push(`/edit/${this.doctype}/${name}`);
    },
    async openNewDoc() {
      let doc = await dataent.getNewDoc(this.doctype);
      this.$router.push(`/edit/${this.doctype}/${doc.name}`);
    }
  }
};
</script>
<style>
.dataent-list-form {
  min-height: calc(100vh - 4rem);
}
</style>
