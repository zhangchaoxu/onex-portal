<template>
  <div class="aui-wrapper aui-page__login">
    <div class="aui-content__wrapper">
      <main class="aui-content">
        <div class="login-header">
          <h2 class="login-brand" v-html="loginParams.titleHeader"/>
        </div>
        <el-card class="login-body">
          <el-form v-loading="formLoading" :model="dataForm" :rules="dataRule" ref="dataForm" status-icon
                   :validate-on-rule-change="false" @keyup.enter.native="dataFormSubmitHandle()">
            <el-form-item>
              <el-radio-group v-model="dataForm.type" size="small" @change="typeChangeHandle">
                <el-radio-button v-if="this.loginParams.usernamePasswordLogin && this.loginParams.usernamePasswordLogin.enable" :label="this.loginParams.usernamePasswordLogin.type">{{ this.loginParams.usernamePasswordLogin.name }}</el-radio-button>
                <el-radio-button v-if="this.loginParams.mobileSmsLogin && this.loginParams.mobileSmsLogin.enable" :label="this.loginParams.mobileSmsLogin.type">{{ this.loginParams.mobileSmsLogin.name }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <!-- 帐号密码登录 -->
            <template v-if="this.loginParams.usernamePasswordLogin && this.loginParams.usernamePasswordLogin.enable && this.loginParams.usernamePasswordLogin.type === this.dataForm.type">
              <el-form-item prop="username">
                <el-input v-model="dataForm.username" prefix-icon="el-icon-user" :placeholder="$t('username')"/>
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="dataForm.password" prefix-icon="el-icon-lock" :placeholder="$t('password')" show-password/>
              </el-form-item>
              <el-form-item prop="captcha" v-if="loginTypeConfig.captcha">
                <el-input v-model="dataForm.captchaValue" prefix-icon="el-icon-c-scale-to-original" :placeholder="$t('captcha')" maxlength="8">
                  <el-tooltip slot="append" effect="dark" content="点击刷新图形验证码" placement="right">
                    <img :src="captchaImage" width="100px" @click="getCaptcha" class="link">
                  </el-tooltip>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="dataFormSubmitHandle()" class="w-percent-100">{{ $t('login') }}
                </el-button>
              </el-form-item>
            </template>
            <!-- 手机号验证码登录 -->
            <template v-if="this.loginParams.mobileSmsLogin && this.loginParams.mobileSmsLogin.enable && this.loginParams.mobileSmsLogin.type === this.dataForm.type">
              <el-form-item prop="mobile">
                <el-input v-model="dataForm.mobile" :placeholder="$t('mobile')" prefix-icon="el-icon-mobile-phone" maxlength="11" minlength="11" class="input-with-select">
                  <template slot="prepend">+86</template>
                </el-input>
              </el-form-item>
              <el-form-item prop="smsCode">
                <el-input v-model="dataForm.smsCode" :placeholder="$t('smsCode')" prefix-icon="el-icon-message" maxlength="6" minlength="4">
                  <el-button slot="append" @click="smsCodeSendHandle()" type="primary" :disabled="smsSendTimeout < this.loginTypeConfig.mailTplTimeout">
                    {{ smsSendTimeout !== this.loginTypeConfig.mailTplTimeout ? $t('resendSmsCode', {'sec': smsSendTimeout}) : $t('sendSmsCode') }}
                  </el-button>
                </el-input>
              </el-form-item>
              <!-- 图形验证码 -->
              <el-form-item prop="captcha" v-if="loginTypeConfig.captcha">
                <el-input v-model="dataForm.captchaValue" prefix-icon="el-icon-c-scale-to-original" :placeholder="$t('captcha')">
                  <el-tooltip slot="append" effect="dark" content="点击刷新图形验证码" placement="right">
                    <img :src="captchaImage" width="100px" @click="getCaptcha" class="link">
                  </el-tooltip>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="dataFormSubmitHandle()" class="w-percent-100">{{ $t('login') }}
                </el-button>
              </el-form-item>
            </template>
          </el-form>
          <el-divider v-if="(this.loginParams.dingtalkScanLogin && this.loginParams.dingtalkScanLogin.enable) || (this.loginParams.wechatScanLogin && this.loginParams.wechatScanLogin.enable)">第三方登录</el-divider>
          <div>
            <dingtalk-scan-login v-if="this.loginParams.dingtalkScanLogin && this.loginParams.dingtalkScanLogin.enable" :appid="this.loginParams.dingtalkScanLogin.appid" :callback="this.loginParams.dingtalkScanLogin.callback"/>
            <wechat-scan-login v-if="this.loginParams.wechatScanLogin && this.loginParams.wechatScanLogin.enable" :appid="this.loginParams.wechatScanLogin.appid" :callback="this.loginParams.wechatScanLogin.appid"/>
          </div>
          <el-divider v-if="loginParams.register || loginParams.forgetPassword"></el-divider>
          <div v-if="loginParams.register || loginParams.forgetPassword">
            <router-link :to="{ name: 'register' }" v-if="loginParams.register">
              <el-link :underline="false" type="info" class="no-underline fl">{{ $t('register') }}</el-link>
            </router-link>
            <router-link :to="{ name: 'forgetPassword' }" v-if="loginParams.forgetPassword">
              <el-link :underline="false" type="info" class="no-underline fr">{{ $t('forgetPassword') }}</el-link>
            </router-link>
          </div>
        </el-card>
        <div class="login-footer" v-html="loginParams.copyright"/>
      </main>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import DingtalkScanLogin from '@/components/dingtalk-scan-login'
import WechatScanLogin from '@/components/wechat-scan-login'
import mixinFormModule from '@/mixins/form-module'
import {redirectLogin} from '@/utils'

export default {
  mixins: [mixinFormModule],
  components: {WechatScanLogin, DingtalkScanLogin},
  data() {
    return {
      mixinFormModuleOptions: {
        // 登录接口加密
        dataFormParamEncrypt: false,
        dataFormSaveURL: '/uc/auth/userLogin'
      },
      dataFormMode: 'save',
      // 登录参数
      loginParams: {
        forgetPassword: false,
        register: false,
        types: []
      },
      // 当前登录渠道配置
      loginTypeConfig: {
        captcha: false,
        // 短信发送倒计时
        mailTplTimeout: 60
      },
      wechatScanConfig: {},
      dingtalkScanConfig: {},
      smsSendTimeout: 0,
      // 验证码图片
      captchaImage: '',
      dataForm: {
        username: '',
        password: '',
        tenantCode: '',
        mobile: '',
        smsCode: '',
        captchaUuid: '',
        captchaValue: '',
        type: ''
      }
    }
  },
  computed: {
    dataRule() {
      return {
        username: [
          {required: true, message: this.$t('validate.required'), trigger: 'blur'}
        ],
        password: [
          {required: true, message: this.$t('validate.required'), trigger: 'blur'}
        ],
        captchaValue: [
          {required: this.loginTypeConfig.captcha, message: this.$t('validate.required'), trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: this.$t('validate.required'), trigger: 'blur'}
        ],
        smsCode: [
          {required: true, message: this.$t('validate.required'), trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    // 来源是登录回调还是正常登录
    const type = this.$route.query.type
    if (type === 'callback') {
      // 登录回调
      this.oauthLoginHandle(type, this.$route.query.code)
    } else {
      // 正常登录页面,先获得登录参数
      this.getLoginParams()
    }
  },
  methods: {
    // 切换登录类型
    typeChangeHandle(type) {
      if (this.loginParams.usernamePasswordLogin && this.loginParams.usernamePasswordLogin.enable && this.loginParams.usernamePasswordLogin.type === type) {
        this.loginTypeConfig = this.loginParams.usernamePasswordLogin
      } else if (this.loginParams.mobileSmsLogin && this.loginParams.mobileSmsLogin.enable && this.loginParams.mobileSmsLogin.type === type) {
        this.loginTypeConfig = this.loginParams.mobileSmsLogin
        this.smsSendTimeout = this.loginTypeConfig.mailTplTimeout
      }
      // 清空校验
      this.$refs.dataForm.clearValidate()
      if (this.loginTypeConfig.captcha) {
        this.getCaptcha()
      }
    },
    // 获得登录参数
    getLoginParams() {
      //let url = window.location.origin
      let url = 'https://portal-onex.nb6868.com'
      this.$http.post('/uc/params/infoByCode', {contentUrl: url, code:'ADMIN_LOGIN'}).then(({data: res}) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        } else {
          this.loginParams = res.data
          this.dataForm.tenantCode = this.loginParams.tenantCode
          document.title = this.loginParams.title
          if (this.loginParams.usernamePasswordLogin && this.loginParams.usernamePasswordLogin.enable) {
            this.dataForm.type = this.loginParams.usernamePasswordLogin.type
          } else if (this.loginParams.mobileSmsLogin && this.loginParams.mobileSmsLogin.enable) {
            this.dataForm.type = this.loginParams.mobileSmsLogin.type
          }
          this.typeChangeHandle(this.dataForm.type)
        }
      }).finally(() => {
        this.formLoading = false
      })
    },
    // 获取验证码
    getCaptcha() {
      this.$http.post('/uc/auth/captcha', {
        width: 110,
        height: 40
      }).then(({data: res}) => {
        if (res.code !== 0) {
          return this.$message.error(res.toast)
        } else {
          this.captchaImage = res.data.image
          this.dataForm.captchaUuid = res.data.uuid
        }
      })
    },
    // 发送短信验证码
    smsCodeSendHandle() {
      if (this.smsSendTimeout < this.loginTypeConfig.mailTplTimeout) {
        return
      }
      this.$refs.dataForm.validateField('mobile', (errorMessage) => {
        if (errorMessage) {
          return false
        }
        this.formLoading = true
        this.$http.post('/msg/mailLog/sendCode', {
          mailTo: this.dataForm.mobile,
          tplCode: this.loginTypeConfig.mailTplCode
        }).then(({data: res}) => {
          if (res.code !== 0) {
            return this.$message.error(res.toast)
          }
          this.$message.success('短信发送成功')
          // 开始倒计时
          this.smsSendTimeout = this.loginTypeConfig.mailTplTimeout
          const timer = window.setInterval(() => {
            if (this.smsSendTimeout-- <= 0) {
              this.smsSendTimeout = this.loginTypeConfig.mailTplTimeout
              window.clearInterval(timer)
            }
          }, 1000)
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    // 表单提交失败
    onFormSubmitError(res) {
      // 刷新验证码
      if (this.loginTypeConfig.captcha) {
        this.getCaptcha()
      }
      this.$message.error(res.toast)
    },
    // 表单提交成功
    onFormSubmitSuccess(res) {
      // 加一个message,缓解跳转过程中的等待
      this.$message({message: '登录成功', type: 'success', duration: 1000})
      // 将token和token的key名保存到cookie
      Cookies.set('token', res.data.token)
      Cookies.set('tokenKey', res.data.tokenKey)
      // 跳转到home
      this.$router.replace({name: 'home'})
    },
    /**
     * 第三方code登录
     */
    oauthLoginHandle(type, code) {
      this.formLoading = true
      this.$http.post('/uc/auth/dingtalkLoginByCode', {type: 'ADMIN_DINGTALK_SCAN', code: code}).then(({data: res}) => {
        if (res.code !== 0) {
          this.$alert(res.toast, this.$t('prompt.title'), {
            confirmButtonText: '重新登录',
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
