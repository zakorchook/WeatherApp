export default async function (parentElement, childId) {
    const child = await this.driver.elementIdElement(
      parentElement,
      childId
    )
    const text = await this.driver.elementIdText(child.value.ELEMENT)

    return text.value
}
