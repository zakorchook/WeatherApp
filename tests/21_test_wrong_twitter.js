import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromResourceId,
    idFromXPath,
    createMenuButtonId,
    logout,
} = helper

const {
    TEST_TWITTER_EMAIL = 'TipsiDevTest',
    TEST_TWITTER_PASSWORD = '2jLd447H7R77omMQ',
} = process.env

test('21 Test if a user can auth via not connected twitter', async t => {
    await logout()

    const loginButton = createMenuButtonId('Login')
    const loginId = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_login_btn')
    const alertTitleId = idFromResourceId('android:id/alertTitle')
    const alertMessageId = idFromResourceId('android:id/message')
    const okButtonInAlert = idFromResourceId('android:id/button1')
    const emailRegister = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_first_name')
    const loginWithTwitter = idFromResourceId('com.gettipsi.tipsi.dev:id/login_with_twitter')
    const email = idFromResourceId('username_or_email')
    const password = idFromResourceId('password')
    const submitButton = idFromResourceId('allow')
    await driver
        .waitForVisible(loginButton, 2000)
        .click(loginButton)
        .waitForVisible(loginId, 2000)
        .click(loginId)
        .waitForVisible(loginWithTwitter, 2000)
        .click(loginWithTwitter)

    try {
        await driver.waitForVisible(email, 10000)
    } catch (e) {
        const profileIcon = idFromXPath(`//
            android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
            android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
            android.webkit.WebView[1]/android.webkit.WebView[1]/
            android.view.View[1]/android.view.View[2]/
            android.view.View[1]/android.view.View[1]
        `)
        const logoutTwitterLink = idFromXPath(`//
            android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
            android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
            android.webkit.WebView[1]/android.webkit.WebView[1]/
            android.view.View[1]/android.view.View[2]/
            android.widget.ListView[1]/android.view.View[5]/
            android.view.View[1]/android.widget.Button[1]
        `)

        await driver
            .waitForVisible(profileIcon, 10000)
            .click(profileIcon)
            .waitForVisible(logoutTwitterLink, 10000)
            .click(logoutTwitterLink)
            .waitForVisible(email, 10000)
    }

    await driver.setValue(email, TEST_TWITTER_EMAIL)
        .hideDeviceKeyboard()
        .setValue(password, TEST_TWITTER_PASSWORD)
        .hideDeviceKeyboard()
        .click(submitButton)
        .waitForVisible(submitButton, 10000)
        .click(submitButton)
        .waitForVisible(alertTitleId, 10000)

    const alertTitle = await driver.getText(alertTitleId)
    t.equal(alertTitle, 'Create An Account', 'User should see "Create An Account" title')

    const alertMessage = await driver.getText(alertMessageId)
    const expectedAlertMessage =
        'This Twitter user does not have have a Tipsi account. Please create an account first.'
    t.equal(alertMessage, expectedAlertMessage, 'User should see correct alert message')

    await driver.click(okButtonInAlert).waitForVisible(emailRegister, 5000)
    t.pass('User should see register form')
})
