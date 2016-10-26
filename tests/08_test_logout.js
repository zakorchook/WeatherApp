import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    logout,
} = helper

const {
  TEST_USERNAME = 'testusertipsi@gmail.com',
  TEST_PASSWORD = 'tipsiasdfjkl',
} = process.env

test('08 Test if a user can log in after accessing a screen as an unauthorized user', async t => {
    // Main screen—>Scan Label—>Sign in—>Login with Email—>Input Email and Password—>Login—>Logout
    const createButtonId = id => idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[${id}]
    `)
    const homeGrid = idFromResourceId('com.gettipsi.tipsi.dev:id/home_item_grid')

    const scanLabelButton = createButtonId(2)
    const myProfileButton = createButtonId(4)
    const socialFeedButton = createButtonId(5)
    const logoutButton = createButtonId(6)

    await logout()

    const suiteButtons = [
        {id: scanLabelButton, description: 'Scan Label Button Suite'},
        {id: myProfileButton, description: 'My Profile Button Suite'},
        {id: socialFeedButton, description: 'Social Feed Button Suite'},
    ]
    for (const button of suiteButtons) {
        const signInDialogButton =
            idFromResourceId('com.gettipsi.tipsi.dev:id/signin_dialog_signin_button')
        const loginWithEmailId = idFromResourceId('com.gettipsi.tipsi.dev:id/login_with_email')
        await driver
            .click(button.id)
            .waitForVisible(signInDialogButton, 2000)

        t.ok(signInDialogButton, `User should see sign in dialog in "${button.description}"`)

        await driver
            .click(signInDialogButton)
            .waitForVisible(loginWithEmailId, 2000)
            .click(loginWithEmailId)

        const usernameId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_username')
        const passwordId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_password')
        const loginSubmitButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_button')

        await driver.waitForVisible(usernameId, 2000)

        t.ok(usernameId, 'User should see login form')

        await driver
            .setValue(usernameId, TEST_USERNAME)
            .setValue(passwordId, TEST_PASSWORD)

        try {
            await driver.hideDeviceKeyboard()
        } catch (e) {
            // Do nothing
        }

        await driver.swipeUp(homeGrid, 1000)

        await driver.click(loginSubmitButtonId)
            .waitForVisible(logoutButton, 10000)
            .click(logoutButton)
            .waitForVisible(logoutButton, 2000)

        const loginButtonText = await driver.getText(logoutButton)
        t.equal(loginButtonText, 'Login', 'User should see login button after logout')
    }
})
