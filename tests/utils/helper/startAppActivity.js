export default function (appActivity) {
    return this.driver.startActivity({
        appPackage: this.config.apkPackage,
        appActivity,
    })
}
