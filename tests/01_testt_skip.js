import test from 'tape-async'
import helper from './utils/helper'

const {
  driver,
  idFromResourceId,
  idFromText
} = helper

test('01 Test click menu settings', async(t) => {

  const menuId = idFromResourceId(
    'com.zakorchook.weatherapp:id/action_settings')

  await driver.waitForVisible(menuId, 1000)

  const keyArr = ['Киев', 'Харьков', 'Запорожье'];

  for (let item of keyArr) {

    await driver.click(menuId)

    let sityId = idFromText(item)

    await driver.waitForVisible(sityId, 1000)
    await driver.click(sityId)

    t.pass('test for ' + item)
  }
});
