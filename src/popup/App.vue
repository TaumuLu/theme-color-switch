<template>
  <div :class="`popup-box ${isDark ? 'dark' : 'light'}`">
    <div class="popup-header">
      <img alt="Vue logo" src="/icons/icon128.png" />
      <h2>主题色切换</h2>
    </div>
    <div class="popup-body">
      <div class="popup-body__top">
        <p>当前网站:</p>
        <span>{{ host }}</span>
      </div>
      <div class="popup-body__mode">
        <p>当前模式:</p>
        <el-switch
          v-model="isDark"
          style="--el-switch-on-color: #1b1b1b; --el-switch-off-color: #f7f7f7"
          active-text="深色模式"
          inactive-text="浅色模式"
          :loading="tabLoading"
          :disabled="!isLoad"
          @change="onSwitch"
        />
      </div>
      <div class="popup-body__enhanced">
        <p>
          开启增强模式
          <el-tooltip
            :effect="isDark ? 'light' : 'dark'"
            content="当切换无效时可以开启尝试"
            placement="top"
          >
            <el-icon :size="14"><QuestionFilled /></el-icon>
          </el-tooltip>
          :
        </p>
        <el-switch
          v-model="isEnhanced"
          active-text="已启"
          inactive-text="关闭"
          inline-prompt
          :loading="tabLoading"
          :disabled="!isLoad"
          @change="onEnhanced"
        />
      </div>
    </div>
    <!-- <div class="popup-footer"></div> -->
    <div :class="`popup-mask ${isEnable ? '' : 'disabled'}`">
      <el-switch
        :value="isEnable"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        active-text="已启用"
        inactive-text="已禁用"
        inline-prompt
        :loading="tabLoading"
        @change="onEnable"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { MessageType, ThemeValue, DomainValue } from '../constant'
import {
  getCurrentTab,
  getCurrentTabId,
  sendMessage,
} from '../utils/tabMessage'
import { getDomain, setDomain } from '../utils/domain'
import { QuestionFilled } from '@element-plus/icons-vue'

const isDark = ref(true)
const host = ref('')
const isLoad = ref(false)
const tabLoading = ref(false)

const isEnable = ref(false)
const isEnhanced = ref(false)

const onSetDomain = async (key: string, value: Partial<DomainValue>) => {
  const domain = await getDomain(key)
  return setDomain(key, { ...domain, ...value }).then(() => {
    getCurrentTabId().then(tabId => {
      if (tabId) {
        // eslint-disable-next-line no-undef
        return chrome.runtime
          .sendMessage({
            type: MessageType.RegisterContentScripts,
          })
          .then(() => {
            tabLoading.value = true
            // eslint-disable-next-line no-undef
            chrome.tabs.reload(tabId)
          })
      }
    })
  })
}

// 同步到 content 修改主题色
const onSwitch = (value: any) => {
  sendMessage({
    type: MessageType.SetContentThemeValue,
    payload: value ? ThemeValue.Dark : ThemeValue.Light,
  })
}

const onEnhanced = (value: any) => {
  const key = host.value
  if (key) {
    onSetDomain(key, { enhanced: !!value }).then(() => {
      isEnhanced.value = value
    })
  }
}

// eslint-disable-next-line no-undef
chrome.tabs.onUpdated.addListener(async (id, changeInfo, tab) => {
  // if (status === 'loading') {
  //   tabLoading.value = true
  // }
  if (
    changeInfo.status === 'complete' ||
    changeInfo.favIconUrl ||
    changeInfo.title
  ) {
    tabLoading.value = false
  }
})

const onEnable = async (value: any) => {
  let key = host.value

  if (!key) {
    await getCurrentTab().then(tab => {
      if (tab.url) {
        const url = new URL(tab.url)
        const addHost = url.host
        // eslint-disable-next-line no-undef
        return chrome.permissions
          .request({ origins: [`*://${addHost}/*`] })
          .then(granted => {
            if (granted) {
              key = addHost
            }
          })
      }
    })
  }
  if (key) {
    onSetDomain(key, { enable: !!value }).then(() => {
      isEnable.value = value
    })
  }
}

// 初始触发 PreLoad 事件
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
        tabLoading.value = false
        host.value = payload.host
      })
  }
})

// host 改动则重新查询状态
watch(host, value => {
  getDomain(value).then(res => {
    isEnable.value = !!res.enable
    isEnhanced.value = !!res.enhanced
  })
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

  &__mode {
    display: flex;
    flex-direction: row;
    align-items: center;

    p {
      margin: 0;
      margin-right: 12px;
      font-size: 14px;
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

  &__enhanced {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-left: 4px solid #eeeeee;
    padding-left: 12px;
    margin-top: 12px;

    p {
      margin: 0;
      margin-right: 12px;
      font-size: 12px;
      display: flex;
      flex-direction: row;
      align-items: center;

      .el-icon {
        margin-left: 2px;
      }
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
      &__mode {
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

    .popup-mask {
      &.disabled {
        background-color: rgba($color: #ffff, $alpha: 0.6);
      }
    }
  }
}
</style>
