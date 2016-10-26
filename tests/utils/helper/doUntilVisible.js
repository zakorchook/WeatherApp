export default async function (visibleId, action = () => {}, attempts = 100) {
    let isVisible = true
    let left = attempts

    do {
        try {
            await this.driver.getLocation(visibleId)
            await action()
            left--
        } catch (error) {
            isVisible = false
        }
        if (left === 0) {
            throw new Error(
                `doUntilVisible #id: ${visibleId} the maximum ` +
                `number of attempts (${attempts}) left`
            )
        }
    } while (isVisible)
}
