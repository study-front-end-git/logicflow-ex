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
    <workflow
      ref="workflow"
      class="workflow-view__canvas"
      @getlf="getlf"
      @workflow-loaded="handleWorkflowLoaded"
      @draft-saved="handleDraftSaved"
      @version-saved="handleVersionSaved"
    />
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
    async handleRename (value) {
      if (value === this.workflowName) return

      const previousName = this.workflowName
      this.workflowName = value
      this.$refs.workflow.setWorkflowName(value)

      try {
        await this.$refs.workflow.saveGraphData({ createVersion: false })
        await this.$router.replace({
          name: this.$route.name,
          params: { ...this.$route.params, name: value }
        })
        this.$message.success('工作流名称修改成功')
      } catch (error) {
        this.workflowName = previousName
        this.$refs.workflow.setWorkflowName(previousName)
        this.$message.error(error.response?.data?.message || '工作流名称修改失败')
      }
    },
    handlePublish () {
      return this.$refs.workflow.saveGraphData({ createVersion: true })
    },
    handleCommand (command) {
      if (command === 'save') {
        this.handlePublish()
        return
      }
      this.$emit('header-command', command)
    },

    handleDraftSaved () {
      this.savedAt = new Date().toLocaleTimeString('zh-CN', { hour12: false })
      this.hasUnpublishedChanges = true
    },

    handleVersionSaved () {
      this.savedAt = new Date().toLocaleTimeString('zh-CN', { hour12: false })
      this.hasUnpublishedChanges = false
    },

    handleWorkflowLoaded (workflow) {
      if (workflow?.name) this.workflowName = workflow.name
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
