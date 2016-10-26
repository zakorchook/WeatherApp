import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    getChildText,
    getChildDesc,
    backToHome,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('05 Test if location filter works', async (t) => {
    const homeNearbyButtonId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[1]
    `) // should be changed by accessibility label
    const nearbyListItemId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.LinearLayout
    `) // should be changed by accessibility label
    const nearbyListItemIconId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list_icon')
    const nearbyListItemNameId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item_name')
    const filtersButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list_search')
    const filterRestaurantsId = idFromXPath(`//
        android.widget.FrameLayout[1]/
        android.widget.ListView[1]/
        android.widget.TextView[2]
    `)
    const filterRetailsId = idFromXPath(`//
        android.widget.FrameLayout[1]/
        android.widget.ListView[1]/
        android.widget.TextView[3]
    `)
    const filterEventsId = idFromXPath(`//
        android.widget.FrameLayout[1]/
        android.widget.ListView[1]/
        android.widget.TextView[4]
    `)

    await backToHome()

    // Mock location
    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    await driver.click(homeNearbyButtonId)

    try {
        await driver.waitForVisible(nearbyListItemId, 3000)
    } catch (e) {
        await driver.back()
    }

    let listItems = []
    const findItemsTypes = async () => {
        const items = []
        let rawItems

        try {
            rawItems = await driver.elements(nearbyListItemId)
        } catch (e) {
            return items
        }

        for (const item of rawItems.value) {
            try {
                const type = await getChildDesc(item.ELEMENT, nearbyListItemIconId)
                const name = await getChildText(item.ELEMENT, nearbyListItemNameId)
                items.push({type, name})
            } catch (e) {
                // Do nothing. Element not full visible
            }
        }

        return items
    }

    // Restaurants
    await driver
        .click(filtersButtonId)
        .click(filterRestaurantsId)

    listItems = await findItemsTypes()
    const isAllRestaurants = listItems.every(item => item.type === 'restaurant')
    t.ok(isAllRestaurants, 'Filter set to Restaurants: list of restaurants depicted')

    // Retailers
    await driver
        .click(filtersButtonId)
        .click(filterRetailsId)

    listItems = await findItemsTypes()

    const isAllRetails = listItems.every(item => item.type === 'store')
    t.ok(isAllRetails, 'Filter set to Retailers/Wine Shops: list of wine shops depicted')

    // Events
    await driver
        .click(filtersButtonId)
        .click(filterEventsId)

    listItems = await findItemsTypes()
    const isAllEvents = listItems.every(item => item.type === 'event')
    t.ok(isAllEvents, 'Filter set to Events: list of events depicted')
})
