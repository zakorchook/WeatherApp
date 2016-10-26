import test from 'tape-async'
import { unionWith, isEqual } from 'lodash'
import helper from './utils/helper'

const {
    driver,
    idFromText,
    idFromResourceId,
    createMenuButtonId,
    findItemsInList,
    getChildText,
    getChildDesc,
    backToHome,
} = helper

const {
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
} = process.env

test('28 Test if the list is changed for different locations', async (t) => {
    await backToHome()

    // Mock location
    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    const homeNearbyButtonId = createMenuButtonId('Nearby')
    const nearbyListId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list')
    const nearbyListItemId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item')
    const nearbyListItemIconId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list_icon')
    const nearbyListItemNameId = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item_name')
    const nearbyListItemDistanceId =
        idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_item_distance')
    const changeLocationButtonId =
        idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list_change_location')
    const selectLocationButtonId = idFromResourceId('android:id/text1')
    const confirmLocationButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/menu_done')

    await driver
        .click(homeNearbyButtonId)
        .waitForVisible(nearbyListId, 2000)
        .catch(() => driver.back())
        .waitForVisible(nearbyListId, 2000)

    async function getItemsInfoForLocation(location) {
        const locationId = idFromText(location)

        await driver
            .waitForVisible(nearbyListId, 2000)
            .click(changeLocationButtonId)
            .waitForVisible(selectLocationButtonId, 2000)
            .click(selectLocationButtonId)
            .waitForVisible(locationId, 2000)
            .click(locationId)
            .waitForVisible(confirmLocationButtonId, 2000)
            .click(confirmLocationButtonId)
            .swipeDown(nearbyListId, 10000) // Swipe to head of list

        async function pushItemsUntil(allowItem, mapItem, allowNext) {
            return findItemsInList({
                listId: nearbyListId,
                retriveItems: async () => {
                    const items = []
                    const { value: rawItems } = await driver.elements(nearbyListItemId)
                    for (const rawItem of rawItems) {
                        try {
                            const type = await getChildDesc(
                                rawItem.ELEMENT,
                                nearbyListItemIconId
                            )
                            const name = await getChildText(
                                rawItem.ELEMENT,
                                nearbyListItemNameId
                            )
                            const distance = await getChildText(
                                rawItem.ELEMENT,
                                nearbyListItemDistanceId
                            )
                            const item = { type, name, distance }
                            if (allowItem(item)) {
                                items.push(mapItem(item))
                            }
                        } catch (error) {
                            // skip because item is not completely visible yet
                        }
                    }
                    return items
                },
                shouldNextSwipe: (prevItems, nextItems, items) => (
                    allowNext(items)
                ),
                mergeItems: (items, nextItems) => (
                    unionWith(items, nextItems, isEqual)
                ),
                swipeSpeed: 500,
            })
        }

        const storeDistances = await pushItemsUntil(
            (item) => item.type === 'store',
            (item) => item.distance,
            (items) => items.length > 2
        )

        const restaurantNames = await pushItemsUntil(
            (item) => item.type === 'restaurant',
            (item) => item.name,
            (items) => items.length > 4
        )

        return {
            storeDistances,
            restaurantNames,
        }
    }

    const washingtonItemsInfo = await getItemsInfoForLocation('Washington, DC')
    const chicagoItemsInfo = await getItemsInfoForLocation('Chicago')

    t.notSame(
        washingtonItemsInfo.storeDistances,
        chicagoItemsInfo.storeDistances,
        'Distance to the retails is different for Washingon, DC and Chicago'
    )

    t.notSame(
        washingtonItemsInfo.restaurantNames,
        chicagoItemsInfo.restaurantNames,
        'List of restaurants is different for Washingon, DC and Chicago'
    )
})
