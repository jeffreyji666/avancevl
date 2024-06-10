import request from '@/utils/request'

export function login(data) {
  return request({
    // url: '/vue-element-admin/user/login',
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function userStatistics() {
  return request({
    url: '/userStatistics',
    method: 'post'
  })
}

export function allStatistics() {
  return request({
    url: '/statistics',
    method: 'post'
  })
}

export function googleLogin (obj) {
  return request({
    url: '/auth/google',
    method: 'get',
    params: obj
  })
}


export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data
  })
}
export function reset(data) {
  return request({
    url: '/reset',
    method: 'post',
    data
  })
}
export function updateUser(data) {
  return request({
    url: `/users/${data.id}`,
    method: 'put',
    data
  })
}