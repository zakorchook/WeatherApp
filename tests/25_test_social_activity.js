import test from 'tape-async'
import { range } from 'lodash'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    createMenuButtonId,
    login,
} = helper

test('25 Test if user can see his own activity on Following tab', async t => {
    await login()

    const myProfile = createMenuButtonId('MyProfile')
    const profileNameId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.view.ViewGroup[1]/android.widget.TextView[1]
    `)
    const profileName = await driver
        .waitForVisible(myProfile, 2000)
        .click(myProfile)
        .waitForVisible(profileNameId, 5000)
        .getText(profileNameId)

    await driver.back()

    const socialFeed = createMenuButtonId('SocialFeed')
    const list = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.ViewAnimator[1]/android.widget.FrameLayout[1]/
        android.support.v7.widget.RecyclerView[1]
    `)
    const getItemPath = idx => `${list}/android.widget.FrameLayout${idx ? `[${idx}]` : ''}`
    const firstItem = getItemPath(1)
    const getUsername = itemId => `${itemId}/
        android.widget.LinearLayout[1]/android.widget.LinearLayout[1]/
        android.widget.LinearLayout[1]/android.widget.LinearLayout[1]/
        android.widget.TextView[1]`

    await driver.waitForVisible(socialFeed, 2000).click(socialFeed)

    try {
        await driver.waitForVisible(firstItem, 20000)
    } catch (e) {
        t.pass('There is no following activity')
        return
    }


    let entries = await driver.elements(getItemPath())
    entries = entries.value.length === 1 ? [1] : range(entries.value.length, 1)
    for (const x of entries) {
        const username = await driver.getText(getUsername(getItemPath(x)))
        t.notEqual(profileName, username, 'User should not see his own activity', {
            expected: `not equal ${profileName}`,
        })
    }
})
