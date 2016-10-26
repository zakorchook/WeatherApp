import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    createMenuButtonId,
    doUntilVisible,
    login,
    swipe,
    getChildText,
    skywalker,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('29 Test if a user can see wine details from the map', async t => {
    await login()

    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    const nearby = createMenuButtonId('Nearby')

    await driver
        .waitForVisible(nearby, 2000)
        .click(nearby)

    const parent = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]
    `)
    const getNearbyListItemId = (idx) => (
        idFromXPath(`//
            android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
            android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
            android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
            android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]/
            android.widget.LinearLayout${idx ? `[${idx}]` : ''}
        `)
    )
    const child = getNearbyListItemId()

    const selectLocations = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list_search')
    const shops = idFromXPath(`//
        android.widget.FrameLayout[1]/android.widget.ListView[1]/
        android.widget.TextView[3]
    `)
    await driver
        .waitForVisible(selectLocations, 5000)
        .catch(() => driver.back())
        .click(selectLocations)
        .waitForVisible(shops, 5000)
        .click(shops)
        .waitForVisible(child, 5000)

    async function isEndOfList(parentItemId) {
        let value;
        try {
            value = await getChildText(
                parentItemId,
                idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item_name')
            )
        } catch (e) {
            // Do nothing
        }

        return value
    }

    const stores = await skywalker(
        parent,
        child,
        async id => {
            const childName = await isEndOfList(id)
            return {id, childName}
        },
        item => item.childName
    )

    const xavierStoreId = stores.find(item => item.childName === 'Xavier Wine Company').id
    await driver.elementIdClick(xavierStoreId)

    const progressId = idFromResourceId('com.gettipsi.tipsi.dev:id/progress')
    await doUntilVisible(progressId, () => ({}))

    const mapButton = idFromResourceId('com.gettipsi.tipsi.dev:id/action_map')

    await driver.waitForVisible(mapButton, 2000).click(mapButton)
    const mapSelector = idFromResourceId('com.gettipsi.tipsi.dev:id/map_view')

    const zoom = idFromResourceId('com.gettipsi.tipsi.dev:id/zoom_bottle')
    await driver
        .waitForVisible(mapSelector, 10000)
        .waitForVisible(zoom, 5000)
        .click(zoom)

    for (const x of [1, 2, 3, 4, 5, 6, 7]) {
        await swipe({x1: 100, y1: 1100, x2: 100, y2: 600})
        t.pass(`Swipe map to up ${x}`)
        await driver.pause(5000)
    }

    await driver
        .touchPerform([{
            action: 'tap',
            options: {
                x: 135,
                y: 500,
            },
        }])
        .pause(2000)
    t.pass('Tap')

    const wineNameId = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_detail_name')
    await driver.waitForVisible(wineNameId, 5000)
    const wineName = await driver.getText(wineNameId)
    t.pass(`User should see wine details of ${wineName}`)

    const locateId = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_detail_locate_button')
    const retailItemId = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_locate_layout')
    await driver
        .waitForVisible(locateId, 2000)
        .click(locateId)
        .waitForVisible(retailItemId, 5000)

    const availableStores = await driver.elements(retailItemId)
    t.ok(availableStores.value.length >= 1, 'There is should be list of retail stores')
})
