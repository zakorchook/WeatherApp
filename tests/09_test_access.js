import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    logout,
} = helper

test('09 Test if a user can log in after accessing a screen as an unauthorized user', async t => {
    const createButtonId = id => idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[${id}]
    `)

    const scanLabelButton = createButtonId(2)
    const myProfileButton = createButtonId(4)
    const socialFeedButton = createButtonId(5)
    const signInDialogTitle = idFromResourceId('com.gettipsi.tipsi.dev:id/signin_dialog_title')

    await logout()

    const suiteButtons = [
        {id: scanLabelButton, name: 'Scan Label Button', dialogTitle: 'start scanning wine'},
        {id: myProfileButton, name: 'My Profile Button', dialogTitle: 'view your profile'},
        {id: socialFeedButton, name: 'Social Feed Button', dialogTitle: 'view your Activity Feed'},
    ]
    for (const button of suiteButtons) {
        const signInDialogButton =
            idFromResourceId('com.gettipsi.tipsi.dev:id/signin_dialog_signin_button')
        await driver.click(button.id)
        t.pass(`User clicked on "${button.name}"`)

        await driver.waitForVisible(signInDialogButton, 2000)
        t.ok(signInDialogButton, `User should see sign in dialog in "${button.name} Suite"`)

        const dialogTitle = await driver.getText(signInDialogTitle)
        t.equal(dialogTitle, `Sign in to ${button.dialogTitle}`, `Title is "${dialogTitle}"`)
        await driver.back();
    }
})
