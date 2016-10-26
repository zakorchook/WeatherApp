import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromResourceId,
    createMenuButtonId,
    logout,
} = helper

const {
    TEST_TWITTER_EMAIL = 'tipsidev@gmail.com',
    TEST_TWITTER_PASSWORD = 'superpuperduperawesometipsidev',
} = process.env

const TEST_ACCOUNT_PASSWORD = '8HLWE6tUH7ad4368'

test('20 Test if a user can auth via connected twitter', async t => {
    await logout()

    const loginButton = createMenuButtonId('Login')
    const myProfileButton = createMenuButtonId('MyProfile')
    const loginId = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_login_btn')
    const loginWithEmail = idFromResourceId('com.gettipsi.tipsi.dev:id/login_with_email')
    const usernameTipsi = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_username')
    const passwordTipsi = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_password')
    const submitTipsi = idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_button')
    const profileTwitter = idFromResourceId('com.gettipsi.tipsi.dev:id/profile_twitter_button')
    const loginWithTwitter = idFromResourceId('com.gettipsi.tipsi.dev:id/login_with_twitter')
    const email = idFromResourceId('username_or_email')
    const password = idFromResourceId('password')
    const submitButton = idFromResourceId('allow')
    await driver
        // Login
        .waitForVisible(loginButton, 2000)
        .click(loginButton)
        .waitForVisible(loginId, 2000)
        .click(loginId)
        .waitForVisible(loginWithEmail, 2000)
        .click(loginWithEmail)
        .waitForVisible(usernameTipsi, 2000)
        .setValue(usernameTipsi, TEST_TWITTER_EMAIL)
        .hideDeviceKeyboard()
        .setValue(passwordTipsi, TEST_ACCOUNT_PASSWORD)
        .hideDeviceKeyboard()
        .waitForVisible(submitTipsi, 2000)
        .click(submitTipsi)

    t.pass('User successfully signed in via email')

    // Connect twitter account
    await driver
        .waitForVisible(myProfileButton, 6000)
        .click(myProfileButton)
        .waitForVisible(profileTwitter, 6000)
        .click(profileTwitter)
        .waitForVisible(email, 10000)
        .setValue(email, TEST_TWITTER_EMAIL)
        .hideDeviceKeyboard()
        .setValue(password, TEST_TWITTER_PASSWORD)
        .hideDeviceKeyboard()
        .click(submitButton)
        .waitForVisible(submitButton, 10000)
        .click(submitButton)
        .waitForVisible(profileTwitter, 10000)
        .back()

    t.pass('User successfully connect twitter account')

    // Login via Twitter
    await driver
        .waitForVisible(loginButton, 6000)
        .click(loginButton)
        .waitForVisible(loginButton, 6000)
        .click(loginButton)
        .waitForVisible(loginId, 6000)
        .click(loginId)
        .waitForVisible(loginWithTwitter, 6000)
        .click(loginWithTwitter)
        .waitForVisible(submitButton, 10000)
        .click(submitButton)

    try {
        await driver.waitForVisible(loginButton, 10000)
        const loginButtonText = await driver.getText(loginButton)
        t.equal(loginButtonText, 'Logout', 'User successfully signed in via twitter')
    } catch (e) {
        t.fail('Twitter account connect with Tipsi account is not working')
        const cancelButtonInAlert = idFromResourceId('android:id/button2')
        await driver
            .waitForVisible(cancelButtonInAlert, 10000)
            .click(cancelButtonInAlert)
    }
})
