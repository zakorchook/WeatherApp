import test from 'tape-async'
import helper from './utils/helper'

const { driver, idFromResourceId } = helper

test('01 Test if a user can skip login', async (t) => {
//    const createId = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_create_account_btn')
//    const loginId = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_login_btn')
//    const skipId = idFromResourceId('com.gettipsi.tipsi.dev:id/sign_discard')
//    const nextId = idFromResourceId('com.gettipsi.tipsi.dev:id/menu_item_next')
//    const introId = idFromResourceId('com.gettipsi.tipsi.dev:id/intro_title')
    // const tipsId = idFromResourceId('android:id/content')
    const menuId = idFromResourceId('com.zakorchook.weatherapp:id/action_settings')
    const introId = idFromResourceId('com.zakorchook.weatherapp:id/intro_title')




//    await driver.waitForVisible(createId, 1000)
//
//    const createButtonName = await driver.getText(createId)
//    t.equal(createButtonName, 'Create An Account', 'First button should be "Create An Account"')
//
//    const loginButtonName = await driver.getText(loginId)
//    t.equal(loginButtonName, 'Login', 'Second button should be "Login"')
//
//    const skipButtonName = await driver.getText(skipId)
//    t.equal(skipButtonName, 'Skip, For Now', 'Third button should be "Skip, For Now"')
//
//    await driver.click(skipId)
//
//    await driver.waitForVisible(introId, 1000)
//
//    const firstIntroLabelText = await driver.getText(introId)
//    t.equal(firstIntroLabelText, 'Scan Wines', 'First intro label should be "Scan Wines"')
//
//    await driver.click(nextId)
//
//    const secondIntroLabelText = await driver.getText(introId)
//    t.equal(secondIntroLabelText, 'Your Profile', 'Second intro label should be "Your Profile"')
//
//    await driver.click(nextId)
//
//    const thirdIntroLabelText = await driver.getText(introId)
//    t.equal(thirdIntroLabelText, 'Locations', 'Third intro label should be "Locations"')
//
//    await driver.click(nextId)
//
//    const fourthIntroLabelText = await driver.getText(introId)
//    t.equal(fourthIntroLabelText, 'Events', 'Fourth intro label should be "Events"')
//
//    await driver.click(nextId)
});
