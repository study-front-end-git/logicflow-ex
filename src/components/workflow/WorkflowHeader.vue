<template>
  <header class="workflow-header">
    <div class="workflow-header__left">
      <button class="icon-button back-button" type="button" aria-label="返回" @click="$emit('back')">
        <i class="el-icon-arrow-left"></i>
      </button>

      <span class="workflow-header__logo" aria-hidden="true">
        <i></i><i></i><i></i>
      </span>

      <div class="workflow-header__info">
        <div class="workflow-header__name-row">
          <strong>{{ name }}</strong>
          <i class="el-icon-info workflow-header__info-icon"></i>
          <span class="workflow-header__status-dot"><i class="el-icon-check"></i></span>
          <button class="rename-button" type="button" aria-label="修改名称" @click="$emit('rename')">
            <i class="el-icon-edit-outline"></i>
          </button>
        </div>

        <div class="workflow-header__meta">
          <span>已自动保存 {{ savedAt }}</span>
          <!-- <span v-if="hasUnpublishedChanges">有尚未发布的修改</span> -->
        </div>
      </div>
    </div>

    <div class="workflow-header__actions">
      <!-- <button class="icon-button" type="button" aria-label="复制" @click="$emit('copy')">
        <i class="el-icon-copy-document"></i>
      </button> -->
      <button class="icon-button" type="button" aria-label="历史记录" @click="$emit('history')">
        <i class="el-icon-time"></i>
      </button>
      <el-button
        class="publish-button"
        type="primary"
        @click="$emit('publish')"
        >
        保存
      </el-button>
      <el-dropdown trigger="click" @command="$emit('command', $event)">
        <button class="more-button" type="button" aria-label="更多操作">
          <i class="el-icon-more"></i>
        </button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="save">立即保存</el-dropdown-item>
          <el-dropdown-item command="export">导出工作流</el-dropdown-item>
          <el-dropdown-item command="delete" divided>删除工作流</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </header>
</template>

<script>
export default {
  name: 'WorkflowHeader',
  props: {
    name: {
      type: String,
      default: '未命名工作流'
    },
    savedAt: {
      type: String,
      default: '--:--:--'
    },
    hasUnpublishedChanges: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-header {
  position: relative;
  z-index: 50;
  height: 66px;
  padding: 0 15px 0 12px;
  flex: 0 0 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  color: #272a38;
  background: #f8f8fc;
  border-bottom: 1px solid #ececf2;

  &__left,
  &__actions,
  &__name-row,
  &__meta { display: flex; align-items: center; }

  &__left { min-width: 0; gap: 12px; }
  &__actions { flex: 0 0 auto; gap: 9px; }

  &__logo {
    position: relative;
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    display: block;
    border-radius: 10px;
    background: linear-gradient(145deg, #5fc769, #47b75a);
    box-shadow: 0 5px 12px rgba(55, 166, 75, .18);

    i { position: absolute; width: 9px; height: 9px; border-radius: 3px; background: #fff; }
    i:nth-child(1) { top: 9px; left: 9px; }
    i:nth-child(2) { top: 16px; left: 16px; }
    i:nth-child(3) { right: 9px; bottom: 9px; }
  }

  &__info { min-width: 0; }
  &__name-row { height: 23px; gap: 5px; }
  &__name-row strong { max-width: 260px; overflow: hidden; font-size: 15px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  &__info-icon { color: #464a58; font-size: 13px; }

  &__status-dot {
    width: 14px;
    height: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
    background: #14ad57;
    font-size: 8px;
  }

  &__meta { gap: 8px; }
  &__meta span { padding: 2px 6px; border-radius: 4px; color: #575c6e; background: #eceef5; font-size: 10px; line-height: 14px; }
}

.icon-button,
.rename-button,
.more-button {
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: #666b7c;
  background: transparent;
  cursor: pointer;
  transition: color .2s ease, background .2s ease;
}
.icon-button { width: 34px; height: 34px; border-radius: 8px; font-size: 17px; }
.icon-button:hover, .rename-button:hover { color: #514bdf; background: #eeeeff; }
.back-button { margin-right: -3px; color: #3f4351; font-size: 18px; }
.rename-button { width: 23px; height: 23px; border-radius: 5px; font-size: 13px; }
.more-button { width: 40px; height: 40px; border-radius: 10px; background: #eff0f5; font-size: 18px; }
.more-button:hover { color: #4d48d8; background: #e8e8f4; }
.publish-button { height: 40px; padding: 0 23px; border-radius: 10px; font-size: 14px; font-weight: 600; }

.workflow-header ::v-deep .el-button--primary { border-color: #554cf4; background: #554cf4; }
.workflow-header ::v-deep .el-button--primary:hover { border-color: #665ef7; background: #665ef7; }

@media (max-width: 680px) {
  .workflow-header { gap: 8px; }
  .workflow-header__meta span:last-child,
  .workflow-header__actions .icon-button { display: none; }
  .workflow-header__name-row strong { max-width: 120px; }
  .publish-button { padding: 0 15px; }
}
</style>
