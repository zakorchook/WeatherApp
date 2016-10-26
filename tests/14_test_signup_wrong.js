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

test('14 Test if a user cannot sign up with invalid email address', async t => {
    await logout()

    const loginButton = createMenuButtonId('Login')
    const formFields = [
        {
            name: 'First name',
            id: idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_first_name'),
            value: TEST_FIRST_NAME,
        },
        {
            name: 'Last name',
            id: idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_last_name'),
            value: TEST_LAST_NAME,
        },
        {
            name: 'Email',
            id: idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_email'),
            value: `${TEST_USERNAME}_wrong`,
        },
        {
            name: 'Password',
            id: idFromResourceId('com.gettipsi.tipsi.dev:id/sign_up_password'),
            value: TEST_PASSWORD,
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

    t.pass('Input First and Last Name, invalid Email and Password —> Sign Up')
    for (const field of formFields) {
        await driver
            .waitForVisible(field.id, 2000)
            .clearElement(field.id)
            .setValue(field.id, field.value)

        const typedText = await driver.getText(field.id)
        if (field.name !== 'Password') {
            t.equal(typedText, field.value, `Typed value is correct - "${field.value}"`)
        }

        try {
            await driver.hideDeviceKeyboard()
        } catch (e) {
            t.pass(`Appium did not close keyboard after ${field.name}! Bad, bad, bad boy!`)
        }
    }

    try {
        await driver.click(signUpButton).waitForVisible(signUpButton, 2000)
        t.pass('Email has wrong format')
    } catch (e) {
        // Form is correct
    }

    await driver.back()
    t.pass('User should back into previous screen')

    await driver.waitForVisible(signUpFormLink, 3000).click(signUpFormLink)
    t.pass('User should be in signup form')
})
