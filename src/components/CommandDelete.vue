<template>
  <div class="node" :style="{'--color':color,'--bgcolor':bgColor}">
    <el-dropdown @command="handleCommand">
      <button class="node__more" type="button" aria-label="更多操作">
        <span></span><span></span><span></span>
      </button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="delete">删除</el-dropdown-item>

      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  components: {},
  props: [
    'color',
    'bgColor',
    'id',
    'eventCenter'
  ],

  data () {
    return {
    }
  },
  watch: {

  },
  computed: {},
  methods: {
    handleCommand (val) {
      if (val === 'delete') {
        this.eventCenter.emit('delete-node', { id: this.id })
      }
    }
  },
  created () {},
  mounted () {

  }
}
</script>
<style lang="scss" scoped>
.node{
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
    gap: 3px;

    span {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: currentColor;
    }

    &:hover {
      color: var(--color);
      background: var(--bgcolor);
    }

  }
}

</style>
