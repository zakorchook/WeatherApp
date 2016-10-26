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
} = process.env

test('12 Test if a user can send request to recover password', async t => {
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
    const forgotPasswordButton = idFromResourceId('com.gettipsi.tipsi.dev:id/email_forgot_password')
    const forgotPasswordField = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.ScrollView[1]/android.widget.LinearLayout[1]/
        android.widget.TableLayout[1]/android.widget.TableRow[1]/
        android.widget.EditText[1]
    `)
    const requestButton = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.ScrollView[1]/android.widget.LinearLayout[1]/
        android.widget.Button[1]
    `)

    await logout()

    await driver
        .waitForVisible(logoutButton, 2000)
        .click(logoutButton)
        .waitForVisible(loginId, 2000)
        .click(loginId)
        .waitForVisible(loginWithEmailId, 2000)
        .click(loginWithEmailId)
    await driver.waitForVisible(forgotPasswordButton, 2000)
    t.pass('User should see login form')

    await driver
        .click(forgotPasswordButton)
        .waitForVisible(forgotPasswordField, 2000)
    t.pass('User should see forgot password form')

    await driver.setValue(forgotPasswordField, TEST_USERNAME)
    const typedEmailForRequest = await driver.getText(forgotPasswordField)
    t.equal(typedEmailForRequest, TEST_USERNAME, 'Typed email and sended email are equal')

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        await driver.swipeUp(500)
    }

    await driver
        .click(requestButton)
        .waitForVisible(usernameId, 20000)
    t.pass('I hope message was sent')

    t.comment('Type INVALID email on login screen and go to recovery')
    t.ok(usernameId, 'User should see login form')
    const INVALID_EMAIL = 'sadasdadd@test.com'
    await driver.setValue(usernameId, INVALID_EMAIL)

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        await driver.swipeUp(500)
    }

    await driver
        .waitForVisible(forgotPasswordButton, 5000)
        .click(forgotPasswordButton)
        .waitForVisible(forgotPasswordField, 5000)

    const invalidTypedEmail = await driver.getText(forgotPasswordField)
    t.equal(invalidTypedEmail, INVALID_EMAIL, 'Email typed on previous step and this one are equal')

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        await driver.swipeUp(500)
    }

    await driver
        .click(requestButton)
        .waitForVisible(usernameId, 20000)
    t.pass('I hope message was sent')

    t.comment('Type VALID email on login screen and go to recovery')
    t.ok(usernameId, 'User should see login form')
    await driver.setValue(usernameId, TEST_USERNAME)

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        await driver.swipeUp(500)
    }

    await driver
        .waitForVisible(forgotPasswordButton, 5000)
        .click(forgotPasswordButton)
        .waitForVisible(forgotPasswordField, 5000)

    const typedEmail = await driver.getText(forgotPasswordField)
    t.equal(typedEmail, TEST_USERNAME, 'Email typed on previous step and this one are equal')

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        await driver.swipeUp(500)
    }

    await driver.click(requestButton)
    t.pass('I hope message was sent')
})
