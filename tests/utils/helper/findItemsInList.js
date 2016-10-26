export default async function (options) {
    const {
        listId = '',
        retriveItems = () => [],
        shouldNextSwipe = (prevItems, nextItems, items) => true, // eslint-disable-line no-unused-vars, max-len
        mergeItems = (items, nextItems) => items.push(...nextItems),
        swipeSpeed = 300,
    } = options

    let isEndOfList = false
    let items = await retriveItems()
    let prevItems = items

    do {
        await this.driver.swipeUp(listId, swipeSpeed)
        const nextItems = await retriveItems()
        isEndOfList = await shouldNextSwipe(prevItems, nextItems, items)
        items = await mergeItems(items, nextItems)
        prevItems = nextItems
    } while (!isEndOfList)

    return items
}
