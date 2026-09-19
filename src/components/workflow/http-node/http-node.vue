<template>
  <div class="http-node">
    <div class="http-node__header">
      <span class="http-node__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.5 14.5 14.5 9" />
          <path d="m7.2 17.7-1 .9a3.7 3.7 0 0 1-5.2-5.2l3.1-3.1a3.7 3.7 0 0 1 5.2 0" />
          <path d="m16.8 6.3 1-.9a3.7 3.7 0 0 1 5.2 5.2l-3.1 3.1a3.7 3.7 0 0 1-5.2 0" />
        </svg>
      </span>

      <span class="http-node__title" :title="nodeTitle">{{ nodeTitle }}</span>

      <div class="http-node__actions">
        <el-popover
          placement="top-start"
          trigger="hover"
          content="测试该节点">
          <button @click.stop="openEditor" slot="reference" class="http-node__run" type="button" aria-label="运行节点">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m8 5 11 7-11 7V5Z" />
            </svg>
          </button>
        </el-popover>

        <!-- <button class="http-node__run" type="button" aria-label="运行节点">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m8 5 11 7-11 7V5Z" />
          </svg>
        </button> -->
<!--
        <el-dropdown @command="handleCommand">
          <button class="http-node__more" type="button" aria-label="更多操作">
            <span></span><span></span><span></span>
          </button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="delete">删除</el-dropdown-item>

          </el-dropdown-menu>
        </el-dropdown> -->
        <command-delete bgColor="#eaf7f2" color="#218d6c" :eventCenter="graphModel.eventCenter" :id="model.id"></command-delete>

        <!-- <button class="http-node__more" type="button" aria-label="更多操作">
          <span></span><span></span><span></span>
        </button> -->
      </div>
    </div>

    <div class="http-node__body">
      <div class="http-node__url" :class="{ 'http-node__url--empty': !url }" :title="url">
        <i class="el-icon-link"></i>
        <span>{{ url || '暂未配置请求地址' }}</span>
      </div>
      <p class="http-node__description" :class="{ 'http-node__description--empty': !description }" :title="description">
        {{ description || '暂无接口说明' }}
      </p>
    </div>
  </div>
</template>

<script>
import CommandDelete from '@/components/CommandDelete.vue'

export default {
  components: {
    CommandDelete
  },
  props: [
    'graphModel',
    'model',
    'title'
  ],
  data () {
    const properties = this.model?.properties || {}
    return {
      nodeTitle: properties.title || this.model?.title || this.title || 'HTTP 请求',
      url: properties.config?.url,
      description: properties.description || ''
    }
  },
  watch: {},
  computed: {
    // nodeTitle () {
    //   return this.model?.title || this.title || 'HTTP 请求'
    // },
    // url () {
    //   const properties = this.model?.properties || {}
    //   const data = properties.data && !Array.isArray(properties.data) ? properties.data : {}

    //   return properties.url || properties.config?.url || data.url || ''
    // },
    // description () {
    //   const properties = this.model?.properties || {}
    //   const data = properties.data && !Array.isArray(properties.data) ? properties.data : {}

    //   return properties.description || properties.config?.description || data.description || ''
    // }
  },
  methods: {
    openEditor () {
      this.graphModel.eventCenter.emit('open-node-editor', {
        id: this.model.id
      })
    },
    handleCommand (val) {
      if (val === 'delete') {
        this.graphModel.eventCenter.emit('delete-node', { id: this.model.id })
      }
    }
  },
  created () {},
  mounted () {
    this.graphModel.eventCenter.on('save', ({ data, id, lf }) => {
      if (id === this.model.id) {
        console.log('data更新了:', data)
        this.url = data.config.url
        this.description = data.description
        console.log('this.url:', this.url)
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.http-node {
  width: 100%;
  height: 100%;
  padding: 11px 14px;
  display: flex;
  flex-direction: column;
  color: #292c3d;
  background: linear-gradient(135deg, #fff 0%, #fafffd 100%);
  border: 1px solid #d8dceb;
  border-radius: 9px;
  box-shadow: 0 4px 12px rgba(52, 59, 102, .11);
  box-sizing: border-box;
  cursor: default;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  transition: border-color .2s ease, box-shadow .2s ease;

  &:hover {
    border-color: #55b99a;
    box-shadow: 0 7px 18px rgba(47, 143, 112, .16);
  }

  &__header {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 9px;
  }

  &__icon {
    width: 27px;
    height: 27px;
    flex: 0 0 27px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: #fff;
    background: linear-gradient(145deg, #45c39a, #249574);
    box-shadow: 0 3px 7px rgba(37, 151, 116, .22);

    svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  &__title {
    min-width: 0;
    overflow: hidden;
    color: #292c3d;
    font-size: 17px;
    font-weight: 600;
    line-height: 27px;
    letter-spacing: .2px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  &__run,
  &__more {
    width: 25px;
    height: 25px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 5px;
    color: #373b4c;
    background: transparent;
    cursor: pointer;
    transition: color .18s ease, background .18s ease;

    &:hover {
      color: #218d6c;
      background: #eaf7f2;
    }
  }

  &__run svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  &__more {
    gap: 3px;

    span {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: currentColor;
    }
  }

  &__body {
    min-width: 0;
    margin-top: 12px;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
  }

  &__url {
    min-width: 0;
    height: 28px;
    padding: 0 9px;
    display: flex;
    align-items: center;
    gap: 7px;
    overflow: hidden;
    border: 1px solid #dceae5;
    border-radius: 6px;
    color: #277e64;
    background: #f0faf6;
    font-size: 11px;
    line-height: 28px;

    i {
      flex: 0 0 auto;
      font-size: 12px;
    }

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &--empty {
      color: #9da5b1;
      border-color: #e5e7ed;
      background: #f7f8fa;
    }
  }

  &__description {
    margin: 0;
    overflow: hidden;
    color: #777d8d;
    display: -webkit-box;
    font-size: 11px;
    line-height: 17px;
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    &--empty {
      color: #afb3bf;
    }
  }
}
</style>
