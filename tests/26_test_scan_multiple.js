import test from 'tape-async'
import path from 'path'
import { toOrdinal } from 'number-to-words'
import helper from './utils/helper'
import { find } from 'lodash';

const {
    driver,
    idFromXPath,
    idFromResourceId,
    createMenuButtonId,
    pushFileToDevice,
    pullFileFromDevice,
    getChildText,
    login,
} = helper

test('26 Test if multiple scans can be made/Compare Wines feature works', async (t) => {
    await login()

    const items = [
        {
            title: 'Caymus Cabernet Sauvignon',
            region: '2003, North Coast, Napa County, Napa Valley, California',
            color: 'Red Wine',
            imagePath: './tests/data/caymus-label.jpg',
        },
        {
            title: 'Château Loudenne Medoc Bordeaux Blend, Cabernet Sauvignon, Cabernet Franc, Malbec', // eslint-disable-line max-len
            region: '2014, Medoc, Bordeaux',
            color: 'Red Wine',
            imagePath: './tests/data/chateau-label.png',
        },
    ]

    for (const { imagePath } of items) {
        await pushFileToDevice(
            imagePath,
            `/sdcard/Download/${path.basename(imagePath)}`
        )
    }

    const homeScanButtonId = createMenuButtonId('ScanLabel')
    const cameraStateSwitchId = idFromResourceId('com.gettipsi.tipsi.dev:id/camera_state_switch')
    const galleryButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/camera_gallery')

    await driver
        .waitForVisible(homeScanButtonId, 2000)
        .click(homeScanButtonId)
        .waitForVisible(cameraStateSwitchId, 2000)
        .catch(() => driver.back()) // Skip tips
        .waitForVisible(cameraStateSwitchId, 2000)
        .click(cameraStateSwitchId)

    t.pass('User should be able to swith camera to Compare Wines mode')

    for (let i = 1; i <= items.length; i++) { // eslint-disable-line no-restricted-syntax
        const fileInPickerId = idFromXPath(`//
            android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
            android.support.v4.widget.DrawerLayout[1]/android.widget.LinearLayout[1]/
            android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
            android.widget.GridView[1]/android.widget.FrameLayout[${i}]
        `)

        await driver
            .waitForVisible(galleryButtonId, 5000)
            .click(galleryButtonId)
            .waitForVisible(fileInPickerId, 2000)
            .click(fileInPickerId)
    }

    t.pass(`User should be able to choose ${items.length} images from file picker`)

    const previewImageId = idFromResourceId('com.gettipsi.tipsi.dev:id/preview_mini')

    const { value: previews } = await driver
        .waitForVisible(previewImageId, 10000)
        .elements(previewImageId)

    t.equal(previews.length, items.length, `User should see ${items.length} images previews`)

    const compareButtonId = idFromResourceId('com.gettipsi.tipsi.dev:id/compare_action')
    const recognizedItemId = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.FrameLayout
    `)

    const { value: recognizedItems } = await driver
        .waitForVisible(compareButtonId, 5000)
        .click(compareButtonId)
        .elements(recognizedItemId)

    t.equal(
        recognizedItems.length,
        items.length,
        `User should see ${items.length} recognized wines`
    )

    const titleId = idFromResourceId('com.gettipsi.tipsi.dev:id/compare_wine_title')
    const regionId = idFromResourceId('com.gettipsi.tipsi.dev:id/compare_wine_region')
    const colorId = idFromResourceId('com.gettipsi.tipsi.dev:id/compare_wine_color')
    const ratingId = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_search_list_item_rating')
    const labelId = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_list_item_note_label')

    for (let i = 0; i < items.length; i++) {
        const recognizedItem = recognizedItems[i]

        const title = await getChildText(recognizedItem.ELEMENT, titleId)
        const region = await getChildText(recognizedItem.ELEMENT, regionId)
        const color = await getChildText(recognizedItem.ELEMENT, colorId)

        const isFound = Boolean(find(items, { title, region, color }))

        t.ok(isFound, `${toOrdinal(i + 1)} item should be recognized`)
    }

    const filterButtonId = idFromResourceId('android:id/text1')
    const filterConsumerScoreId = idFromXPath(`//
        android.widget.FrameLayout[1]/android.widget.ListView[1]/
        android.widget.TextView[2]
    `)
    const filterVintageQualityId = idFromXPath(`//
        android.widget.FrameLayout[1]/android.widget.ListView[1]/
        android.widget.TextView[3]
    `)

    await driver
        .waitForVisible(filterButtonId, 2000)
        .click(filterButtonId)
        .waitForVisible(filterConsumerScoreId, 2000)
        .click(filterConsumerScoreId)

    await driver.waitForVisible(ratingId, 3000)
    t.pass('Consumer Score filter: User should see wine rating')

    await driver
        .waitForVisible(filterButtonId, 2000)
        .click(filterButtonId)
        .waitForVisible(filterVintageQualityId, 2000)
        .click(filterVintageQualityId)

    await driver.waitForVisible(labelId, 3000)
    t.pass('Vintage Quality filter: User should see wine label')

    const { value: wineDetailActivity } = await driver
        .elementIdClick(recognizedItems[0].ELEMENT)
        .currentActivity()

    t.equal(
      wineDetailActivity,
      'com.gettipsi.tipsi.ui.activity.WineActivity',
      'Wine details can be opened'
    )

    for (const { imagePath } of items) {
        await pullFileFromDevice(
            `/sdcard/Download/${path.basename(imagePath)}`
        )
    }
})
