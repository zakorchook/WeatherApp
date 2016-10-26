import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    getChildText,
    logout,
} = helper

const {
    TEST_SEARCH_STRING = 'Pacific',
    DONE_KEY_CODE = 66,
} = process.env

test('10 Test if an unauthorized user can access Search Wines', async t => {
    const createButtonId = id => idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[${id}]
    `)

    const searchWinesButton = createButtonId(3)

    await logout()

    await driver
        .waitForVisible(searchWinesButton, 2000)
        .click(searchWinesButton)

    const searchField = idFromResourceId('android:id/search_src_text')
    await driver
        .waitForVisible(searchField, 2000)
        .setValue(searchField, TEST_SEARCH_STRING)

    await driver.pressKeycode(DONE_KEY_CODE)
        .then(({value}) => t.ok(value, 'User clicked a search button'))
        .catch(error => t.notOk(error, 'User did not click a search button'))

    try {
        await driver.hideDeviceKeyboard();
    } catch (e) {
        // Do nothing
    }

    const searchResultItemId = idFromResourceId('com.gettipsi.tipsi.dev:id/card_layout')
    await driver.waitForVisible(searchResultItemId, 60000)

    const itemTitle = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_search_list_item_name')
    const items = []
    const rawItems = await driver.elements(searchResultItemId)
    for (const wineItem of rawItems.value) {
        try {
            const name = await getChildText(wineItem.ELEMENT, itemTitle)
            items.push({low: name.toLowerCase(), name})
        } catch (e) {
            // Do nothing. Element not full visible
        }
    }

    for (const wine of items) {
        t.notEqual(wine.low.indexOf('pacific'), -1, `"${wine.name}" contains Pacific in the name`)
    }
})
