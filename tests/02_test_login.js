import test from 'tape-async'
import helper from './utils/helper'

const { driver, idFromXPath, idFromResourceId, idFromText, backToHome } = helper

const {
    TEST_USERNAME = 'testusertipsi@gmail.com',
    TEST_PASSWORD = 'tipsiasdfjkl',
} = process.env

test('02 Test if a user can log in with correct email and password', async (t) => {
    const homeMenuId = idFromResourceId('com.gettipsi.tipsi.dev:id/home_item_grid')
    const homeLoginButtonId = idFromText('Login')
    const loginId = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_login_btn')
    const loginWithEmailId = idFromResourceId('com.gettipsi.tipsi.dev:id/login_with_email')
    const loginWithEmailTextId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.LinearLayout[3]/
        android.widget.TextView[1]
    `) // should be changed by accessibility label
    const usernameId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_username')
    const passwordId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_password')
    const loginSubmitButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_button')
    const activityAfterLogin = 'com.gettipsi.tipsi.ui.activity.HomeActivity'

    await backToHome()

    await driver
        .swipeUp(homeMenuId, 5000)
        .click(homeLoginButtonId)
        .waitForVisible(loginId, 2000)

    const loginButtonText = await driver.getText(loginId)
    t.equal(loginButtonText, 'Login', 'User should see "Login" button')
    await driver.click(loginId)

    const loginWithEmailText = await driver.getText(loginWithEmailTextId)
    t.equal(loginWithEmailText, 'Login with Email', 'User should see "Login with Email" button')
    await driver.click(loginWithEmailId)

    const loginActivity = await driver.currentActivity()
    t.equal(
        loginActivity.value,
        'com.gettipsi.tipsi.ui.activity.EmailLoginActivity',
        'User should see Login with Email view'
    )

    await driver.setValue(usernameId, TEST_USERNAME)
    const typedUsername = await driver.getText(usernameId)
    t.equal(typedUsername, TEST_USERNAME, `Typed username should be "${TEST_USERNAME}"`)

    await driver.setValue(passwordId, TEST_PASSWORD)
    t.pass('User should be able to type password')

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        await driver.swipeUp(500)
    }

    await driver
        .waitForVisible(loginSubmitButtonId, 2000)
        .click(loginSubmitButtonId)
    t.pass('User should be able to submit login')

    // Skip all tips
    await backToHome()

    const menuActivity = await driver.currentActivity()
    t.equal(menuActivity.value, activityAfterLogin, 'User should see Home view')
})
