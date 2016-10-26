import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromText,
    idFromXPath,
    idFromResourceId,
    doUntilVisible,
    doUntilNotVisible,
    login,
    logout,
    cache,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('06 Test if an authorized/unauthorized user view store map if it exists', async (t) => {
    // Go to the Nearby list
    const homeNearbyButtonId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[1]
    `) // should be changed by resource label
    const tipTitleId = idFromResourceId('com.gettipsi.tipsi.dev:id/intro_title')
    const nearbyListId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list')
    const nearbyListItemId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item')
    const progressId = idFromResourceId('com.gettipsi.tipsi.dev:id/progress')
    const discoverButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/retail_discover')
    const winesButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/discover_wines')
    const nextButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/btn_next')
    const budgetButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/retail_filter_budget')
    const mapButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/action_map')
    const mapId = idFromResourceId('com.gettipsi.tipsi.dev:id/map_view')
    const showWinesButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/show_wines')
    const storeMapButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/store_map')

    async function testStoreMap(storeName, additionSteps, storeHasMap) {
        const sequence = additionSteps ?
            'Discover—>Next—>Budget—>Next—>Next—>Show Wines—>Store Map' :
            'Discover—>Next—>Budget—>Next—>Next—>Map'

        await driver.swipeDown(nearbyListId, 1000)

        const storeItemId = idFromText(storeName)

        await doUntilNotVisible(
            storeItemId,
            () => driver.swipeUp(nearbyListId, 200),
            10
        )

        // Click on current store
        await driver.click(storeItemId)

        // Wait for loading
        await doUntilVisible(progressId, () => ({}))

        await driver.waitForVisible(discoverButtonId, 1000)
        await driver.click(discoverButtonId)

        try {
            await driver.waitForVisible(winesButtonId, 1000)
            await driver.click(winesButtonId)
        } catch (error) {
            // Do nothing
        }

        await driver.waitForVisible(nextButtonId, 1000)
        await driver.click(nextButtonId)

        await driver.waitForVisible(budgetButtonId, 1000)
        await driver.click(budgetButtonId)

        await driver.waitForVisible(nextButtonId, 1000)
        await driver.click(nextButtonId)

        await driver.waitForVisible(nextButtonId, 1000)
        await driver.click(nextButtonId)

        if (additionSteps && !storeHasMap) {
            await driver.waitForVisible(showWinesButtonId, 1000)
            await driver.click(showWinesButtonId)
        } else if (additionSteps && storeHasMap) {
            await driver.waitForVisible(showWinesButtonId, 1000)
            await driver.click(showWinesButtonId)

            await driver.waitForVisible(storeMapButtonId, 1000)
            await driver.click(storeMapButtonId)
        } else {
            await driver.waitForVisible(mapButtonId, 1000)
            await driver.click(mapButtonId)
        }

        if (storeHasMap) {
            try {
                await driver.waitForVisible(mapId, 10000)
                t.pass(`(${storeName}) User should see a store map: ${sequence}`)
            } catch (error) {
                t.fail(`(${storeName}) User did not see a store map: ${sequence}, ${error}`)
            }
        } else {
            const idForWait = additionSteps ? storeMapButtonId : mapId

            try {
                await driver.waitForVisible(idForWait, 10000)
                t.fail(`(${storeName}) User see a store map: ${sequence}`)
            } catch (error) {
                t.pass(`(${storeName}) User should not see a store map: ${sequence}`)
            }
        }

        // Go to nearby list
        await doUntilNotVisible(
            nearbyListId,
            () => driver.back()
        )
    }

    // Mock location
    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    // Retrive stores from API
    const stores = await cache.getStores()

    t.notEqual(stores.length, 0, 'List of stores from API should not be empty')

    t.comment('06_01 Test if an authorized user can view store map if it exists')

    await login()

    await driver.click(homeNearbyButtonId)
    // Skip all tips
    await doUntilVisible(
        tipTitleId,
        () => driver.back()
    )
    // Wait for loading Nearby list
    await driver.waitForVisible(nearbyListItemId, 5000)

    for (const store of stores) {
        const storeName = store.name
        const storeHasMap = !!store.tiles.length

        await testStoreMap(storeName, true, storeHasMap)
        await testStoreMap(storeName, false, storeHasMap)
    }

    t.comment('06_02 Test if an unauthorized user can view store map if it exists')

    await logout()

    await driver.click(homeNearbyButtonId)
    // Skip all tips
    await doUntilVisible(
        tipTitleId,
        () => driver.back()
    )
    // Wait for loading Nearby list
    await driver.waitForVisible(nearbyListItemId, 5000)

    for (const store of stores) {
        const storeName = store.name
        const storeHasMap = !!store.tiles.length

        await testStoreMap(storeName, true, storeHasMap)
        await testStoreMap(storeName, false, storeHasMap)
    }
})
