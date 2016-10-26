import test from 'tape-async'
import helper from './utils/helper'
import common from './utils/common'

const {
    driver,
    idFromResourceId,
    idFromXPath,
    createMenuButtonId,
    login,
    backToHome,
} = helper

const { searchDrink } = common

const {
    TEST_SEARCH_STRING = 'Chateau',
} = process.env

test('19 Test if drinks can be founded or not founded in profile', async t => {
    await login()

    const myProfileButton = createMenuButtonId('MyProfile')
    const searchWinesButton = createMenuButtonId('SearchWines')
    await driver
        .waitForVisible(searchWinesButton, 2000)
        .click(searchWinesButton)

    await searchDrink(TEST_SEARCH_STRING)

    const firstWineInList = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v7.widget.RecyclerView[1]/
        android.widget.FrameLayout[1]
    `)

    await driver.waitForVisible(firstWineInList, 10000)
    t.pass('Wine list is visible')
    await driver.click(firstWineInList)

    const heartIcon = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.support.v4.view.ViewPager[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.LinearLayout[1]/android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.widget.FrameLayout[3]/android.widget.ImageView[1]
    `)

    await driver.waitForVisible(heartIcon, 10000)
    t.pass('Wine details is visible')
    await driver.click(heartIcon)

    const wishListButton = idFromResourceId('com.gettipsi.tipsi.dev:id/cellar_wishlist_button')
    const doneButton = idFromResourceId('com.gettipsi.tipsi.dev:id/cellar_done_button')

    await driver.waitForVisible(doneButton, 3000)
    t.pass('Cellar switches are visible')

    await driver
        .waitForVisible(wishListButton, 3000)
        .click(wishListButton)
        .waitForVisible(doneButton, 3000)
        .click(doneButton)

    t.pass('Wine was added into wish list')

    await backToHome()

    await driver.waitForVisible(myProfileButton, 2000).click(myProfileButton)

    const profileWishList = idFromResourceId('com.gettipsi.tipsi.dev:id/profile_wishlist_button')

    await driver.waitForVisible(profileWishList, 3000)
    t.pass('My Profile is visible')

    await driver.waitForVisible(profileWishList, 2000).click(profileWishList)

    const searchFieldId = idFromResourceId('com.gettipsi.tipsi.dev:id/profile_search_edittext')
    await driver.setValue(searchFieldId, TEST_SEARCH_STRING)

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        t.pass('Appium did not close keyboard after search! Bad, bad, bad boy!')
        await driver.swipeUp(profileWishList, 1000).back()
    }

    const wineItem = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.FrameLayout[1]`)

    await driver.waitForVisible(wineItem, 10000)
    t.pass('Wine exists in wish list')

    const alertTitleId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.LinearLayout[1]/
        android.widget.LinearLayout[1]/android.widget.TextView[1]`)

    try {
        await driver.waitForVisible(searchFieldId, 10000)
    } catch (e) {
        // await driver.hideDeviceKeyboard()
        await driver.swipeUp(profileWishList, 1000).back()
    }

    await driver.setValue(searchFieldId, 'sad')

    await driver.waitForVisible(alertTitleId, 10000)

    const alertTitle = await driver.getText(alertTitleId)
    t.equal(alertTitle, 'No wines', 'Alert title should be "No wines"')

    const expectedAlertText =
        'There are no wines matching your search. Try again with different keywords'
    const alertMessageId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.ScrollView[1]/android.widget.LinearLayout[1]/
        android.widget.TextView[1]
    `)
    const alertMessage = await driver.getText(alertMessageId)
    t.equal(alertMessage, expectedAlertText, 'Alert message is correct')

    const okButton = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.LinearLayout[2]/
        android.widget.Button[1]
    `)
    await driver.click(okButton)

    await driver.setValue(searchFieldId, '')

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        await driver.swipeUp(profileWishList, 500)
    }

    await driver
        .click(wineItem)
        .waitForVisible(heartIcon, 10000)
        .click(heartIcon)

    t.pass('Wine details were loaded')

    await driver
        .waitForVisible(wishListButton, 3000)
        .click(wishListButton)
        .waitForVisible(doneButton, 3000)
        .click(doneButton)

    await driver.back()

    const currentButtonText = await driver.getText(profileWishList).then(data => data.split('\n'))
    const wineListName = currentButtonText[1]
    const winesCount = parseInt(currentButtonText[0], 10)
    t.equal(winesCount, 0, `Wine was removed from ${wineListName}`)
})
