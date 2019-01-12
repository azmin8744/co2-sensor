import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { State, Action } from '../../store'
import { fetch, update, QuerySnapshot, ConcentrationRecord } from '../modules/concentration';
import { Concentration } from './concentration';
import * as firebase from 'firebase';

export class ActionDispatcher {
    constructor(private dispatch: (action: Action) => void) {}

    public async fetchData(dataRange: number) :Promise<void> {
        const fetchAction = await fetch(dataRange);
        return Promise.resolve(this.dispatch(fetchAction));
    }

    public receiveNewRecord(records: Array<ConcentrationRecord>, newRecord: QuerySnapshot) :void{
        this.dispatch(update(records, newRecord));
    }
}

export default connect(
    (state: State) => ({
        data: state.concentration
    }),
    (dispatch: Dispatch<Action>) => ({ actions: new ActionDispatcher(dispatch) })
)(Concentration);