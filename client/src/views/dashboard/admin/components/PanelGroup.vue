<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            User Info
          </div>
          <div>{{ userInfo.name }}</div>
          <div>{{ userInfo.email }}</div>
          <!-- <count-to :start-val="0" :end-val="loginCount" :duration="2600" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Login counts
          </div>
          <div>{{ loginCount }}</div>
          <!-- <count-to :start-val="0" :end-val="loginCount" :duration="2600" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Last Login
          </div>
          <div>{{ lastLoginDate }}</div>
          <!-- <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="shopping" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Signup Date
          </div>
          <div>{{ signupDate }}</div>
          <!-- <count-to :start-val="0" :end-val="13600" :duration="3600" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="message" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Total User
          </div>
          <div>{{ total }}</div>
          <!-- <count-to :start-val="0" :end-val="0" :duration="3000" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="message" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            7 days average
          </div>
          <div>{{ avgCount }}</div>
          <!-- <count-to :start-val="0" :end-val="0" :duration="3000" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="message" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Today Active User
          </div>
          <div>{{ activeCount }}</div>
          <!-- <count-to :start-val="0" :end-val="0" :duration="3000" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <el-row>
        <el-button style="padding: 8px 10px;" size="small" type="primary" @click="goReset">
          <svg-icon icon-class="password" />
          reset password
        </el-button>
      </el-row>

      <el-row style="margin-top:20px ;">
        <el-input placeholder="update name" v-model="usernameVal">
          <el-button slot="append" type="primary" @click="updateName">update name</el-button>
        </el-input>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { userStatistics, allStatistics, updateUser } from '@/api/user'
import store from '@/store'
import { Message } from 'element-ui'

export default {
  data() {
    return {
      lastLoginDate: "",
      loginCount: 0,
      signupDate: "",
      total: 0,
      avgCount: 0,
      activeCount: 0,
      userInfo: this.$store.state.user.userInfo,
      usernameVal: this.$store.state.user.userInfo.name
    }
  },
  components: {
    CountTo
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    },
    fetchData() {
      userStatistics().then(res => {
        console.log(res);
        const { lastLoginDate, loginCount, signupDate } = res.data
        if (res.code === 0) {
          this.lastLoginDate = lastLoginDate
          this.loginCount = loginCount
          this.signupDate = signupDate
        }
      })

      allStatistics().then(res => {
        console.log(res);
        if (res.code === 0) {
          const { total, activeCount, avgCount } = res.data

          this.total = total
          this.activeCount = activeCount
          this.avgCount = avgCount
        }
      })
    },
    goReset() {
      this.$router.push({ path: '/reset' })
    },
    updateName() {
      if (this.usernameVal.trim() === '') {
        Message.error('username should not be empty')
        return
      }
      updateUser({
        id: this.userInfo.id,
        name: this.usernameVal
      }).then(res => {
        console.log(res);
        if (res.code === 0) {
          this.userInfo.name = this.usernameVal
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
