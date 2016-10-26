import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    createMenuButtonId,
    login,
} = helper

test('22 Test if friends counters on Profile page same as counters on separate page', async t => {
    await login()

    const myProfileButton = createMenuButtonId('MyProfile')
    const followersCounterId =
        idFromResourceId('com.gettipsi.tipsi.dev:id/profile_follower_count_textview')
    const followingCounterId =
        idFromResourceId('com.gettipsi.tipsi.dev:id/profile_following_count_textview')
    const itemsInList = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.LinearLayout
    `)

    async function checkPeople(counter, type) {
        try {
            await driver.waitForVisible(itemsInList, 5000)
            const elements = await driver.elements(itemsInList)

            if (elements.value.length !== counter) {
                t.fail(`${type} count is not the same`, {
                    expected: elements.value.length,
                    actual: counter,
                })
            } else {
                t.pass(`${type} count is OK`)
            }
        } catch (e) {
            // Fail if there is no items in list
            if (counter === 0) {
                t.pass(`${type} count is OK`)
            } else {
                t.fail(`${type} count is not the same`, {
                    expected: 0,
                    actual: counter,
                })
            }
        }

        await driver.back()
    }

    await driver.waitForVisible(myProfileButton, 5000).click(myProfileButton)

    try {
        await driver.waitForVisible(followersCounterId, 5000)
    } catch (e) {
        t.fail('Got an error "Cannot retrive profile info"')
        return
    }

    const target = [
        {id: followersCounterId, name: 'Followers'},
        {id: followingCounterId, name: 'Following'},
    ]
    for (const item of target) {
        let counterValue = await driver.getText(item.id)
        counterValue = parseInt(counterValue, 10)
        await driver.click(item.id)

        await checkPeople(counterValue, item.name)
    }
})
