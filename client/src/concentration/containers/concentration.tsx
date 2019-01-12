import * as React from 'react';
import { Line, ChartData } from 'react-chartjs-2';
import { CO2State, ConcentrationRecord, collection, QuerySnapshot } from '../modules/concentration';
import { ActionDispatcher } from './container';

interface Props {
    data: CO2State;
    actions: ActionDispatcher;
}

interface State {
    dataRange: number
}

export class Concentration extends React.Component<Props, State, {}> {
    constructor(props: Props) {
        super(props);
        this.state = {
            dataRange: 2
        };

        this.handleDataRangeChange = this.handleDataRangeChange.bind(this);
    }

    sortRecordsByTimestamp(records: Array<ConcentrationRecord>): Array<ConcentrationRecord> {
        return records.sort((record, otherRecord) => {
            if (record.timestamp.getTime() > otherRecord.timestamp.getTime()) {
                return 1;
            }
            return 0;
        });
    }

    labels(records: Array<ConcentrationRecord>): Array<String> {
        return this.sortRecordsByTimestamp(records).map((record, index) => record.timestamp.toLocaleString());
    }

    chartData(): ChartData<Object> {
        return {
            labels: this.labels(this.props.data.records),
            datasets:[{
                label: 'CO2 concentration',
                data: this.sortRecordsByTimestamp(this.props.data.records)
                    .map(r => { return { x: r.timestamp, y: r.concentration }})
            }]
        }
    }
    
    componentWillMount() {
        this.props.actions.fetchData(this.state.dataRange);
        const collectionRef = collection();
        collectionRef.onSnapshot((query: QuerySnapshot) => {
            this.props.actions.receiveNewRecord(this.props.data.records, query);
        });
    }

    handleDataRangeChange(event: { target: { value: any; }; }) {
        this.setState({ dataRange: event.target.value });
        this.props.actions.fetchData(event.target.value);
    }

    render() {
        return (
            <div>
                <div>
                    <select value={this.state.dataRange.toString()} onChange={this.handleDataRangeChange}>
                        <option value="2">2 Hours</option>
                        <option value="6">6 Hours</option>
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours</option>
                    </select>
                </div>
                <Line data={this.chartData()}/>
            </div>
        )
    }
}