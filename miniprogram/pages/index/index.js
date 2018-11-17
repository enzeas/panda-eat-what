//index.js
const app = getApp()

var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
var qqmapsdk

function shuffle(arr) {
  arr.sort(function() {
    return Math.random() - 0.5;
  });
}

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    hasLocation: false,
    latitude: 23.099994,
    longitude: 113.324520,
    foodList: ['中餐厅', '日本料理', '西餐', '烧烤', '火锅', '海鲜', '素食', '自助餐', '小吃快餐', ],
    foodTag: '美食',
    foodImage: '/images/1.png',
    foodText: '看看今天吃什么！',
    searchImage: '/images/2.png',
    searchText: '看看附近有什么！',
    pandaImage: '/images/3.png',
    pandaText: '熊猫应该怎么来？',
    searchIndex: 0,
    searchList: [],
    polyline: [],
    markers: [{
      iconPath: "/images/start.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 40,
      height: 40
    }, {
      iconPath: "/images/end.png",
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 40,
      height: 40
    }, {
      iconPath: "/images/locate.png",
      id: 2,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 40,
      height: 40
    }]
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
  onShow: function() {
    var that = this
    console.log(this)
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        var markers = that.data.markers
        markers[0].latitude = res.latitude
        markers[0].longitude = res.longitude
        that.setData({
          hasLocation: true,
          latitude: res.latitude,
          longitude: res.longitude,
          markers: markers
        })
      }
    })
  },
  onReady: function() {
    this.mapCtx = wx.createMapContext('map')
  },
  getFoodClass: function() {
    var foodList = this.data.foodList
    var index = Math.floor(foodList.length * Math.random())
    var foodTag = foodList[index]
    var foodText = foodTag + '可以吗？'
    var searchText = '看看附近有什么' + foodTag + '!'
    //var pandaText = '熊猫周围有什么' + foodTag + '？'
    this.setData({
      foodText: foodText,
      foodTag: foodTag,
      //pandaText: pandaText
      searchText: searchText
    })
    this.getFoodNearby()
  },
  getFoodNearby: function() {
    var that = this
    qqmapsdk.search({
      keyword: this.data.foodTag,
      page_size: 20,
      success: function(res) {
        var list = res.data
        shuffle(list)
        var markers = that.data.markers
        markers[1].latitude = list[0].location.lat
        markers[1].longitude = list[0].location.lng
        that.setData({
          searchList: list,
          markers: markers
        })
        that.calPath(markers[0], markers[1])
      }
    })
  },
  pandaCome: function() {
    var markers = this.data.markers
    this.calPath(markers[2], markers[1])
  },
  pandaFoodNearby: function() {
    var that = this
    var loc = this.data.markers[2].latitude + ',' + this.data.markers[2].longitude
    qqmapsdk.search({
      keyword: this.data.foodTag,
      location: loc,
      page_size: 20,
      success: function(res) {
        var list = res.data
        shuffle(list)
        var markers = that.data.markers
        markers[1].latitude = list[0].location.lat
        markers[1].longitude = list[0].location.lng
        that.setData({
          searchList: list,
          markers: markers
        })
        that.calPath(markers[2], markers[1])
      }
    })
  },
  calPath: function(start, end) {
    var that = this
    var fromInfo = start.latitude + ',' + start.longitude
    var toInfo = end.latitude + ',' + end.longitude
    var url = 'https://apis.map.qq.com/ws/direction/v1/walking/?from=' + fromInfo + '&to=' + toInfo + '&key=BEBBZ-SCXKI-FTSGV-5CPBK-KDKFO-N7FEC'
    wx.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        var ret = res.data
        if (ret.status != 0) return
        var coors = ret.result.routes[0].polyline,
          pl = []
        var kr = 1000000
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr
        }
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        that.setData({
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 2
          }]
        })
      }
    })
  },
  changeList: function(event) {
    var that = this
    var index = event.detail.current
    var markers = this.data.markers
    markers[1].latitude = this.data.searchList[index].location.lat
    markers[1].longitude = this.data.searchList[index].location.lng
    this.setData({
      markers: markers
    })
    this.calPath(markers[0], markers[1])
  },
  getCenterLocation: function() {
    var that = this
    this.mapCtx.getCenterLocation({
      success: function(res) {
        var markers = that.data.markers
        markers[2].latitude = res.latitude
        markers[2].longitude = res.longitude
        that.setData({
          markers: markers
        })
      }
    })
  },
  regionchange(e) {
    if (e.type == "end") {
      this.getCenterLocation()
    }

  },
  markertap(e) {
    //console.log(e)
  },
  controltap(e) {
    //console.log(e)
  }
})