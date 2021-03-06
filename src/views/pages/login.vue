<template>
  <div class="aui-wrapper aui-page__login">
    <div class="aui-content__wrapper">
      <main class="aui-content">
        <div class="login-header">
          <h2 class="login-brand" v-html="sysConfig.loginTitle"/>
        </div>
        <el-card class="login-body">
          <el-form v-loading="formLoading" :model="dataForm" :rules="dataRule" ref="dataForm" status-icon :validate-on-rule-change="false" @keyup.enter.native="dataFormSubmitHandle()">
            <el-form-item>
              <el-radio-group v-model="dataForm.type" size="small" @change="typeChangeHandle">
                <el-radio-button label="ADMIN_USERNAME_PASSWORD" v-if="loginAdminConfig.usernamePasswordLogin">帐号登录</el-radio-button>
                <el-radio-button label="ADMIN_MOBILE_SMSCODE" v-if="loginAdminConfig.mobileSmscodeLogin">验证码登录</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <!-- 帐号密码登录 -->
            <template v-if="dataForm.type === 'ADMIN_USERNAME_PASSWORD'">
              <el-form-item prop="username">
                <el-input v-model="dataForm.username" prefix-icon="el-icon-user" :placeholder="$t('username')"/>
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="dataForm.password" prefix-icon="el-icon-lock" :placeholder="$t('password')" show-password/>
              </el-form-item>
              <el-form-item prop="captcha" v-if="loginTypeConfig.captcha">
                <el-input v-model="dataForm.captcha" prefix-icon="el-icon-c-scale-to-original" :placeholder="$t('captcha')" maxlength="8">
                  <el-tooltip slot="append" effect="dark" content="点击刷新图形验证码" placement="right">
                    <img :src="captchaImage" width="100px" @click="getCaptcha" class="link">
                  </el-tooltip>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="dataFormSubmitHandle()" class="w-percent-100">{{ $t('login') }}</el-button>
              </el-form-item>
            </template>
            <!-- 手机号验证码登录 -->
            <template v-else-if="dataForm.type === 'ADMIN_MOBILE_SMSCODE'">
              <el-form-item prop="mobile">
                <el-input v-model="dataForm.mobile" :placeholder="$t('mobile')" prefix-icon="el-icon-mobile-phone" maxlength="11" minlength="11" class="input-with-select">
                  <template slot="prepend">+86</template>
                </el-input>
              </el-form-item>
              <el-form-item prop="smsCode">
                <el-input v-model="dataForm.smsCode" :placeholder="$t('smsCode')" prefix-icon="el-icon-message" maxlength="6" minlength="4">
                  <el-button slot="append" @click="smsCodeSendHandle()" type="primary" :disabled="smsSendTimeout < 60">
                    {{ smsSendTimeout !== 60 ? $t('resendSmsCode', {'sec': smsSendTimeout}) : $t('sendSmsCode') }}
                  </el-button>
                </el-input>
              </el-form-item>
              <!-- 图形验证码 -->
              <el-form-item prop="captcha" v-if="loginTypeConfig.captcha">
                <el-input v-model="dataForm.captcha" prefix-icon="el-icon-c-scale-to-original" :placeholder="$t('captcha')">
                  <el-tooltip slot="append" effect="dark" content="点击刷新图形验证码" placement="right">
                    <img :src="captchaImage" width="100px" @click="getCaptcha" class="link">
                  </el-tooltip>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="dataFormSubmitHandle()" class="w-percent-100">{{ $t('login') }}</el-button>
              </el-form-item>
            </template>
          </el-form>
          <el-divider v-if="loginAdminConfig.wechatScanLogin || loginAdminConfig.dingtalkScanLogin">第三方登录</el-divider>
          <div>
            <wechat-scan-login v-if="loginAdminConfig.wechatScanLogin" :appid="this.loginAdminConfig.wechatScanLoginConfig.appid" :callback="this.loginAdminConfig.wechatScanLoginConfig.callback"/>
            <dingtalk-scan-login v-if="loginAdminConfig.dingtalkScanLogin" :appid="this.loginAdminConfig.dingtalkScanLoginConfig.appid" :callback="this.loginAdminConfig.dingtalkScanLoginConfig.callback"/>
          </div>
          <el-divider v-if="loginAdminConfig.register || loginAdminConfig.forgetPassword"></el-divider>
          <div v-if="loginAdminConfig.register || loginAdminConfig.forgetPassword">
            <router-link :to="{ name: 'register' }" v-if="loginAdminConfig.register">
              <el-link :underline="false" type="info" class="no-underline fl">{{ $t('register') }}</el-link>
            </router-link>
            <router-link :to="{ name: 'forgetPassword' }" v-if="loginAdminConfig.forgetPassword">
              <el-link :underline="false" type="info" class="no-underline fr">{{ $t('forgetPassword') }}</el-link>
            </router-link>
          </div>
        </el-card>
        <div class="login-footer" v-html="sysConfig.copyright"/>
      </main>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Cookies from 'js-cookie'
import DingtalkScanLogin from '@/components/dingtalk-scan-login'
import WechatScanLogin from '@/components/wechat-scan-login'
import mixinFormModule from '@/mixins/form-module'
import { redirectLogin } from '@/utils'

export default {
  mixins: [mixinFormModule],
  components: { WechatScanLogin, DingtalkScanLogin },
  data () {
    return {
      // 表单模块参数
      mixinFormModuleOptions: {
        // 登录接口
        dataFormParamEncrypt: false,
        dataFormSaveURL: '/uc/user/login'
      },
      dataFormMode: 'save',
      // 系统配置
      sysConfig: {},
      // 全局登录配置
      loginAdminConfig: {
        forgetPassword: false,
        register: false,
        usernamePasswordLogin: false,
        mobileSmscodeLogin: false,
        wechatScanLogin: false,
        dingtalkScanLogin: false
      },
      // 当前登录渠道配置
      loginTypeConfig: {
        captcha: false
      },
      // 短信发送倒计时
      smsSendTimeout: 60,
      // 验证码图片
      captchaImage: '',
      dataForm: {
        username: '',
        password: '',
        mobile: '',
        mobileArea: '86',
        smsCode: '',
        uuid: '',
        captcha: '',
        type: ''
      }
    }
  },
  computed: {
    dataRule () {
      return {
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        password: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        captcha: [
          { required: this.loginTypeConfig.captcha, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        smsCode: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 来源是登录回调还是正常登录
    let type = this.$route.query.type
    if (type === 'callback') {
      this.oauthLoginHandle(type, this.$route.query.code)
    } else {
      // 获取系统配置
      this.getSysConfig()
      // 获得登录配置
      this.getLoginConfig()
    }
  },
  methods: {
    // 切换登录类型
    typeChangeHandle () {
      // 赋值当前渠道配置
      if (this.dataForm.type === 'ADMIN_USERNAME_PASSWORD') {
        this.loginTypeConfig = this.loginAdminConfig.usernamePasswordLoginConfig
      } else if (this.dataForm.type === 'ADMIN_MOBILE_SMSCODE') {
        this.loginTypeConfig = this.loginAdminConfig.mobileSmscodeLoginConfig
      }
      // 获取验证码
      if (this.loginTypeConfig.captcha) {
        this.getCaptcha()
      }
      // 清空校验
      this.$refs['dataForm'].clearValidate()
    },
    // 获取系统配置
    getSysConfig () {
      // 先从本地读取
      const localConfig = localStorage.getItem('sysConfig')
      if (localConfig) {
        this.sysConfig = JSON.parse(localConfig)
        document.title = this.sysConfig.title
      }
      // 再从线上读取
      axios.get(`/json/sysConfig.json`).then(({ data: res }) => {
        this.sysConfig = res
        localStorage.setItem('sysConfig', JSON.stringify(res))
        document.title = this.sysConfig.title
      })
    },
    // 获取登录配置
    getLoginConfig () {
      this.$http.get(`/sys/param/getLoginAdmin`).then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        } else {
          // 赋值全局登录配置
          this.loginAdminConfig = res.data
          // 找到第一个enable的登录渠道
          if (this.loginAdminConfig.usernamePasswordLogin) {
            this.dataForm.type = 'ADMIN_USERNAME_PASSWORD'
          } else if (this.loginAdminConfig.mobileAndSmscodeLogin) {
            this.dataForm.type = 'ADMIN_MOBILE_SMSCODE'
          }
          this.typeChangeHandle()
        }
      }).finally(() => {
        this.formLoading = false
      })
    },
    // 获取验证码
    getCaptcha () {
      this.$http.get(`/sys/captcha/base64?width=110&height=40`).then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        } else {
          this.captchaImage = res.data.image
          this.dataForm.uuid = res.data.uuid
        }
      })
    },
    // 发送短信验证码
    smsCodeSendHandle () {
      if (this.smsSendTimeout < 60) {
        return
      }
      this.$refs['dataForm'].validateField('mobile', (errorMessage) => {
        if (errorMessage) {
          return false
        }
        this.formLoading = true
        this.$http.post(`/msg/mailLog/sendCode`, { 'mailTo': this.dataForm.mobile, 'tplCode': 'CODE_LOGIN' }).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.toast)
          }
          this.$message.success('短信发送成功')
          // 开始倒计时
          this.smsSendTimeout = 60
          const timer = window.setInterval(() => {
            if (this.smsSendTimeout-- <= 0) {
              this.smsSendTimeout = 60
              window.clearInterval(timer)
            }
          }, 1000)
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    // 表单提交失败
    onFormSubmitError (res) {
      // 刷新验证码
      if (this.loginTypeConfig.captcha) {
        this.getCaptcha()
      }
      this.$message.error(res.toast)
    },
    // 表单提交成功
    onFormSubmitSuccess (res) {
      // 加一个message,缓解跳转过程中的等待
      this.$message({ message: '登录成功', type: 'success', duration: 1000 })
      // 将token保存到cookie
      Cookies.set('token', res.data.token)
      // 跳转到home
      this.$router.replace({ name: 'home' })
    },
    /**
     * 第三方code登录
     */
    oauthLoginHandle (type, code) {
      this.formLoading = true
      this.$http.post(`/uc/userOauth/dingtalkLoginByCode`, { code: code }).then(({ data: res }) => {
        if (res.code !== 0) {
          this.$alert(res.toast, this.$t('prompt.title'), {
            confirmButtonText: `重新登录`,
            type: 'warning'
          }).then(() => {
            // 重新登录
            redirectLogin()
          })
        } else {
          this.onFormSubmitSuccess(res)
        }
      }).finally(() => {
        this.formLoading = false
      })
    }
  }
}
</script>
