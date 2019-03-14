import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';

class App extends Component {

  state = {
    note: '',
    notes: []
  };

  async componentDidMount() {
    try {
      const result = await API.graphql(graphqlOperation(listNotes));
      const { data: { listNotes: { items: notes = [] } = {} } = {} } = result;
      this.setState({ notes });
    } catch (e) {
      console.log('Error retrieving notes', e)
    }
  }

  handleChangeNote = ({ target: { value: note = '' } = {} } = {}) => this.setState({ note });

  handleAddNote = async event => {
    const { note, notes } = this.state;
    event.preventDefault();
    const input = { note };
    try {
      const result = await API.graphql(graphqlOperation(createNote, { input }));
      const { data: { createNote: newNote = '' } = {} } = result;
      const newNotes = [newNote, ...notes ];
      this.setState({notes: newNotes, note: ''});
    } catch (e) {
      console.log('Error saving note', e);
    }
  }

  handleDeleteNote = async noteId => {
    try {
      const { notes } = this.state;
      const input = { id: noteId };
      const result = await API.graphql(graphqlOperation(deleteNote, { input }));
      const { data: { deleteNote: { id = '' } = {} } = {} } = result;
      const updatedNotes = notes.filter(note => note.id !== id);
      this.setState({ notes: updatedNotes });
    } catch (e) {
      console.log('error deleting note', e);
    }
  }

  render() {
    const { note, notes } = this.state;

    return (
      <div className="flex flex-column items-center juistify-center pa3 bg-washed-red">
        <h1 className="code f2-l">
          Amplify Notetaker
        </h1>
        <form onSubmit={this.handleAddNote} className="mb3">
          <input 
            className="pa2 f4" 
            type="text" 
            placeholder="Enter note" 
            value={note}
            onChange={this.handleChangeNote} />
          <button className="pa2 f4" type="submit">Add Note</button>
        </form>

        <div>
          {notes.map(note => (
            <div key={note.id} className="flex items-center">
              <li className="list pa1 f3">
                { note.note}
              </li>
              <button className="bg-transparent bn f4" onClick={() => this.handleDeleteNote(note.id)}>
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
