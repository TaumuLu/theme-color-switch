<template>
  <div :class="`popup-box ${isDark ? 'dark' : 'light'}`">
    <div class="popup-header">
      <img alt="Vue logo" src="/logo.png" />
      <h2>主题色切换</h2>
    </div>
    <div class="popup-body">
      <div class="popup-body__top">
        <p>当前网站:</p>
        <span>{{ host }}</span>
      </div>
      <div class="popup-body__bottom">
        <p>当前模式:</p>
        <el-switch
          v-model="isDark"
          class="ml-2"
          style="--el-switch-on-color: #1b1b1b; --el-switch-off-color: #f7f7f7"
          active-text="深色模式"
          inactive-text="浅色模式"
          :disabled="!isLoad"
          @change="onChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MessageType, ThemeValue } from '../constant'
import { getCurrentTabId, sendMessage } from '../utils/tabMessage'

const isDark = ref(true)
const host = ref('')
const isLoad = ref(false)

// 同步到 content 修改主题色
const onChange = (value: any) => {
  sendMessage({
    type: MessageType.SetContentThemeValue,
    payload: value ? ThemeValue.Dark : ThemeValue.Light,
  })
}

// 触发 ContentLoad 事件
sendMessage({ type: MessageType.EmitContentLoad })

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const senderId = sender.tab?.id
  const { payload, type } = request

  switch (type) {
    case MessageType.ContentLoad:
      getCurrentTabId().then(tabId => {
        // 只接收当前激活 tab 的事件
        if (tabId !== senderId) return

        isLoad.value = true
        isDark.value = payload.themeValue === ThemeValue.Dark
        host.value = payload.host
      })
  }
})
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 18px;

  img {
    width: 28px;
    margin-right: 4px;
  }

  h2 {
    font-size: 18px;
    font-weight: normal;
  }
}

.popup-body {
  padding: 0px 20px 20px;
  display: flex;
  flex-direction: column;

  &__top {
    margin-bottom: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;

    p {
      margin: 0;
      margin-right: 12px;
      font-size: 14px;
    }

    span {
      font-size: 12px;
    }
  }

  &__bottom {
    display: flex;
    flex-direction: row;
    align-items: center;

    p {
      margin: 0;
      margin-right: 12px;
      font-size: 14px;
    }
  }

  .el-switch {
    .el-switch__label {
      opacity: 0.4;
      color: #1b1b1b;

      span {
        font-size: 12px;
      }

      &.is-active {
        opacity: 1;
        font-weight: bold;

        span {
          font-size: 14px;
        }
      }
    }

    .el-switch__action {
      background-color: #fff;
    }

    .el-switch__core {
      background-color: #1b1b1b;
    }
  }
}

.popup-box {
  &.dark {
    background-color: #1b1b1b;
    color: #fff;

    .popup-body {
      .el-switch {
        .el-switch__label {
          color: #fff;
        }

        .el-switch__action {
          background-color: #000;
        }

        .el-switch__core {
          background-color: #fff;
        }
      }
    }
  }
}
</style>
