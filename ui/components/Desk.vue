<template>
    <div class="dataent-desk row no-gutters">
        <dataent-sidebar :sidebarConfig="sidebarConfig"></dataent-sidebar>
        <dataent-main>
          <dataent-navbar></dataent-navbar>
          <slot></slot>
        </dataent-main>
    </div>
</template>
<script>
import Sidebar from './Sidebar';
import Main from './Main';
import Navbar from './Navbar';

export default {
  props: ['sidebarConfig'],
  components: {
    dataentSidebar: Sidebar,
    dataentMain: Main,
    dataentNavbar: Navbar
  },
};
</script>
<style>
</style>
