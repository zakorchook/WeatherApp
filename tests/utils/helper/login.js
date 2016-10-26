const {
  TEST_USERNAME = 'testusertipsi@gmail.com',
  TEST_PASSWORD = 'tipsiasdfjkl',
} = process.env;

// Login user
export default async function () {
    const loginButton = this.createMenuButtonId('Login')
    const loginButtonId = this.idFromResourceId('com.gettipsi.tipsi.dev:id/sign_login_btn')
    const loginWithEmailId = this.idFromResourceId('com.gettipsi.tipsi.dev:id/login_with_email')
    const usernameId = this.idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_username')
    const passwordId = this.idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_password')
    const loginSubmitButtonId =
        this.idFromResourceId('com.gettipsi.tipsi.dev:id/email_login_button')

    await this.backToHome()

    try {
        const buttonText = await this.driver.getText(loginButton)
        if (buttonText === 'Logout') {
            return
        }
    } catch (error) {
         // User not logged in
    }

    await this.driver
        .click(loginButton)
        .click(loginButtonId)
        .click(loginWithEmailId)
        .setValue(usernameId, TEST_USERNAME)
        .setValue(passwordId, TEST_PASSWORD)

    try {
        await this.driver.hideDeviceKeyboard()
    } catch (e) {
        await this.driver.swipeUp(500)
    }

    await this.driver.click(loginSubmitButtonId)
}
