<template>
    <div>
        <div class="p-4">
            <h4 class="pb-2">{{ reportConfig.title }}</h4>
            <report-filters v-if="filtersExists" :filters="reportConfig.filterFields" :filterDefaults="filters" @change="getReportData"></report-filters>
            <div class="pt-2" ref="datatable" v-once></div>
        </div>
        <not-found v-if="!reportConfig" />
    </div>
</template>
<script>
import DataTable from 'dataent-datatable';
import dataent from 'dataentjs';
import ReportFilters from './ReportFilters';
import utils from 'dataentjs/client/ui/utils';

export default {
  name: 'Report',
  props: ['reportName', 'reportConfig', 'filters'],
  computed: {
    filtersExists() {
      return (this.reportConfig.filterFields || []).length;
    }
  },
  methods: {
    async getReportData(filters) {
      let data = await dataent.call({
          method: this.reportConfig.method,
          args: filters
      });

      let rows, columns;
      if (data.rows) {
        rows = data.rows;
      } else {
        rows = data;
      }

      if (data.columns) {
        columns = this.getColumns(data);
      }

      if (!rows) {
        rows = [];
      }

      if (!columns) {
        columns = this.getColumns();
      }

      for(let column of columns) {
         column.editable = false;
      }

      if (this.datatable) {
        this.datatable.refresh(rows, columns);
      } else {
        this.datatable = new DataTable(this.$refs.datatable, {
          columns: columns,
          data: rows
        });
      }
    },
    getColumns(data) {
      const columns = this.reportConfig.getColumns(data);
      return utils.convertFieldsToDatatableColumns(columns);
    }
  },
  components: {
    ReportFilters
  }
};
</script>
<style>
</style>
