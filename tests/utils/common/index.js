import Test from 'tape-async'
import helper from '../helper'
import searchDrink from './searchDrink'

const {
    driver,
    idFromResourceId,
} = helper

class Common {
    t = new Test()

    driver = driver

    idFromResourceId = idFromResourceId

    searchDrink = string => searchDrink.call(this, string)
}

export default new Common()
