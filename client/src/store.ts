import concentration, {CO2State, ConcentrationActions} from './concentration/modules/concentration';
import {createStore, combineReducers, Action} from 'redux'

export default createStore(
    combineReducers({
        concentration
    })
)

export type State = {
    concentration: CO2State
}

export type Action = ConcentrationActions | Action