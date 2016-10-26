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

test('11 Test response on entering no data', async t => {
    const createButtonId = id => idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[${id}]
    `)

    const logoutButton = createButtonId(6)
    const loginId = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_login_btn')
    const loginWithEmailId = idFromResourceId('com.gettipsi.tipsi.dev:id/login_with_email')
    const usernameId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_username')
    const passwordId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_password')
    const loginSubmitButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_button')

    await logout()

    await driver
        .waitForVisible(logoutButton, 2000)
        .click(logoutButton)
        .waitForVisible(loginId, 2000)
        .click(loginId)
        .waitForVisible(loginWithEmailId, 2000)
        .click(loginWithEmailId)
        .waitForVisible(usernameId, 2000)

    t.ok(usernameId, 'User should see login form')

    await driver.setValue(usernameId, TEST_USERNAME)

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        // Do nothing
    }

    await driver.click(loginSubmitButtonId)

    const passwordWarningMessageId = idFromXPath(`//
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.ScrollView[1]/android.widget.LinearLayout[1]/
        android.widget.TextView[1]
    `)
    const passwordWarningMessage = await driver
        .waitForVisible(passwordWarningMessageId, 2000)
        .getText(passwordWarningMessageId)

    t.equal(
        passwordWarningMessage,
        'Please enter a password',
        `Warning "${passwordWarningMessage}" is visible`
    )

    const warningButtonId = idFromXPath(`//
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.LinearLayout[1]/
        android.widget.Button[1]
    `)
    await driver.click(warningButtonId)
    t.ok(warningButtonId, 'User accepted warning');

    await driver
        .waitForVisible(usernameId, 2000)
        .setValue(usernameId, '')
        .setValue(passwordId, TEST_PASSWORD)

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        // Do nothing
    }

    await driver.click(loginSubmitButtonId)

    const emailWarningMessageId = idFromXPath(`//
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.ScrollView[1]/android.widget.LinearLayout[1]/
        android.widget.TextView[1]
    `)
    const emailWarningMessage = await driver
        .waitForVisible(emailWarningMessageId, 2000)
        .getText(emailWarningMessageId)

    t.equal(
        emailWarningMessage,
        'Email is required',
        `Warning "${emailWarningMessage}" is visible`
    )

    await driver.click(warningButtonId)
    t.ok(warningButtonId, 'User accepted warning');
})
