import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote } from './graphql/mutations';

class App extends Component {

  state = {
    note: '',
    notes: []
  };

  handleChangeNote = ({ target: { value: note = '' } = {} } = {}) => this.setState({ note });

  handleAddNote = event => {
    const { note } = this.state;
    event.preventDefault();
    const input = { input: { note } };
    API.graphql(graphqlOperation(createNote, input));
  }

  render() {
    const { notes } = this.state;

    return (
      <div className="flex flex-column items-center juistify-center pa3 bg-washed-red">
        <h1 className="code f2-l">
          Amplify Notetaker
        </h1>
        <form onSubmit={this.handleAddNote} className="mb3">
          <input className="pa2 f4" type="text" placeholder="Enter note" onChange={this.handleChangeNote} />
          <button className="pa2 f4" type="submit">Add Note</button>
        </form>

        <div>
          {notes.map(note => (
            <div key={note.id} className="flex items-center">
              <li className="list pa1 f3">
                { note.note}
              </li>
              <button className="bg-transparent bn f4">
                <span>&times;</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { 
  includeGreetings: true
});
