import test from 'tape-async'
import helper from './utils/helper'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    createMenuButtonId,
    pushFileToDevice,
    pullFileFromDevice,
    login,
} = helper

const {
    LOCAL_IMAGE_PATH = './tests/data/test-image.jpg',
    DEVICE_IMAGE_PATH = '/sdcard/Download/test-image.jpg',
} = process.env

test('18 Test if scanning works', async (t) => {
    await login()
    await pushFileToDevice(LOCAL_IMAGE_PATH, DEVICE_IMAGE_PATH)

    const homeProfileButtonId = createMenuButtonId('MyProfile')
    await driver.waitForVisible(homeProfileButtonId, 2000)
    const numberOfScansId = idFromResourceId('com.gettipsi.tipsi.dev:id/profile_scans_button')

    const numberOfScansBefore = await driver
        .click(homeProfileButtonId)
        .waitForVisible(numberOfScansId, 5000)
        .getText(numberOfScansId)
        .then(text => parseInt(text, 10))

    t.pass(`Intial number of scans is: ${numberOfScansBefore}`)

    const homeScanButtonId = createMenuButtonId('ScanLabel')
    const galleryButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/camera_gallery')
    const firstFileInPickerId = idFromXPath(`//
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.widget.GridView[1]/android.widget.FrameLayout[1]
    `)

    await driver
        .back()
        .waitForVisible(homeScanButtonId, 2000)
        .click(homeScanButtonId)
        .back()
        .waitForVisible(galleryButtonId, 2000)
        .click(galleryButtonId)
        .waitForVisible(firstFileInPickerId, 2000)
        .click(firstFileInPickerId)

    t.pass('User should be able to choose the image from file picker')

    const useButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/use')
    const continueButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/btn_continue')
    const skipButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/menu_item_skip')

    await driver
        .waitForVisible(useButtonId, 5000)
        .click(useButtonId)
        .waitForVisible(continueButtonId, 5000)
        .click(continueButtonId)
        .waitForVisible(skipButtonId, 5000)
        .click(skipButtonId)

    t.pass('User should be able to skip wine details')

    await pullFileFromDevice(DEVICE_IMAGE_PATH)

    const numberOfScansAfter = await driver
        .click(homeProfileButtonId)
        .waitForVisible(numberOfScansId, 5000)
        .getText(numberOfScansId)
        .then(text => parseInt(text, 10))

    t.equal(
        numberOfScansAfter,
        numberOfScansBefore + 1,
        `Number of scans after scanning should be: ${numberOfScansBefore + 1}`
    )
})
