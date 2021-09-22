const config = require('./config')
const db = require('./services/db')
const { includes, find } = require('lodash/fp')

const run = async() => {

  await db.connect({
    host: config.db.host,
    port: config.db.port,
    name: config.db.name,
    user: config.db.user,
    pass: config.db.pass,
  })


  const locations = await db.query('select * from m_location order by id')

  // const provinces = []
  // for (const l of locations) {
  //   const p = l.province
  //   if (!includes(p)(provinces))
  //     provinces.push(p)
  // }
  // for (const pi in provinces) {
  //   const code = 10000 * (+pi + 1)
  //   const sql = `update m_location set province_code = ${code} where province = '${provinces[pi]}'`
  //   await db.query(sql)
  // }


  // const province_amphoe = []
  // for (const l of locations) {
  //   const p = l.province
  //   const a = l.amphoe

  //   const isExist = find(pa => {
  //     return p === pa.p && a === pa.a
  //   })(province_amphoe)

  //   if (isExist) continue

  //   province_amphoe.push({
  //     p: p,
  //     a: a
  //   })
  // }
  // for (const pai in province_amphoe) {
  //   const code = 10000 * (+pai + 1)
  //   const sql = `update m_location set amphoe_code = ${code} where province = '${province_amphoe[pai].p}' and amphoe = '${province_amphoe[pai].a}'`
  //   console.log(sql)
  //   await db.query(sql)
  // }

  const district = []
  for (const l of locations) {
    const p = l.province
    const a = l.amphoe
    const d = l.district

    const isExist = find(dd => {
      return p === dd.p && a === dd.a && d === dd.d
    })(district)

    if (isExist) continue

    district.push({
      p: p,
      a: a,
      d: d
    })
  }

  for (const ddi in district) {
    const code = 10000 * (+ddi + 1)
    const sql = `update m_location set district_code = ${code} where province = '${district[ddi].p}' and amphoe = '${district[ddi].a}' and district = '${district[ddi].d}'`
    console.log(sql)
    await db.query(sql)
  }

}


run()
