export default async function getAttr(xpath, attributeName) {
    return await this.driver.getAttribute(xpath, attributeName)
}
