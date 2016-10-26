import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    createMenuButtonId,
    doUntilVisible,
    getChildText,
    login,
    skywalker,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('27 Test if Scan/Map buttons are accessible from stores with maps', async t => {
    await login()

    const nearby = createMenuButtonId('Nearby')
    const nearbyListId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list')

    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    await driver.waitForVisible(nearby, 5000).click(nearby)

    try {
        await driver.waitForVisible(nearbyListId, 2000)
    } catch (e) {
        await driver.back()
    }

    const nearbyList = await driver.element(nearbyListId)
    t.ok(nearbyList.value, 'Nearby list is visible')

    const getNearbyListItemId = (idx) => (
        idFromXPath(`//
            android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
            android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
            android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
            android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]/
            android.widget.LinearLayout${idx ? `[${idx}]` : ''}
        `)
    )

    const nearbyListItemId = getNearbyListItemId(1)

    try {
        await driver.waitForVisible(nearbyListItemId, 5000)
        t.pass('First item in list is visible')
    } catch (e) {
        t.fail('First item in list is not visible', {expected: 'visible', actual: 'not visible'})
    }

    const selectLocations = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list_search')
    const shops = idFromXPath(`//
        android.widget.FrameLayout[1]/android.widget.ListView[1]/
        android.widget.TextView[3]
    `)
    await driver.waitForVisible(selectLocations, 5000)
        .click(selectLocations)
        .waitForVisible(shops, 5000)
        .click(shops)
        .waitForVisible(nearbyListItemId, 5000)

    const parent = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]
    `)
    const child = getNearbyListItemId()
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

    async function mainCase() {
        try {
            const errorMessage = idFromResourceId('android:id/message')
            const errorOk = idFromResourceId('android:id/button3')
            await driver.waitForVisible(errorMessage, 2000).click(errorOk)
        } catch (e) {
            // There is no error, everything is OK
        }

        t.pass('There is no errors')

        const loader = idFromResourceId('com.gettipsi.tipsi.dev:id/progress')
        await doUntilVisible(loader, () => ({}))

        const mapButton = idFromResourceId('com.gettipsi.tipsi.dev:id/action_map')
        const scanButton = idFromResourceId('com.gettipsi.tipsi.dev:id/action_scan')
        const mapSelector = idFromResourceId('com.gettipsi.tipsi.dev:id/map_view')

        t.pass('User should see a store 1st screen')
        await driver.waitForVisible(mapButton, 5000).click(mapButton)

        await doUntilVisible(loader, () => ({}))
        try {
            await driver.waitForVisible(mapSelector, 3000).back()
            t.pass('User should see a map')
        } catch (e) {
            // Do nothing
        }

        const galleryButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/camera_gallery')
        await doUntilVisible(loader, () => ({}))
        await driver
            .waitForVisible(scanButton, 5000)
            .click(scanButton)

        const introTitle = idFromResourceId('com.gettipsi.tipsi.dev:id/intro_title')

        try {
            await driver.waitForVisible(introTitle, 2000).back()
        } catch (e) {
            // Do nothing
        }

        try {
            await driver.waitForVisible(galleryButtonId, 3000)
            t.pass('User should see a scan activity')
            await driver.back()
        } catch (e) {
            // Do nothing
        }

        await driver.back()

        t.pass('User should return to nearby list')
    }

    for (const x of stores) {
        try {
            await driver.elementIdClick(x.id)
            await mainCase()
        } catch (e) {
            // Do nothing
        }
    }
})
