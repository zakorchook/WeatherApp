export default async function (parentElement, childId) {
    const child = await this.driver.elementIdElement(
      parentElement,
      childId
    )
    const desc = await this.driver.elementIdAttribute(
      child.value.ELEMENT,
      'name'
    )

    return desc.value
}
