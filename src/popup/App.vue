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
      <!-- <div class="popup-body__enhanced">
        <p>开启增强模式</p>
      </div> -->
    </div>
    <!-- <div class="popup-footer"></div> -->
    <div :class="`popup-mask ${isEnable ? '' : 'disabled'}`">
      <el-switch
        v-model="isEnable"
        class="ml-2"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        active-text="已启用"
        inactive-text="已禁用"
        inline-prompt
        @change="onEnable"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MessageType, ThemeValue, StorageKey } from '../constant'
import { getCurrentTabId, sendMessage } from '../utils/tabMessage'
import { getStorageValue, setStorageValue } from '../utils/storage'

const isDark = ref(true)
const host = ref('')
const isLoad = ref(false)
const isEnable = ref(true)

// 同步到 content 修改主题色
const onChange = (value: any) => {
  sendMessage({
    type: MessageType.SetContentThemeValue,
    payload: value ? ThemeValue.Dark : ThemeValue.Light,
  })
}

const onEnable = (value: any) => {
  setStorageValue(StorageKey.Enable, value).then(() => {
    getCurrentTabId().then(tabId => {
      if (tabId) {
        // eslint-disable-next-line no-undef
        chrome.runtime
          .sendMessage({
            type: value
              ? MessageType.RegisterContentScripts
              : MessageType.UnRegisterContentScripts,
          })
          .then(() => {
            // eslint-disable-next-line no-undef
            chrome.tabs.reload(tabId)
          })
      }
    })
  })
}

getStorageValue(StorageKey.Enable).then(value => {
  isEnable.value = value
})

// 触发 PreLoad 事件
sendMessage({ type: MessageType.EmitPreLoad })

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
  /* border-bottom: 1px solid #e6e6e6; */

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

.popup-mask {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .el-switch {
    margin-right: 12px;
    margin-top: 20px;
  }

  &.disabled {
    bottom: 0;
    left: 0;
    cursor: not-allowed;
    background-color: rgba($color: #000, $alpha: 0.6);
  }
}

.popup-box {
  position: relative;

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

    .popup-mask {
      &.disabled {
        background-color: rgba($color: #ffff, $alpha: 0.6);
      }
    }
  }
}
</style>
