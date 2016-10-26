import test from 'tape-async'
import { range } from 'lodash'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    createMenuButtonId,
    login,
} = helper

const {
    TEST_FIRST_NAME = 'Peter',
} = process.env

test('23_01 Test if user can add other users as friends', async t => {
    await login()

    const socialFeed = createMenuButtonId('SocialFeed')
    const addPeople = idFromResourceId('com.gettipsi.tipsi.dev:id/feed_add_button')
    await driver
        .waitForVisible(socialFeed, 5000)
        .click(socialFeed)
        .waitForVisible(addPeople, 5000)
        .click(addPeople)

    try {
        const errorMessage = idFromResourceId('android:id/message')
        const retryButton = idFromResourceId('android:id/button1')
        for (const x of [1, 2, 3, 4, 5]) {
            await driver.waitForVisible(errorMessage, 5000).click(retryButton)
            t.pass(`#${x} Check an error`)
        }
    } catch (e) {
        // Everything is OK
    }

    const searchField = idFromResourceId('com.gettipsi.tipsi.dev:id/find_friends_search_edittext')
    const submitButton = idFromResourceId('com.gettipsi.tipsi.dev:id/find_friends_icon')
    await driver
        .waitForVisible(searchField, 5000)
        .setValue(searchField, TEST_FIRST_NAME)
        .click(submitButton)

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        // Do nothing
    }

    const searchResultItem = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.RelativeLayout[1]/android.widget.FrameLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.LinearLayout
    `)

    const firstItemInList = `${searchResultItem}[1]`;
    try {
        await driver.waitForVisible(firstItemInList, 60000)
        const allSearchResults = await driver.elements(searchResultItem)
        const resultsLength = allSearchResults.value.length;
        t.ok(resultsLength, `Tipsi found ${resultsLength} people`)
    } catch (e) {
        t.fail('There is no people with that query', {
            actual: 0,
            expected: 10,
        })
        return
    }

    const firstItemNameInListId =
        `${firstItemInList}/android.widget.LinearLayout[1]/android.widget.TextView[1]`
    const firstItemNameInList = await driver.getText(firstItemNameInListId)

    const getButton = (id, idx = 1) => async what => {
        const buttonId = `${searchResultItem}[${idx}]/${id}`
        const button = await driver.element(buttonId)
        let isSelected = await driver.elementIdAttribute(button.value.ELEMENT, 'selected')
        isSelected = isSelected.value === 'true'
        return what === 'button' ? buttonId : isSelected
    }

    const followButtonId = 'android.widget.ImageButton[1]'
    const blockButtonId = 'android.widget.ImageButton[2]'
    const followButtonHelper = getButton(followButtonId)
    const blockedButtonHelper = getButton(blockButtonId)
    const blockButton = await blockedButtonHelper('button')
    const followButton = await followButtonHelper('button')
    const isFollowed = await followButtonHelper()
    if (isFollowed) {
        await driver.click(blockButton).waitForVisible(followButton, 2000)

        const isBlocked = await blockedButtonHelper()
        if (isBlocked) {
            await driver.click(followButton).back()
        }
    } else {
        await driver.click(followButton).waitForVisible(followButton, 2000).back()
    }

    await driver.waitForVisible(addPeople, 5000).click(addPeople)

    const friendsListItemId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.RelativeLayout[1]/android.widget.LinearLayout[2]/
        android.support.v7.widget.RecyclerView[1]/android.widget.LinearLayout
    `)

    await driver.waitForVisible(`${friendsListItemId}[1]`, 5000)
    let friendsElements = await driver.elements(friendsListItemId)
    friendsElements = friendsElements.value

    const friendNameSelector = async (idx = 1) => {
        const textId = 'android.widget.LinearLayout[1]/android.widget.TextView[1]'
        return `${friendsListItemId}[${idx}]/${textId}`
    }
    const friendFollowedSelector = async (idx = 1, buttonId = 1) => {
        const id = `${friendsListItemId}[${idx}]/android.widget.ImageButton[${buttonId}]`
        const element = await driver
            .waitForVisible(id, 5000)
            .element(id)
            .then(data => data.value.ELEMENT)
        return {element, id}
    }

    if (friendsElements.length) {
        const friendsList = []
        const temp = friendsElements.length === 1 ? [1] : range(friendsElements.length, 1)
        for (const idx of temp) {
            const followId = await friendFollowedSelector(idx)
            const isFollowed = await driver
                .elementIdAttribute(followId.element, 'selected')
                .then(data => data.value === 'true')

            const nameId = await friendNameSelector(idx)
            const name = await driver.getText(nameId)
            friendsList.push({isFollowed, name})
        }

        const friendsItem = friendsList.filter(item => item.name === firstItemNameInList)
        t.ok(friendsItem[0].isFollowed, `${firstItemNameInList} is active friend`)
    }

    t.comment('23_02 Test if user can block other users from friends list')

    const firstFriendButtonBlockedId = await friendFollowedSelector(1, 2)
    const firstFriendIsBlocked = await driver
        .elementIdAttribute(firstFriendButtonBlockedId.element, 'selected')
        .then(data => data.value === 'true')

    await driver
        .click(firstFriendButtonBlockedId.id)
        .waitForVisible(firstFriendButtonBlockedId.id, 2000)

    const status = await driver
        .elementIdAttribute(firstFriendButtonBlockedId.element, 'selected')
        .then(data => data.value === 'true')

    t.notEqual(status, firstFriendIsBlocked, 'User can block/unblock other users')

    t.comment('23_03 Test if user can see profile other users')

    if (status) {
        await driver
            .click(firstFriendButtonBlockedId.id)
            .waitForVisible(firstFriendButtonBlockedId.id, 2000)
    }

    const firstFriend = `${friendsListItemId}[1]`
    const profileTwitter = idFromResourceId('com.gettipsi.tipsi.dev:id/profile_twitter_button')
    await driver.waitForVisible(firstFriend, 2000).click(firstFriend)

    try {
        await driver.waitForVisible(profileTwitter, 10000)
        t.pass('User should see profile page another user')
    } catch (e) {
        t.fail('User cannot see other profile', {expected: 'can', actual: 'cannot'})
    }
})
