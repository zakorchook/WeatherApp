import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    createMenuButtonId,
    login,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('24 Test if user can see nearby activity', async t => {
    await login()

    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    const socialFeed = createMenuButtonId('SocialFeed')
    const nearby = idFromResourceId('com.gettipsi.tipsi.dev:id/feed_nearby_button')

    await driver
        .waitForVisible(socialFeed, 2000)
        .click(socialFeed)
        .waitForVisible(nearby, 2000)
        .click(nearby)

    const layout = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.ViewAnimator[1]/android.widget.FrameLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.FrameLayout[1]
    `)
    await driver.waitForVisible(layout, 20000)
    t.pass('User should see nearby activity')
})
