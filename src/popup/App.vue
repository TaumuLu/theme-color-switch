<template>
  <el-config-provider :message="config">
    <div :class="`popup-box ${isDark ? 'dark' : 'light'}`">
      <div class="popup-header">
        <img alt="Vue logo" src="/icons/icon128.png" />
        <h2>{{ getMessage('extName') }}</h2>
      </div>
      <div class="popup-body">
        <div class="popup-body__top">
          <p>{{ getMessage('current_site') }}:</p>
          <span>{{ host }}</span>
        </div>
        <div class="popup-body__mode">
          <p>{{ getMessage('current_mode') }}:</p>
          <el-switch
            v-model="isDark"
            style="
              --el-switch-on-color: #1b1b1b;
              --el-switch-off-color: #f7f7f7;
            "
            :active-text="getMessage('dark_mode')"
            :inactive-text="getMessage('light_mode')"
            :loading="tabLoading"
            :disabled="!isLoad"
            @change="onSwitch"
          />
        </div>
        <!-- <div class="popup-body__enhanced">
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
            active-text="已启"
            inactive-text="关闭"
            inline-prompt
            :loading="tabLoading"
            :disabled="!isLoad"
          />
        </div> -->
      </div>
      <div v-if="isEnable" class="popup-footer">
        <h3>{{ getMessage('current_site_information') }}</h3>
        <div class="popup-footer__content">
          <p>
            <span>{{ getMessage('theme_color_consistent') }}：</span>
            {{ getMessage(isSame ? 'unanimous' : 'inconsistent') }}
          </p>
          <p>
            <span
              >matchMedia {{ getMessage('call') }}
              <el-tooltip
                :effect="isDark ? 'light' : 'dark'"
                :content="getMessage('tip1')"
                placement="top"
              >
                <el-icon :size="14"><QuestionFilled /></el-icon>
              </el-tooltip>
              ：
            </span>
            {{ getMessage('call') }} {{ styleStatus.listenerCount }}
            {{ getMessage('time') }}，{{ getMessage('call_back') }}
            {{ styleStatus.listenerTotal }}
            {{ getMessage('pcs') }}
          </p>
          <p>
            <span
              >CSS {{ getMessage('theme_color_style') }}
              <el-tooltip
                :effect="isDark ? 'light' : 'dark'"
                :content="getMessage('tip2')"
                placement="top"
              >
                <el-icon :size="14"><QuestionFilled /></el-icon>
              </el-tooltip>
              ：
            </span>
            {{ getMessage('light') }} {{ styleStatus.lightRules }}
            {{ getMessage('pcs') }}，{{ getMessage('dark') }}
            {{ styleStatus.darkRules }} {{ getMessage('pcs') }}
          </p>
        </div>
      </div>
      <div class="popup-bottom">
        <span>{{ getMessage('encountered_problems_during_use') }}</span>
        <a
          href="https://github.com/TaumuLu/theme-color-switch/issues"
          target="_blank"
          >{{ getMessage('to_give_feedback') }}</a
        >
      </div>
      <div :class="`popup-mask ${isEnable ? '' : 'disabled'}`">
        <el-switch
          :value="isEnable"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          :active-text="getMessage('activated')"
          :inactive-text="getMessage('disabled')"
          inline-prompt
          :loading="tabLoading"
          @change="onEnable"
        />
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/src/message.scss'

import { MessageType, ThemeValue, DomainValue } from '../constant'
import {
  getCurrentTab,
  getCurrentTabId,
  tabSendMessage,
} from '../utils/tabMessage'
import { getDomain } from '../utils/domain'
import { isNoAccessUrl, getMessage } from '../utils'
import { StyleStatus } from '../types'
import { runtimeSendMessage } from '../utils/runtime'

const config = reactive({
  max: 3,
})

const isDark = ref(true)
const host = ref('')
const isLoad = ref(false)
const tabLoading = ref(false)

const isEnable = ref(false)
const isRefresh = ref(false)

const styleStatus: StyleStatus = reactive({
  listenerCount: 0,
  listenerTotal: 0,
  lightRules: 0,
  darkRules: 0,
  isDark: true,
})

const isSame = computed(() => styleStatus.isDark === isDark.value)

watch(
  () => styleStatus.listenerCount,
  value => {
    isRefresh.value = value > 0
  },
)

const onReload = (tabId: number) => {
  tabLoading.value = true
  chrome.tabs.reload(tabId)
}

// 同步到 content 修改主题色
const onSwitch = (value: any) => {
  const refresh = isRefresh.value
  tabSendMessage(
    {
      type: MessageType.SetContentThemeValue,
      payload: {
        themeValue: value ? ThemeValue.Dark : ThemeValue.Light,
        refresh,
      },
    },
    () => {
      if (refresh) {
        getCurrentTabId().then(tabId => {
          if (tabId) {
            onReload(tabId)
          }
        })
      }
    },
  )
}

const updateDomain = async (key: string, value: Partial<DomainValue>) => {
  const tabId = await getCurrentTabId()
  return runtimeSendMessage({
    type: MessageType.UpdateDomain,
    payload: {
      key,
      value,
    },
  }).then(res => {
    if (res.payload && tabId) {
      chrome.tabs.reload(tabId)
      return true
    } else {
      return false
    }
  })
}

// const onEnhanced = async (value: any) => {
//   const key = host.value
//   const enhanced = !!value

//   if (key) {
//     updateDomain(key, { enhanced }).then(res => {
//       if (res) {
//         isEnhanced.value = value
//       }
//     })
//   }
// }

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
  const enable = !!value

  if (!key) {
    const tab = await getCurrentTab()
    if (!tab) {
      ElMessage({
        showClose: true,
        message: getMessage('msg1'),
        type: 'error',
      })
      return
    }
    if (tab.url) {
      if (isNoAccessUrl(tab.url)) {
        ElMessage({
          showClose: true,
          message: getMessage('msg2'),
          type: 'error',
        })
        return
      }
      const url = new URL(tab.url)
      const addHost = url.host
      await chrome.permissions
        .request({ origins: [`*://${addHost}/*`] })
        .then(granted => {
          if (granted) {
            key = addHost
          }
        })
    }
  }
  if (key) {
    updateDomain(key, { enable }).then(res => {
      if (res) {
        isEnable.value = enable
      }
    })
  }
}

// chrome.runtime.connect({ name: 'popup' })

// 初始触发初始事件
tabSendMessage({ type: MessageType.EmitPreLoad })
tabSendMessage({ type: MessageType.GetStyleStatus })

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
      break
    case MessageType.PutStyleStatus:
      Object.assign(styleStatus, payload)
      break
  }
  sendResponse()
})

// host 改动则重新查询状态
watch(host, value => {
  getDomain(value).then(res => {
    isEnable.value = !!res.enable
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
  min-width: 340px;
  display: flex;
  flex-direction: column;
}

.el-message {
  transform: none;
  left: 0;
  right: 0;
  margin: 0 auto;
}

.popup-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;

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
  padding: 0px 16px 20px;
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

.popup-footer {
  border-top: 1px solid #e6e6e6;
  background-color: #f7f7f7;
  padding: 16px;

  &__content {
    background-color: #fff;
    padding: 12px;
    padding-top: 4px;
    border: 1px solid #e6e6e6;
    border-radius: 5px;
  }

  h3 {
    font-size: 14px;
    margin: 0;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    margin-top: 12px;
    font-weight: bold;

    span {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      font-weight: normal;

      .el-icon {
        margin-left: 2px;
      }
    }
  }
}

.popup-bottom {
  border: 1px solid #e6e6e6;
  padding: 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  a {
    font-weight: bold;
    color: #0797e1;
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
    margin-right: 16px;
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

    .popup-footer {
      background-color: #2e2d2d;
      border-color: #000;
      color: #fff;

      &__content {
        background-color: #1b1b1b;
        border: 1px solid #000;
      }
    }

    .popup-bottom {
      border-color: #000;
    }
  }
}
</style>
