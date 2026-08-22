<template>
  <div class="workflow-view">
    <workflow-header
      :name="workflowName"
      :saved-at="savedAt"
      :has-unpublished-changes="hasUnpublishedChanges"
      @back="handleBack"
      @rename="handleRename"
      @publish="handlePublish"
      @command="handleCommand"
    />
    <workflow ref="workflow" @getlf="getlf" class="workflow-view__canvas" />
  </div>
</template>

<script>
import WorkflowHeader from '@/components/workflow/WorkflowHeader.vue'
import Workflow from '@/components/workflow/index.vue'

export default {
  name: 'WorkflowView',
  components: {
    WorkflowHeader,
    Workflow
  },
  data () {
    return {
      workflowName: this.$route.params.name,
      savedAt: '18:08:36',
      hasUnpublishedChanges: true,
      instance: null
    }
  },
  methods: {
    handleBack () {
      this.$router.push('/')
    },
    handleRename () {},
    handlePublish () {
      this.$refs.workflow.saveGraphData()
    },
    handleCommand (command) {
      this.$emit('header-command', command)
    },

    getlf (instance) {
      this.instance = instance
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__canvas {
    min-height: 0;
    flex: 1;
  }
}
</style>
