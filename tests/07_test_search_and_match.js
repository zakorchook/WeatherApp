import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromText,
    idFromXPath,
    idFromResourceId,
    doUntilVisible,
    getChildText,
    login,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('07 Test if Match&Search feature works', async (t) => {
    const homeNearbyButtonId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[1]
    `) // should be changed by accessibility label
    const nearbyListId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list')
    const bottlesItemId = idFromText('Bottles and Cases')
    const matchButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/retail_match')
    const firstItemInList = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.support.v4.view.ViewPager[1]/
        android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.FrameLayout[1]`
    )
    const loader = idFromResourceId('com.gettipsi.tipsi.dev:id/progress')
    const similarItemId = idFromResourceId('com.gettipsi.tipsi.dev:id/similar_layout')
    const similarItemName = idFromResourceId('com.gettipsi.tipsi.dev:id/name')

    await login()

    // Mock location
    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    await driver.click(homeNearbyButtonId)

    try {
        await driver.waitForVisible(nearbyListId, 2000)
    } catch (e) {
        // We see helpers
        await driver.back()
    }

    t.pass('User should see nearby list')

    const sequence = {
        storeName: 'Bottle and Cases',
        storeItemId: bottlesItemId,
        sequenceName: 'Bottles&Cases—>Match&Search—>Match—>Select Wine->Similar Wines List',
        buttons: [
            matchButtonId,
            matchButtonId,
            firstItemInList,
        ],
    }

    await driver
        .waitForVisible(sequence.storeItemId, 5000)
        .click(sequence.storeItemId)
    t.pass('Loading wines list...')

    await doUntilVisible(loader, () => ({}))

    for (const buttonId of sequence.buttons) {
        await driver
            .waitForVisible(buttonId, 10000)
            .click(buttonId)
    }

    t.pass('Loading similar wines list...')
    await driver.waitForVisible(similarItemId, 15000)

    const items = []
    const rawItems = await driver.elements(similarItemId)
    for (const wineItem of rawItems.value) {
        try {
            const name = await getChildText(wineItem.ELEMENT, similarItemName)
            items.push(name)
        } catch (e) {
            // Do nothing. Element not full visible
        }
    }

    t.ok(Boolean(items.length), 'User should see a list of similar wines')
})
