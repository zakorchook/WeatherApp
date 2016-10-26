export default async function () {
    const {driver, backToHome, createMenuButtonId} = this
    const logoutButton = createMenuButtonId('Logout')

    try {
        await driver.waitForVisible(logoutButton, 2000)
    } catch (e) {
        await backToHome()
        await driver.waitForVisible(logoutButton, 2000)
    }

    let IS_LOGGED = await driver.getText(logoutButton)
    IS_LOGGED = IS_LOGGED === 'Logout'

    if (IS_LOGGED) {
        await driver.click(logoutButton).waitForVisible(logoutButton, 2000);
    }
}
