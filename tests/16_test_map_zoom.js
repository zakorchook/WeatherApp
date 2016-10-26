import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromText,
    idFromXPath,
    idFromResourceId,
    doUntilVisible,
    doUntilNotVisible,
    backToHome,
    cache,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('16 Test if a user can zoom a map in and out', async (t) => {
    // Go to the Nearby list
    const homeNearbyButtonId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[1]
    `) // should be changed by resource label
    const nearbyListId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list')
    const nearbyListItemId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item')
    const progressId = idFromResourceId('com.gettipsi.tipsi.dev:id/progress')
    const mapButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/action_map')
    const mapId = idFromResourceId('com.gettipsi.tipsi.dev:id/map_view')

    // Mock location
    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    // Retrive stores from API
    const stores = await cache.getStores()
    const storeWithMap = stores.find(store => store.tiles.length)

    t.ok(storeWithMap, 'List of stores from API should contain store with map')

    await backToHome()

    await driver.click(homeNearbyButtonId)

    try {
        // Wait for loading Nearby list
        await driver.waitForVisible(nearbyListItemId, 5000)
    } catch (e) {
        await driver.back()
    }

    const storeItemId = idFromText(storeWithMap.name)

    await doUntilNotVisible(
        storeItemId,
        () => driver.swipeUp(nearbyListId, 200),
        10
    )

    // Click on current store
    await driver.click(storeItemId)

    // Wait for loading
    await doUntilVisible(
        progressId,
        () => ({})
    )

    const zoomContainerId = idFromResourceId('com.gettipsi.tipsi.dev:id/zoom_layout_1')
    const zoom1Id = idFromResourceId('com.gettipsi.tipsi.dev:id/zoom1')
    const zoom2Id = idFromResourceId('com.gettipsi.tipsi.dev:id/zoom2')
    const zoom3Id = idFromResourceId('com.gettipsi.tipsi.dev:id/zoom3')

    await driver
        .click(mapButtonId)
        .waitForVisible(mapId, 10000)
        .waitForVisible(zoomContainerId, 1000)

    t.pass('User shoud see zoom level buttons')

    async function getCurrentZoomLevel() {
        const levels = await Promise.all([
            driver.isSelected(zoom1Id),
            driver.isSelected(zoom2Id),
            driver.isSelected(zoom3Id),
        ])

        return levels.filter(level => level).length
    }

    let currentZoomLevel = await getCurrentZoomLevel()
    t.equal(currentZoomLevel, 1, 'Initial zoom level should be 1')

    await driver.click(zoom2Id)
    currentZoomLevel = await getCurrentZoomLevel()
    t.equal(currentZoomLevel, 2, 'User should be able to set zoom level to 2')

    await driver.click(zoom3Id)
    currentZoomLevel = await getCurrentZoomLevel()
    t.equal(currentZoomLevel, 3, 'User should be able to set zoom level to 3')

    await driver.click(zoom1Id)
    currentZoomLevel = await getCurrentZoomLevel()
    t.equal(currentZoomLevel, 1, 'User should be able to set zoom level to 1')
})
