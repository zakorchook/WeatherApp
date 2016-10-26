import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromResourceId,
    createMenuButtonId,
    logout,
} = helper

const {
    TEST_FIRST_NAME = 'Peter',
    TEST_LAST_NAME = 'Parker',
    TEST_USERNAME = 'testusertipsi@gmail.com',
    TEST_PASSWORD = 'tipsiasdfjkl',
} = process.env

test('15 Test if a user cannot sign up with incomplete or no details', async t => {
    await logout()

    const loginButton = createMenuButtonId('Login')
    const formFields = [
        {
            name: 'First name',
            id: idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_first_name'),
            value: TEST_FIRST_NAME,
            stepName: 'Input Last Name, Email and Password —> Sign Up',
            idx: 1,
        },
        {
            name: 'Last name',
            id: idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_last_name'),
            value: TEST_LAST_NAME,
            stepName: 'Input First Name, Email and Password —> Sign Up',
            idx: 2,
        },
        {
            name: 'Email',
            id: idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_email'),
            value: TEST_USERNAME,
            stepName: 'Input First Name, Last Name and Password —> Sign Up',
            idx: 3,
        },
        {
            name: 'Password',
            id: idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_password'),
            value: TEST_PASSWORD,
            stepName: 'Input First Name, Last Name and Email —> Sign Up',
            idx: 4,
        },
    ]

    const signUpButton = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_btn')
    const signUpFormLink = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_create_account_btn')
    await driver
        .waitForVisible(loginButton, 2000)
        .click(loginButton)
        .waitForVisible(signUpFormLink, 2000)
        .click(signUpFormLink)
        .waitForVisible(signUpButton, 2000)

    t.pass('Input First and Last Name, existing Email and Password—>Sign Up')
    for (const field of formFields) {
        await driver
            .waitForVisible(field.id, 2000)
            .clearElement(field.id)
            .setValue(field.id, field.value)

        try {
            await driver.hideDeviceKeyboard()
        } catch (e) {
            t.pass(`Appium did not close keyboard after ${field.name}! Bad, bad, bad boy!`)
        }
    }

    const alert = idFromResourceId('android:id/message')
    const expectedAlertText = 'We have a user with that email already.'
    const okButtonInAlert = idFromResourceId('android:id/button3')
    try {
        await driver
            .click(signUpButton)
            .waitForVisible(alert, 10000)
    } catch (e) {
        // Something wrong
    }

    const alertText = await driver.getText(alert)
    t.equal(alertText, expectedAlertText, `Alert text should be "${alertText}"`)
    await driver
        .click(okButtonInAlert)
        .waitForVisible(signUpButton, 2000)
    t.pass('User should see sign up form')
})
