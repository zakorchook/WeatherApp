import init from './init'
import cache from './cache'
import login from './login'
import logout from './logout'
import backToHome from './backToHome'
import createMenuButtonId from './createMenuButtonId'
import isSorted from './isSorted'
import findItemsInList from './findItemsInList'
import doUntilVisible from './doUntilVisible'
import doUntilNotVisible from './doUntilNotVisible'
import getChildText from './getChildText'
import getChildDesc from './getChildDesc'
import release from './release'
import noThrow from './noThrow'
import startAppActivity from './startAppActivity'
import pushFileToDevice from './pushFileToDevice'
import pullFileFromDevice from './pullFileFromDevice'
import getAttr from './getAttr'
import mapOverVisible from './mapOverVisible'
import skywalker from './skywalker'
import swipe from './swipe'

class Helper {
    driver = null
    config = {}

    cache = cache

    init = config => init.call(this, config)

    release = () => release.call(this)

    idFromXPath = xpath => xpath.replace(/\s+/g, '', '')

    idFromResourceId = resourceId => `//*[@resource-id="${resourceId}"]`

    idFromText = text => `//*[@text="${text}"]`

    doUntilVisible = (visibleId, action, a) => doUntilVisible.call(this, visibleId, action, a)

    doUntilNotVisible = (visibleId, action, a) => doUntilNotVisible.call(this, visibleId, action, a)

    findItemsInList = (options) => findItemsInList.call(this, options)

    getChildText = (parentElement, childId) => getChildText.call(this, parentElement, childId)

    getChildDesc = (parentElement, childId) => getChildDesc.call(this, parentElement, childId)

    isSorted = (array, predicate) => isSorted.call(this, array, predicate)

    noThrow = func => noThrow.call(this, func)

    startAppActivity = appActivity => startAppActivity.call(this, appActivity)

    pushFileToDevice = (from, to) => pushFileToDevice.call(this, from, to)

    pullFileFromDevice = (filePath) => pullFileFromDevice.call(this, filePath)

    login = () => login.call(this)

    logout = () => logout.call(this)

    backToHome = () => backToHome.call(this)

    createMenuButtonId = id => createMenuButtonId.call(this, id)

    getAttr = (xpath, attributeName) => getAttr.call(this, xpath, attributeName)

    mapOverVisible = (array, callback) => mapOverVisible.call(this, array, callback)

    skywalker = (parent, child, cb, isDone) => skywalker.call(this, parent, child, cb, isDone)

    swipe = ({x1, y1, x2, y2}) => swipe.call(this, {x1, y1, x2, y2})
}

// This is singleton
export default new Helper()
