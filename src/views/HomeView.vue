<template>
  <div class="home">
    <header class="header">
      <div>
        <p class="header__eyebrow">WORKSPACE</p>
        <h1>智能体中心</h1>
        <p class="header__description">选择一个智能体，快速开始你的工作</p>
      </div>
      <button class="header__create" type="button">
        <span>＋</span>
        创建智能体
      </button>
    </header>

    <main class="main">
      <article v-for="agent in agents" @click="handleClick(agent)" :key="agent.id" class="item">
        <div class="item__content">
          <div class="item__heading">
            <h2>{{ agent.name }}</h2>
            <span class="item__verified" title="已认证">✓</span>
          </div>
          <p class="item__description">{{ agent.description }}</p>
          <span class="item__tag">{{ agent.tag }}</span>
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
            <span>{{ agent.author }}</span>
            <i />
            <span>最近编辑 {{ agent.updatedAt }}</span>
          </div>
          <div class="item__actions">
            <button type="button" aria-label="收藏">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 3 2.78 5.63 6.22.91-4.5 4.38 1.06 6.19L12 17.18l-5.56 2.93 1.06-6.19L3 9.54l6.22-.91L12 3Z" />
              </svg>
            </button>
            <button type="button" aria-label="更多操作">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>
          </div>
        </footer>
      </article>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data () {
    return {
      agents: [
        { id: 1, name: '医疗小助手', description: '根据病人描述病状推断出应该就诊科室', tag: '智能体', author: 'RootUser_2107908511', updatedAt: '07-20 10:42', color: '#8297bc' },
        { id: 2, name: '文案创作助手', description: '根据主题和语气，快速生成高质量创意文案', tag: '内容创作', author: 'RootUser_2107908511', updatedAt: '07-19 16:28', color: '#947fbc' },
        { id: 3, name: '数据分析助手', description: '解析业务数据，发现趋势并生成分析结论', tag: '效率工具', author: 'RootUser_2107908511', updatedAt: '07-18 09:15', color: '#6d9d98' },
        { id: 4, name: '学习规划助手', description: '结合你的目标，定制清晰可行的学习计划', tag: '教育', author: 'RootUser_2107908511', updatedAt: '07-17 14:06', color: '#bd8a72' },
        { id: 5, name: '旅行规划助手', description: '一站式规划行程、景点与每日出行安排', tag: '生活', author: 'RootUser_2107908511', updatedAt: '07-16 11:30', color: '#718db0' },
        { id: 6, name: '代码审查助手', description: '定位潜在问题，给出清晰可靠的优化建议', tag: '开发工具', author: 'RootUser_2107908511', updatedAt: '07-15 18:42', color: '#7c8ba4' }
      ]
    }
  },
  methods: {
    handleClick (item) {
      console.log(item)
      this.$router.push({
        path: `/workflow/${item.id}/${item.name}`
      })
    }
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

      &__verified {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: #18b964;
        background: #dcfae9;
        font-size: 12px;
        font-weight: 700;
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
