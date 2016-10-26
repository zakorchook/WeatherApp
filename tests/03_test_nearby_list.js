import test from 'tape-async'
import { last, unionWith, isEqual } from 'lodash'
import helper from './utils/helper'

const {
    driver,
    noThrow,
    isSorted,
    idFromXPath,
    idFromResourceId,
    findItemsInList,
    getChildText,
    getChildDesc,
    backToHome,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('03 Test if a user can see a list of locations', async (t) => {
    const homeNearbyButtonId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[1]
    `) // should be changed by accessibility label
    const nearbyListId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list')
    const nearbyListItemId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item')
    const nearbyListItemIconId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list_icon')
    const nearbyListItemNameId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item_name')
    const nearbyListItemDistanceId =
        idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item_distance')
    const nearbyListItemAvailabilityId =
        idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item_wine_list_availability')

    await backToHome()

    // Mock location
    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    await driver.click(homeNearbyButtonId)

    try {
        await driver.waitForVisible(nearbyListItemId, 2000)
    } catch (e) {
        await driver.back()
    }

    const items = await findItemsInList({
        listId: nearbyListId,
        retriveItems: async () => {
            const items = []
            const rawItems = await driver.elements(nearbyListItemId)

            while (rawItems.value.length) {
                const item = rawItems.value.shift()
                try {
                    const type = await getChildDesc(
                        item.ELEMENT,
                        nearbyListItemIconId
                    )
                    const name = await getChildText(
                        item.ELEMENT,
                        nearbyListItemNameId
                    )
                    const distance = await getChildText(
                        item.ELEMENT,
                        nearbyListItemDistanceId
                    )
                    const availability = await noThrow(
                        () => getChildText(
                            item.ELEMENT,
                            nearbyListItemAvailabilityId
                        )
                    )

                    items.push({
                        type,
                        name,
                        distance,
                        availability,
                    })
                } catch (error) {
                    // skip because item is not completely visible yet
                }
            }

            return items
        },
        shouldNextSwipe: async (prevItems, nextItems) => {
            if (prevItems.length !== nextItems.length) {
                return false
            }

            return isEqual(last(prevItems), last(nextItems))
        },
        mergeItems: (items, nextItems) => (
            unionWith(items, nextItems, isEqual)
        ),
        swipeSpeed: 500,
    })

    t.notEqual(items.length, 0, 'List of locations should not be empty')

    const checkDistanceСonsistency = (items) => {
        if (items.length <= 1) {
            return 1
        }
        return isSorted(
            items,
            (item) => parseInt(item.distance, 10)
        )
    }

    const stores = items.filter(
        (item) => item.type === 'store'
    )

    t.same(stores, items.slice(0, stores.length), 'Retails shown first')

    t.equal(
      checkDistanceСonsistency(stores), 1,
      'Retails shown starting from nearest to farthest'
    )

    const events = items.filter(
        (item) => item.type === 'event'
    )

    t.same(events, items.slice(
        stores.length,
        stores.length + events.length
    ), 'Events shown second')

    t.equal(
        checkDistanceСonsistency(events), 1,
        'Events shown starting from nearest to farthest'
    )

    const restaurants = items.filter(
        (item) => item.type === 'restaurant'
    )

    t.same(restaurants, items.slice(
        stores.length + events.length,
        stores.length + events.length + restaurants.length
    ), 'Restaurants shown third')

    t.equal(
        checkDistanceСonsistency(restaurants), 1,
        'Restaurants shown starting from nearest to farthest'
    )

    const storesWithAvailability = stores.filter(store => store.availability)

    t.equal(
        storesWithAvailability.length, 0,
        'Wine List Available/Request Wine List not shown for Retails'
    )
})
