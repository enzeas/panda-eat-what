//index.js
const app = getApp()

var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
var qqmapsdk

function shuffle(arr) {
   arr.sort(function () {
      return Math.random() - 0.5;
   });
}

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    hasLocation: false,
    latitude: 0,
    longitude: 0,
    foodList: ['中餐厅', '日本料理', '西餐', '烧烤', '火锅', '海鲜', '素食', '自助餐', '小吃快餐', ],
    foodTag: '美食',
    foodImage: '/images/1.png',
    foodText: '看看今天吃什么！',
    searchImage: '/images/2.png',
    searchText: '看看附近有什么！',
    searchIndex: 0,
    searchList: []
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    qqmapsdk = new QQMapWX({
      key: 'BEBBZ-SCXKI-FTSGV-5CPBK-KDKFO-N7FEC'
    })
  },
  // onShow: function() {
  //   // 调用接口
  //   qqmapsdk.search({
  //     keyword: '中餐厅',
  //     page_size: 20,
  //     success: function(res) {
  //       console.log(res);
  //     },
  //     fail: function(res) {
  //       console.log(res);
  //     },
  //     complete: function(res) {
  //       console.log(res);
  //     }
  //   });
  // },
  getFoodClass: function() {
    var foodList = this.data.foodList
    var index = Math.floor(foodList.length * Math.random())
    var foodTag = foodList[index]
    var foodText = foodTag + '可以吗？'
    var searchText = '看看附近有什么' + foodTag +'！'
    this.setData({
      foodText: foodText,
      foodTag: foodTag,
      searchText: searchText
    })
  },
  getFoodNearby: function() {
    console.log(this.data.foodTag)
    var that = this
    qqmapsdk.search({
      keyword: this.data.foodTag,
      page_size: 20,
      success: function (res) {
        console.log(res)
        var list = res.data
        shuffle(list)
        console.log(list)
        that.setData({
          searchList: list
        })
      },
      fail: function (res) {
        //console.log(res)
      },
      complete: function (res) {
        //console.log(res)
      }
    })
  },
  getLocation: function() {
    var that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        that.setData({
          hasLocation: true,
          latitude: res.latitude,
          longitude: res.longitude
        })

        function formatLocation() {
          var locationText = "经度：" + res.longitude + "纬度：" + res.latitude
          that.setData({
            locationText: locationText
          })
        }
        formatLocation()
        console.log(res)
      }
    })
  }
})