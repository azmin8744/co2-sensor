import { Action } from 'redux';
import * as moment from 'moment';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

type FirebaseApp = firebase.app.App;
export type CollectionRef = firebase.firestore.CollectionReference;
export type DocumentSnapshot = firebase.firestore.DocumentSnapshot;
type Timestamp = firebase.firestore.Timestamp;
type Query = firebase.firestore.Query
export type QuerySnapshot = firebase.firestore.QuerySnapshot;
type QueryDocumentSnapshot  = firebase.firestore.QueryDocumentSnapshot;

export type ConcentrationActions = FetchAction | UpdateFinishedAction;

export type ConcentrationRecord = {
    concentration: number;
    timestamp: Date;
}

export interface CO2State {
    records: Array<ConcentrationRecord>;
}

enum ActionNames {
    FETCH = 'concentration/fetch',
    RESET = 'concentration/reset',
    ADD_RECORD = 'concentration/addRecord',
    UPDATED = 'concentration/updated'
}

interface FetchAction extends Action {
    type: ActionNames.FETCH;
    records: Array<ConcentrationRecord>;
}

interface UpdateFinishedAction extends Action {
    type: ActionNames.UPDATED;
    records: Array<ConcentrationRecord>;
    newRecord: QuerySnapshot;
}

export const fetch = async (dataRange: number): Promise<any> => {
    return fetchRecords(dataRange).then((fetchedRecords: Array<ConcentrationRecord>) => {
        return Promise.resolve({ type: ActionNames.FETCH, records: fetchedRecords });
    });
}

export const update = (records: Array<ConcentrationRecord>, newRecord: QuerySnapshot): UpdateFinishedAction => {
    return { type: ActionNames.UPDATED, records, newRecord };
}


async function getSnapshot(query: Query): Promise<QuerySnapshot> {
    return query.get();
}

const getQuery = (collection: CollectionRef, dataRange: number): Query => {
    const unit: moment.unitOfTime.DurationConstructor = 'hours';
    const date2hoursBefore: Date = moment().subtract(dataRange, unit).toDate();
    const timestamp: Timestamp = firebase.firestore.Timestamp.fromDate(date2hoursBefore);
    return collection.where('timestamp', '>', timestamp);
}

export function firebaseApp(): FirebaseApp {
    const config = {
        projectId: 'mh-z19'
    };
    return !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
}

export function collection(): CollectionRef {
    const firestore = firebaseApp().firestore()
    firestore.settings({ timestampsInSnapshots: true })
    return firestore.collection('concentration');
}

const recordsFromDocuments = (documents: Array<QueryDocumentSnapshot>) : Array<ConcentrationRecord> => {
    return documents.map(d => {
        return {
            concentration: d.data().concentration,
            timestamp: d.data().timestamp.toDate()
        }
    }).sort((d, other) => {
        if (d.timestamp > other.timestamp) {
            return 1;
        }
        return 0;
    });
};

async function fetchRecords(dataRange: number): Promise<Array<ConcentrationRecord>>{
    const collectionRef: CollectionRef = collection();
    const snapshot = await getQuery(collectionRef, dataRange).get();
    const records =  recordsFromDocuments(snapshot.docs);
    return Promise.resolve(records);
}

const initialState:CO2State = ({ records: [] });

export default function reducer(state: CO2State = initialState, action: ConcentrationActions): CO2State{
    switch (action.type) {
        case ActionNames.FETCH:
            return { records: action.records };
        case ActionNames.UPDATED:
            const records = action.records;
            const newRecords: Array<ConcentrationRecord> = recordsFromDocuments(action.newRecord.docs);
            records.shift();
            records.push(newRecords[newRecords.length - 1]);
            return { records };
        default:
            return state;
    }
}