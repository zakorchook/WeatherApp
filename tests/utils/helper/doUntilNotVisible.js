export default async function (visibleId, action = () => {}, attempts = 100) {
    let isNotVisible = true
    let left = attempts

    do {
        try {
            await this.driver.getLocation(visibleId)
            isNotVisible = false
        } catch (error) {
            await action()
            left--
        }
        if (left === 0) {
            throw new Error(
                `doUntilNotVisible #id: ${visibleId} the maximum ` +
                `number of attempts (${attempts}) left`
            )
        }
    } while (isNotVisible)
}
