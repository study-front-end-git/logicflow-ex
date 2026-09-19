<template>
  <div class="home">
    <header class="header">
      <div>
        <p class="header__eyebrow">WORKSPACE</p>
        <h1>工作流</h1>
        <p class="header__description">来创建一个工作流</p>
      </div>
      <button @click="dialogVisible = true" class="header__create" type="button">
        <span>＋</span>
        创建工作流
      </button>
    </header>

    <main v-loading="loading" class="main">
      <article v-for="agent in agents" :key="agent.id" class="item">
        <div  @click="handleClick(agent)"  class="item__content">
          <div class="item__heading">
            <h2>{{ agent.name }}</h2>
            <span
              class="item__status"
              :class="{ 'item__status--published': agent.status === 1 }"
            >
              {{ getStatusText(agent.status) }}
            </span>
            <!-- <span class="item__version">v{{ agent.version }}</span> -->
          </div>
          <p class="item__description">{{ agent.description || '暂无工作流描述' }}</p>
          <!-- <span class="item__tag">{{ agent.tag }}</span> -->
        </div>

        <div class="item__cover" :style="{ '--cover-color': agent.color }">
          <span class="item__select" />
          <span class="layer layer--back" />
          <span class="layer layer--middle" />
          <span class="layer layer--front" />
        </div>

        <footer class="item__footer">
          <div class="item__author">
            <span class="item__avatar">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0h14Z" />
              </svg>
            </span>
            <!-- <span>{{ agent.createdBy || '系统创建' }}</span> -->
            <i />
            <span>最近编辑 {{ formatDate(agent.updatedAt) }}</span>
          </div>
          <div class="item__actions">
            <!-- <button type="button" aria-label="收藏">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 3 2.78 5.63 6.22.91-4.5 4.38 1.06 6.19L12 17.18l-5.56 2.93 1.06-6.19L3 9.54l6.22-.91L12 3Z" />
              </svg>
            </button> -->
            <el-dropdown @command="handleCommand($event,agent)" trigger="click">
              <button aria-label="更多操作">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="5" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="12" cy="19" r="1.8" />
                </svg>
              </button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="delete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </footer>
      </article>

      <div v-if="!loading && agents.length === 0" class="main__empty">
        <span class="main__empty-icon">
          <i></i><i></i><i></i>
        </span>
        <strong>暂无工作流</strong>
        <p>创建一个工作流后，它会显示在这里</p>
      </div>
    </main>

    <el-dialog
      title="新建workflow"
      :visible.sync="dialogVisible"
    >
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="活动区域" prop="description">
          <el-input v-model="ruleForm.description"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="isShowLoading" @click="addWorkflow">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'

export default {
  name: 'HomeView',
  data () {
    return {
      agents: [],
      loading: false,
      coverColors: ['#8297bc', '#947fbc', '#6d9d98', '#bd8a72', '#718db0', '#7c8ba4'],
      dialogVisible: false,
      ruleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入描述', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      },
      isShowLoading: false,
      saveWorkflowId: ['1', '2', '3', '4', '5']
    }
  },
  methods: {
    handleClick (item) {
      console.log(item)
      this.$router.push({
        path: `/workflow/${item.id}/${item.name}`
      })
    },
    getStatusText (status) {
      return Number(status) === 1 ? '已发布' : '草稿'
    },
    formatDate (value) {
      if (!value) return '--'

      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value

      return new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date)
    },
    async getAllFlows () {
      this.loading = true

      try {
        const response = await this.$api.getAll()

        if (response?.code !== 0 || !Array.isArray(response.data)) {
          throw new Error(response?.message || response?.msg || '获取工作流列表失败')
        }

        this.agents = response.data.map((item, index) => ({
          ...item,
          color: this.coverColors[index % this.coverColors.length]
        }))
      } catch (error) {
        this.agents = []
        this.$message.error(error.message || '获取工作流列表失败')
      } finally {
        this.loading = false
      }
    },

    handleCommand (value, agent) {
      console.log('value:', value, agent)
      if (value === 'delete') {
        if (this.saveWorkflowId.includes(agent.id)) {
          Message.warning('不可删除')
        } else {
          this.deleteWorkflow(agent.id)
        }
      }
    },
    async addWorkflow () {
      console.log('this.form', this.ruleForm)

      this.$refs.ruleForm.validate(async (valid) => {
        if (valid) {
          try {
            this.isShowLoading = true
            const res = await this.$api.addWorkflow(this.ruleForm)
            console.log('res:', res)
            if (res.code === 0) {
              await this.getAllFlows()
              Message.success('创建成功')
            }
          } finally {
            this.isShowLoading = false
            this.dialogVisible = false
          }
        } else {
          Message.warning('请完整填写表单')
          return false
        }
      })
    },
    async deleteWorkflow (id) {
      const res = await this.$api.deleteWorkflow(id)
      console.log('delete res:', res)
      if (res.code === 0) {
        Message.success('删除成功')
        await this.getAllFlows()
      } else {
        Message.error(res.message)
      }
    }

  },
  mounted () {
    this.getAllFlows()
  }
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  color: #191b22;
  background: #f6f7f9;

  .header {
    min-height: 132px;
    padding: 28px clamp(20px, 4vw, 56px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    background: #fff;
    border-bottom: 1px solid #eaecf0;

    &__eyebrow {
      margin-bottom: 6px;
      color: #6583b5;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
    }

    h1 {
      margin: 0;
      font-size: 26px;
      line-height: 1.35;
      font-weight: 600;
    }

    &__description {
      margin-top: 5px;
      color: #9298a5;
      font-size: 14px;
    }

    &__create {
      height: 42px;
      padding: 0 18px;
      border: 0;
      border-radius: 10px;
      color: #fff;
      background: #222834;
      font-size: 14px;
      cursor: pointer;
      transition: transform .2s ease, box-shadow .2s ease, background .2s ease;

      span { margin-right: 4px; font-size: 18px; }
      &:hover { transform: translateY(-2px); background: #3d4657; box-shadow: 0 8px 18px rgba(31, 39, 53, .18); }
    }
  }

  .main {
    padding: 26px clamp(20px, 4vw, 56px) 48px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
    grid-auto-rows: 204px;
    gap: 20px;

    .item {
      position: relative;
      min-width: 0;
      padding: 20px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 80px;
      grid-template-rows: 1fr auto;
      column-gap: 18px;
      overflow: hidden;
      background: #fff;
      border: 1px solid #e1e3e7;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(28, 35, 48, .03);
      transition: transform .28s cubic-bezier(.2, .8, .2, 1), border-color .28s ease, box-shadow .28s ease;

      &:hover {
        z-index: 2;
        transform: translateY(-8px);
        border-color: #cfd5df;
        box-shadow: 0 16px 34px rgba(27, 36, 52, .13);
      }

      &__content { min-width: 0; }
      &__heading { display: flex; align-items: center; gap: 8px; }
      &__heading h2 { font-size: 19px; line-height: 28px; font-weight: 500; }

      &__status {
        height: 20px;
        padding: 0 7px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border-radius: 10px;
        color: #8a6a22;
        background: #fff4d8;
        font-size: 10px;
        font-weight: 600;

        &--published {
          color: #16864b;
          background: #dcfae9;
        }
      }

      &__version {
        flex: 0 0 auto;
        color: #a1a6b2;
        font-size: 11px;
      }

      &__description {
        margin-top: 5px;
        overflow: hidden;
        color: #a0a4ad;
        font-size: 15px;
        line-height: 23px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &__tag {
        margin-top: 39px;
        padding: 4px 13px;
        display: inline-block;
        border: 1px solid #e7e8eb;
        border-radius: 8px;
        color: #25272c;
        background: #fff;
        font-size: 13px;
        line-height: 17px;
      }

      &__cover {
        --cover-color: #8297bc;
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 13px;
        background: var(--cover-color);
      }

      &__select {
        position: absolute;
        z-index: 3;
        top: -5px;
        right: -5px;
        width: 20px;
        height: 20px;
        border: 1px solid #dedfe3;
        border-radius: 6px;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, .05);
      }

      .layer {
        position: absolute;
        left: 50%;
        width: 45px;
        height: 28px;
        border-radius: 3px;
        transform: translateX(-50%) rotate(30deg) skewX(-30deg) scaleY(.7);
        box-shadow: 2px 4px 5px rgba(32, 45, 70, .18);

        &--back { top: 35px; background: #9fb0ca; }
        &--middle { top: 27px; background: #c0cde0; }
        &--front { top: 19px; background: #e4ebf4; }
      }

      &__footer {
        grid-column: 1 / -1;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
      }

      &__author {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 6px;
        overflow: hidden;
        color: #353943;
        font-size: 13px;
        white-space: nowrap;

        span:not(.item__avatar) { overflow: hidden; text-overflow: ellipsis; }
        i { width: 3px; height: 3px; flex: 0 0 auto; border-radius: 50%; background: #b4b7bf; }
      }

      &__avatar {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #4b83ff;

        svg { width: 13px; fill: #fff; }
      }

      &__actions { display: flex; gap: 7px; }
      &__actions button {
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e1e3e6;
        border-radius: 12px;
        background: #fff;
        cursor: pointer;
        transition: transform .2s ease, background .2s ease, box-shadow .2s ease;

        &:hover { transform: translateY(-2px); background: #f6f8fb; box-shadow: 0 5px 12px rgba(24, 32, 48, .09); }
        svg { width: 22px; height: 22px; fill: none; stroke: #11151c; stroke-width: 1.8; stroke-linejoin: round; }
        &:last-child svg { fill: #11151c; stroke: none; }
      }
    }

    &__empty {
      min-height: 260px;
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: #8f96a5;

      strong {
        margin-top: 14px;
        color: #454b59;
        font-size: 16px;
        font-weight: 500;
      }

      p {
        margin-top: 7px;
        font-size: 13px;
      }
    }

    &__empty-icon {
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border-radius: 16px;
      color: #8995ad;
      background: #e9edf5;

      i {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }
    }
  }
}

@media (max-width: 560px) {
  .home {
    .header { align-items: flex-start; flex-direction: column; }
    .main {
      grid-auto-rows: 220px;
      .item {
        padding: 17px;
        &__tag { margin-top: 28px; }
        &__author span:last-child, &__author i { display: none; }
      }
    }
  }
}
</style>
