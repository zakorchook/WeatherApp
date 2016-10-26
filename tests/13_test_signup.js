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

async function checkFormErrors({driver, message, signUpButton, t}) {
    try {
        await driver
            .click(signUpButton)
            .waitForVisible(signUpButton, 2000)
        t.pass(message)
    } catch (e) {
        // Form is correct
    }
}

const arrayOfFields = (targetArray, except) => (
    targetArray.map(item => item.name !== except ? item : Object.assign({}, item, {value: ''}))
)

test('13 Test if a user cannot sign up with incomplete or no details', async t => {
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

    const props = {driver, signUpButton, t}
    let message = 'All fields are required'
    await checkFormErrors({...props, message})

    for (const step of formFields) {
        t.pass(`Step 0${step.idx} === ${step.stepName}`)
        for (const field of arrayOfFields(formFields, step.name)) {
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

        message = `${step.name} is requred`
        await checkFormErrors({...props, message})
        t.pass('Errors were checked')

        await driver.back()
        t.pass('User should back into previous screen')

        await driver.waitForVisible(signUpFormLink, 3000).click(signUpFormLink)
        t.pass('User should be in signup form')
    }
})
