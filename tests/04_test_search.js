import test from 'tape-async'
import helper from './utils/helper'
import common from './utils/common'

const {
    driver,
    idFromXPath,
    idFromResourceId,
    getChildText,
    backToHome,
} = helper

const { searchDrink } = common

const {
    TEST_SEARCH_STRING = 'Cabernet',
    TEST_WINERY_STRING = 'Antinori',
    TEST_LOCATION_STRING = 'California',
    TEST_WRONG_STRING = 'aaa',
    TEST_REVIEW_TEXT = 'Test review',
    TEST_REVIEW_NEW_TEXT = 'New test review text',
    // TEST_RESTAURANT_NAME = 'katagiri',
    FAKE_LAT = 40.761867,
    FAKE_LON = -73.967796,
    DONE_KEY_CODE = 66,
} = process.env

test('04_01 Test if a user can see search view', async (t) => {
    const wineActivityPath = 'com.gettipsi.tipsi.ui.activity.WineActivity'
    const searchResultActivityPath = 'com.gettipsi.tipsi.ui.activity.SearchResultsActivity'

    await backToHome()

    const btnSearch = idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[3]
    `) // should be changed by accessibility label
    const searchResultItemLayoutId = idFromResourceId('com.gettipsi.tipsi.dev:id/card_layout')
    await driver.waitForVisible(btnSearch, 3000)
    await driver.click(btnSearch)

    const searchActivityPath = 'com.gettipsi.tipsi.ui.activity.WineSearchActivity'
    const searchActivity = await driver.currentActivity()
    t.equal(searchActivity.value, searchActivityPath, 'User should see Search view')

    t.comment('04_02 Test if search by winery works')

    await searchDrink(TEST_WINERY_STRING)
    await driver.waitForVisible(searchResultItemLayoutId, 60000)

    const searchWineryResult = await driver.currentActivity()
    t.equal(
        searchWineryResult.value,
        searchResultActivityPath,
        'User should see Search Result view'
    )

    await driver.back();

    t.comment('04_03 Test if search by location works')

    await searchDrink(TEST_LOCATION_STRING)
    await driver.waitForVisible(searchResultItemLayoutId, 60000)

    const searchLocationResult = await driver.currentActivity()
    t.equal(
        searchLocationResult.value,
        searchResultActivityPath,
        'User should see Search Result view'
    )

    await driver.back();

    t.comment('04_04 Test if a notification is shown if there are no results')

    await searchDrink(TEST_WRONG_STRING)

    const idAlertTitle = idFromResourceId('com.gettipsi.tipsi.dev:id/alertTitle')
    await driver.waitForVisible(idAlertTitle, 7000)

    t.pass('User should see alert dialog with no wines message')

    const idAlertOk = idFromResourceId('android:id/button1')
    await driver.click(idAlertOk)

    t.comment('04_05 Test if a user can search wine')

    await searchDrink(TEST_SEARCH_STRING)

    await driver.waitForVisible(searchResultItemLayoutId, 60000)
    const searchResultActivity = await driver.currentActivity()
    t.equal(
        searchResultActivity.value,
        searchResultActivityPath,
        'User should see Search Result view'
    )

    const filterButton = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_search_filter_btn')
    const filterButtonText = await driver.getText(filterButton)
    t.equal(filterButtonText, 'show filter', 'User should see filter button')

    await driver.click(filterButton)

    const filterButtonTextHidden = await driver.getText(filterButton)
    t.equal(filterButtonTextHidden, 'hide filter', 'User should see expanded filter')

    await driver.click(filterButton)

    const filterButtonTextCollapsed = await driver.getText(filterButton)
    t.equal(filterButtonTextCollapsed, 'show filter', 'User should see collapsed filter')

    const itemTitle = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_search_list_item_name')
    const itemRegion = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_search_list_item_region')

    const items = []
    const searchResultItemId = idFromResourceId('com.gettipsi.tipsi.dev:id/card_layout')
    const rawItems = await driver.elements(searchResultItemId)
    for (const wineItem of rawItems.value) {
        try {
            const name = await getChildText(wineItem.ELEMENT, itemTitle)
            const distance = await getChildText(wineItem.ELEMENT, itemRegion)
            items.push({name, distance})
        } catch (e) {
            // Do nothing. Element not full visible
        }
    }

    t.ok(items.length, `User should see a list of found wines, at least ${items.length}`)

    const firstItemTitle = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.FrameLayout[2]/android.widget.LinearLayout[1]/
        android.widget.LinearLayout[1]/android.widget.TextView[1]`
    )

    const firstItemRegion = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.FrameLayout[2]/android.widget.LinearLayout[1]/
        android.widget.LinearLayout[1]/android.widget.TextView[2]`
    )

    const wineName = await driver.getText(firstItemTitle)
    const wineRegion = await driver.getText(firstItemRegion)

    const firstItemInList = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.support.v7.widget.RecyclerView[1]/
        android.widget.FrameLayout[2]`
    )
    await driver.click(firstItemInList)

    const wineDetailName = idFromResourceId('com.gettipsi.tipsi.dev:id/wine_detail_name')
    await driver.waitForVisible(wineDetailName, 10000)

    const wineActivity = await driver.currentActivity()
    t.equal(wineActivity.value, wineActivityPath, 'User shuold see Wine Detail view')

    const wineDetailWineName = await driver.getText(wineDetailName)
    const wineDetailRegion =
        idFromResourceId('com.gettipsi.tipsi.dev:id/wine_detail_vintage_region')
    const wineDetailWineRegion = await driver.getText(wineDetailRegion)

    t.equal(wineDetailWineName, wineName, `User should see details for ${wineName} wine`)
    t.equal(wineDetailWineRegion, wineRegion, `User should see region ${wineRegion}`)

    t.comment('04_06 Test if a user can add review')

    const wineDetailReviewBtn =
        idFromResourceId('com.gettipsi.tipsi.dev:id/wine_detail_review_button')
    await driver.click(wineDetailReviewBtn)

    const reviewNote = idFromResourceId('com.gettipsi.tipsi.dev:id/add_review_edittext')
    await driver.waitForVisible(reviewNote, 5000)

    const addReviewActivityPath = 'com.gettipsi.tipsi.ui.activity.AddReviewActivity'
    const addReviewActivity = await driver.currentActivity()
    t.equal(addReviewActivity.value, addReviewActivityPath, 'User should see Add review view')

    await driver.setValue(reviewNote, TEST_REVIEW_TEXT)
    const note = await driver.getText(reviewNote)
    t.equal(note, TEST_REVIEW_TEXT, `Typed review note should be '${TEST_REVIEW_TEXT}'`)

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {
        // Do nothing
    }

    const reviewScrollView = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.ScrollView[1]`
    )
    await driver.swipeUp(reviewScrollView, 1000)

    const reviewChooseMealBtn = idFromResourceId('com.gettipsi.tipsi.dev:id/layout_take_food_type')
    await driver.waitForVisible(reviewChooseMealBtn, 3000)
    await driver.click(reviewChooseMealBtn)

    const lastMeal = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.TextView[10]`
    )
    await driver.waitForVisible(lastMeal, 5000)

    const addMealInfoActivityPath = 'com.gettipsi.tipsi.ui.activity.AddMealInfoActivity'
    const selectMealActivity = await driver.currentActivity()
    t.equal(selectMealActivity.value, addMealInfoActivityPath, 'User should see Add Meal info view')

    await driver.click(lastMeal)

    const preparationItem = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.TextView[2]`
    )
    await driver.waitForVisible(preparationItem, 5000)

    const addMealPreparationActivityPath =
        'com.gettipsi.tipsi.ui.activity.SelectPreparationActivity'
    const mealPreparationActivity = await driver.currentActivity()
    t.equal(
        mealPreparationActivity.value,
        addMealPreparationActivityPath,
        'User should see meal preparation view'
    )

    const choosenMealReturn = await driver.getText(preparationItem)
    await driver.click(preparationItem)

    await driver.swipeUp(reviewScrollView, 1000)

    const reviewChoosenFood =
        idFromResourceId('com.gettipsi.tipsi.dev:id/add_review_mealtype_chooser')
    await driver.waitForVisible(reviewChoosenFood, 5000)

    const returnRevAct = await driver.currentActivity()
    t.equal(returnRevAct.value, addReviewActivityPath, 'User should see add review view')

    const selectedMeal = await driver.getText(reviewChoosenFood)
    t.equal(choosenMealReturn, selectedMeal, `User should see selected meal '${selectedMeal}'`)

    const reviewChooseRestaurantBtn =
        idFromResourceId('com.gettipsi.tipsi.dev:id/layout_take_restaurant')
    await driver.click(reviewChooseRestaurantBtn)

    const nearbySearchBtn = idFromResourceId('com.gettipsi.tipsi.dev:id/search_btn')
    try {
        await driver.waitForVisible(nearbySearchBtn, 5000)
    } catch (e) {
        await driver.back()
    }

    const nearbyActivityPath = 'com.gettipsi.tipsi.ui.activity.RestaurantListActivity'
    const nearByActivity = await driver.currentActivity()
    t.equal(nearByActivity.value, nearbyActivityPath, 'User should see near by view')

    const restaurantList = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list');
    await driver.waitForVisible(restaurantList, 3000)

    await driver.swipeUp(restaurantList, 2000)

    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    await driver.click(nearbySearchBtn)

    const nearbySearchField = idFromResourceId('com.gettipsi.tipsi.dev:id/restaurant_list_search')
    await driver.waitForVisible(nearbySearchField, 5000)

    const nearbyItem = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.LinearLayout[1]`
    )
    await driver.click(nearbyItem)

    try {
        await driver.hideDeviceKeyboard();
    } catch (e) {
        // do nothing
    }

    const reviewAddReview = idFromResourceId('com.gettipsi.tipsi.dev:id/add_review_add_btn')
    await driver.waitForVisible(reviewAddReview, 5000)

    const fromNearBy = await driver.currentActivity()
    t.equal(fromNearBy.value, addReviewActivityPath, 'User shoud see add review view')

    try {
        await driver.hideDeviceKeyboard()
    } catch (e) {

    }
    await driver.click(reviewAddReview)

    const returnFromAddReview = await driver.currentActivity()
    t.equal(returnFromAddReview.value, wineActivityPath, 'User should see wine details view')

    const wineDetailRatin = idFromResourceId('com.gettipsi.tipsi.dev:id/rating_layout')
    await driver.waitForVisible(wineDetailRatin, 5000)

    const height = await driver.getElementSize(wineDetailRatin, 'height')
    t.ok(height, 'User should see updated rating on wine details view')

    t.comment('04_07 Test if a review can be added and the info is saved')

    await driver.click(wineDetailReviewBtn)
    const addReviewReturnActivity = await driver.currentActivity()
    t.equal(addReviewReturnActivity.value, addReviewActivityPath, 'User should see Add review view')

    await driver.waitForText(reviewNote, 5000)

    const reviewSavedNote = await driver.getText(reviewNote)
    t.equal(reviewSavedNote, TEST_REVIEW_TEXT, `Saved review note should be '${TEST_REVIEW_TEXT}'`)

    // await driver.back() // bug DROID-199

    const backBtn = idFromXPath(`//android.widget.LinearLayout[1]/
      android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
      android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
      android.widget.ImageButton[1]`
    )
    await driver.click(backBtn)

    const returnFromAddReview2 = await driver.currentActivity()
    t.equal(returnFromAddReview2.value, wineActivityPath, 'User should see wine details view')

    t.comment('04_08 Test if review can be edited')

    await driver.click(wineDetailReviewBtn)

    const addReviewReturnActivity2 = await driver.currentActivity()
    t.equal(
        addReviewReturnActivity2.value,
        addReviewActivityPath,
        'User should see Add review view'
    )

    await driver.waitForText(reviewNote, 5000)

    const reviewSavedNote2 = await driver.getText(reviewNote)
    t.equal(reviewSavedNote2, TEST_REVIEW_TEXT, `Saved review note should be '${TEST_REVIEW_TEXT}'`)

    await driver.setValue(reviewNote, TEST_REVIEW_NEW_TEXT);
    await driver.swipeUp(reviewScrollView, 1000)
    await driver.waitForVisible(reviewChooseMealBtn, 3000)
    await driver.click(reviewChooseMealBtn)

    const beforeLastMeal = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.TextView[9]`
    )
    const selectMealActivity2 = await driver.currentActivity()
    t.equal(
        selectMealActivity2.value,
        addMealInfoActivityPath,
        'User should see Add Meal info view'
    )

    await driver.click(beforeLastMeal)
    await driver.waitForVisible(preparationItem, 5000)
    const mealPreparationActivity2 = await driver.currentActivity()
    t.equal(
        mealPreparationActivity2.value,
        addMealPreparationActivityPath,
        'User should see meal preparation view'
    )
    const choosenMealReturn2 = await driver.getText(preparationItem)
    await driver.click(preparationItem)
    await driver.swipeUp(reviewScrollView, 1000)
    await driver.waitForVisible(reviewChoosenFood, 5000)

    const returnRevAct2 = await driver.currentActivity()
    t.equal(returnRevAct2.value, addReviewActivityPath, 'User should see add review view')

    const selectedMeal2 = await driver.getText(reviewChoosenFood)
    t.equal(choosenMealReturn2, selectedMeal2, `User should see selected meal '${selectedMeal}'`)

    await driver.click(reviewChooseRestaurantBtn)

    try {
        await driver.waitForVisible(nearbySearchBtn, 5000)
    } catch (e) {
        await driver.back()
    }
    const nearByActivity2 = await driver.currentActivity()
    t.equal(nearByActivity2.value, nearbyActivityPath, 'User should see near by view')

    await driver.waitForVisible(restaurantList, 3000)
    await driver.swipeUp(restaurantList, 1500)

    await driver.setGeoLocation({
        latitude: FAKE_LAT,
        longitude: FAKE_LON,
        altitude: 1,
    })

    await driver.click(nearbySearchBtn)
    await driver.waitForVisible(nearbySearchField, 5000)

    const nearbyItem2 = idFromXPath(`//android.widget.LinearLayout[1]/
        android.widget.FrameLayout[1]/android.view.ViewGroup[1]/
        android.widget.FrameLayout[2]/android.support.v4.widget.DrawerLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.LinearLayout[2]`
    )
    await driver.click(nearbyItem2)

    const fromNearBy3 = await driver.currentActivity()
    t.equal(fromNearBy3.value, addReviewActivityPath, 'User shoud see add review view')

    try {
        await driver.hideDeviceKeyboard();
    } catch (e) {
        // do nothing
    }

    await driver.click(reviewAddReview)

    const returnFromAddReview3 = await driver.currentActivity()
    t.equal(returnFromAddReview3.value, wineActivityPath, 'User should see wine details view')

    await driver.click(wineDetailReviewBtn)

    await driver.waitForVisible(reviewNote, 5000)
    const reviewNodeText3 = await driver.getText(reviewNote)

    t.equal(reviewNodeText3, TEST_REVIEW_NEW_TEXT, 'User should see updated review')

    await driver.click(backBtn)

    t.comment('04_09 Test if it’s impossible to leave empty review')

    const returnFromAddReview4 = await driver.currentActivity()
    t.equal(returnFromAddReview4.value, wineActivityPath, 'User should see wine details view')

    await driver.click(wineDetailReviewBtn)

    const fromNearBy4 = await driver.currentActivity()
    t.equal(fromNearBy4.value, addReviewActivityPath, 'User shoud see add review view')

    await driver.setValue(reviewNote, '')
    await driver.hideDeviceKeyboard()

    await driver.click(reviewAddReview)

    const okBtnId = idFromResourceId('android:id/button3')
    await driver.waitForVisible(okBtnId, 2000)
    await driver.click(okBtnId)

    await driver.click(backBtn)

    const okId = idFromResourceId('android:id/button1')
    await driver.waitForVisible(okId, 2000)
    t.pass('User should see discard dialog')

    await driver.click(okId)

    await backToHome()

    t.comment('04_10 Test if search is added to recent searches/is accessible')

    await driver.waitForVisible(btnSearch, 3000)
    await driver.click(btnSearch)

    const searchActivity2 = await driver.currentActivity()
    t.equal(searchActivity2.value, searchActivityPath, 'User should see Search view')

    const recentFirstItem = idFromXPath(`//
      android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
      android.view.ViewGroup[1]/android.widget.FrameLayout[2]/
      android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
      android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
      android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
      android.support.v7.widget.RecyclerView[1]/android.widget.TextView[1]`
    )

    const recentItemText = await driver.getText(recentFirstItem)
    t.equal(
        recentItemText,
        TEST_SEARCH_STRING,
        `User should see added item '${TEST_SEARCH_STRING}' in recent list`
    )
})
