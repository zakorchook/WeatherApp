const {
    DONE_KEY_CODE = 66,
    TEST_SEARCH_STRING = 'Cabernet',
} = process.env

export default async function searchDrink(wineToSearch = TEST_SEARCH_STRING) {
    const searchField = this.idFromResourceId('android:id/search_src_text')
    await this.driver.setValue(searchField, wineToSearch)
    const searchString = await this.driver.getText(searchField)
    this.t.equal(
        searchString,
        wineToSearch,
        `Typed search string should be "${wineToSearch}"`
    )

    await this.driver.pressKeycode(DONE_KEY_CODE)
        .then(({value}) => this.t.ok(value, 'User clicked a search button'))
        .catch(error => this.t.notOk(error, 'User did not click a search button'))

    // const searchResultItemId = this.idFromResourceId('com.gettipsi.tipsi.dev:id/card_layout')
    // await this.driver.waitForVisible(searchResultItemId, 60000)
}
