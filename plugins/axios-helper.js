import Vue from 'vue'
import MD5 from 'js-md5'
import axios from 'axios'
//已经处理特殊的参数，方法是没错的
const customConfig = {
  BaseUrl: 'http://192.168.1.185:9034/api/v1.0/',
  UUID: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  PublicKey: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  Environment: 'Web',
  TimeOut: 90000
}
//自定义判断元素类型
function toType(obj) {
  return {}.toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase()
}

//过滤的json
function filterJsonAll(p) {
  if (toType(p) != 'object') {
    return ''
  }
  //去除空内容
  for (let key in p) {
    if (p[key] === null) {
      delete p[key]
    }
    if (toType(p[key]) === 'string') {
      p[key] = p[key].trim()
    }
  }
  return p
}

function apiAxios(method, url, dataJson) {
  let nowTime = Math.round(new Date().getTime() / 1000)
  nowTime = JSON.stringify(nowTime)
  //过滤参数
  if (dataJson) {
    dataJson.PublicKey = customConfig.PublicKey
    dataJson.Platform = customConfig.Environment
    dataJson.Timestamp = nowTime
    dataJson = filterJsonAll(dataJson)
  } else {
    dataJson = {
      Platform: customConfig.Environment
    }
  }
  //排序
  let mdsvalues = ''
  let jsonUrlStr = ''
  if (dataJson) {
    let dataJsonLast = {}
    var keyList = []
    for (let itemed in dataJson) {
      keyList.push(itemed)
    }
    keyList.sort()
    keyList.forEach(key => {
      dataJsonLast[key] = dataJson[key]
    })

    for (let keyed in dataJsonLast) {
      if (typeof dataJsonLast[keyed] != 'function') {
        jsonUrlStr += '&' + keyed + '=' + dataJsonLast[keyed]
      }
    }
    jsonUrlStr = jsonUrlStr.substring(1)
    mdsvalues = MD5(jsonUrlStr)
  } else {
    mdsvalues = MD5(dataJson)
  }

  delete dataJson['PublicKey']
  delete dataJson['Timestamp']
  delete dataJson['Platform']
  const axiosConfig = {
    //baseURL: customConfig.BaseUrl,
    timeout: customConfig.TimeOut,
    headers: {
      'Content-Type': 'application/json',
      Timestamp: nowTime,
      Sign: mdsvalues,
      Platform: customConfig.Environment
    },
    responseType: 'json'
  }

  if (url.toLowerCase() === 'aaa/addAAA') {
    axiosConfig.headers.IdVirtify = dataJson.IdVirtify
    delete dataJson['IdVirtify']
  }

  if (method === 'GET') {
    axiosConfig.params = dataJson
    return new Promise((resolve, reject) => {
      axios
        .get(url, axiosConfig)
        .then(res => {
          if (res.status == 200 && res.data) {
            console.log(
              '%c GET-请求成功：' + JSON.stringify(res),
              'color:green;'
            )
            resolve(res.data)
          } else {
            console.log('%c GET-请求失败：' + JSON.stringify(res), 'color:red;')
            reject(res.data)
          }
        })
        .catch(err => {
          console.log('%c GET-请求错误：' + JSON.stringify(err), 'color:red;')
          resolve(-1)
        })
    })
  } else if (method === 'POST') {
    return new Promise((resolve, reject) => {
      axios
        .post(url, dataJson, axiosConfig)
        .then(res => {
          if (res.status == 200 && res.data) {
            console.log(
              '%c POST-请求成功：' + JSON.stringify(res),
              'color:green;'
            )
            resolve(res.data)
          } else {
            console.log(
              '%c POST-请求失败：' + JSON.stringify(res),
              'color:red;'
            )
            reject(res.data)
          }
        })
        .catch(err => {
          console.log('%c POST-请求错误：' + JSON.stringify(err), 'color:red;')
          resolve(-1)
        })
    })
  }
}
const xhrhelper = {
  /**
   * get请求
   * @param {string} url 请求相对地址
   * @param {object} dataJson 请求内容(json)
   */
  get: (url, dataJson) => {
    if (url && url.length > 0) {
      url = '/api/' + url
    }
    return apiAxios('GET', url, dataJson)
  },
  /**
   * get请求
   * @param {string} url 请求相对地址
   * @param {object} dataJson 请求内容(json)
   */
  post: (url, dataJson) => {
    if (url && url.length > 0) {
      url = '/api/' + url
    }
    return apiAxios('POST', url, dataJson)
  }
}
Vue.prototype.$get = xhrhelper.get
Vue.prototype.$post = xhrhelper.post
