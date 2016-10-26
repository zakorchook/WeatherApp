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

test('17 Test if drinks can be added and removed in Favorites, Wishlist or Had queues', async t => {
    await login()

    const myProfileButton = createMenuButtonId('MyProfile')
    const searchWinesButton = createMenuButtonId('SearchWines')
    await driver
        .waitForVisible(searchWinesButton, 2000)
        .click(searchWinesButton)

    await searchDrink()

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

    const hadItButton = idFromResourceId('com.gettipsi.tipsi.dev:id/cellar_had_button')
    const favoriteButton = idFromResourceId('com.gettipsi.tipsi.dev:id/cellar_favorite_button')
    const wishListButton = idFromResourceId('com.gettipsi.tipsi.dev:id/cellar_wishlist_button')
    const doneButton = idFromResourceId('com.gettipsi.tipsi.dev:id/cellar_done_button')

    await driver.waitForVisible(doneButton, 3000)
    t.pass('Cellar switches are visible')
    const buttonsSequence = [hadItButton, favoriteButton, wishListButton, doneButton]
    for (const buttonItem of buttonsSequence) {
        await driver.waitForVisible(buttonItem, 3000).click(buttonItem)
    }

    t.pass('Wine was added into three lists')

    await backToHome()

    await driver.waitForVisible(myProfileButton, 2000).click(myProfileButton)

    const profileHad = idFromResourceId('com.gettipsi.tipsi.dev:id/profile_had_button')
    const profileFavorites = idFromResourceId('com.gettipsi.tipsi.dev:id/profile_favorites_button')
    const profileWishList = idFromResourceId('com.gettipsi.tipsi.dev:id/profile_wishlist_button')
    const wineItem = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.FrameLayout[1]
    `)

    await driver.waitForVisible(profileHad, 3000)
    t.pass('My Profile is visible')

    const profileButtonsSequence = [profileHad, profileFavorites, profileWishList]
    for (const profileButton of profileButtonsSequence) {
        await driver
            .waitForVisible(profileButton, 2000)
            .click(profileButton)
            .waitForVisible(wineItem, 2000)
    }

    t.pass('Wine exists in lists')

    await driver
        .click(wineItem)
        .waitForVisible(heartIcon, 5000)
        .click(heartIcon)

    t.pass('Wine details were loaded')

    for (const buttonItem of buttonsSequence) {
        await driver.waitForVisible(buttonItem, 3000).click(buttonItem)
    }

    await driver.back()

    for (const profileButton of profileButtonsSequence) {
        const currentButtonText = await driver.getText(profileButton).then(data => data.split('\n'))
        const wineListName = currentButtonText[1]
        const winesCount = parseInt(currentButtonText[0], 10)
        t.equal(winesCount, 0, `Wine was removed from ${wineListName}`)
    }
})
