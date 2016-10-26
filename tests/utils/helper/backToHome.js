// Returns to the Home Activity
export default async function () {
    const homeMenuActivity = 'com.gettipsi.tipsi.ui.activity.HomeActivity'
    const homeMenuId = this.idFromResourceId('com.gettipsi.tipsi.dev:id/home_item_grid')

    let homeActivityIsVisible = false

    // Unexpected case
    // Why this here?
    //
    // When we started application while testing
    // and see signin activity, it's not first activity,
    // because first loaded activity is HomeActivity.
    // It's strange, but .pause() helps the Appium read
    // correct activity (which currently present)
    //
    // How to see a bug (or not)?
    // Comment next line and start 07 test-suite separately
    // by defining TEST_CASES_PATH environment variable
    await this.driver.pause(2000)

    do {
        const { value } = await this.driver.currentActivity()

        if (!value || (value && !value.startsWith('com.gettipsi'))) {
            await this.release()
        } else if (value === homeMenuActivity) {
            homeActivityIsVisible = true
        } else {
            await this.driver.back()
        }
    } while (!homeActivityIsVisible)

    await this.driver
        .waitForVisible(homeMenuId, 5000)
        .swipeDown(homeMenuId, 1000)
}
