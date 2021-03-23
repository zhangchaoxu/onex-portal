let api = 'http://127.0.0.1:18181/onex-boot-api'

function getSiteInfo () {
  $.ajax({
    type: 'GET',
    url: api + '/cms/public/getSiteInfoByCode?code=default',
    success (json) {
      // 设置标题和keywords
      $('title').html(json.data.title)
      $("meta[name='keywords']").attr('content', json.data.keywords)
      $("meta[name='description']").attr('content', json.data.descr)
    },
    error (err) {
      console.log(err)
    }
  })
}
