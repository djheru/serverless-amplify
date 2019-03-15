import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import { onCreateNote } from './graphql/subscriptions';

class App extends Component {

  state = {
    id: '',
    note: '',
    notes: []
  };

  componentDidMount() {
    this.getNotes();
    this.createNoteListner = API.graphql(graphqlOperation(onCreateNote)).subscribe({
      next: ({ value: { data: { onCreateNote: newNote = {} } = {} } = {} }) => 
        this.setState({ notes: [ newNote, ...(this.state.notes.filter(note => note.id !== newNote.id)) ]})
      // {
      //   const newNote = data.onCreateNote;
      //   const prevNotes = this.state.notes.filter(note => note.id !== newNote.id);
      //   const updatedNotes = [...prevNotes, newNote];
      //   this.setState({ notes: updatedNotes});
      // }
    })
  }

  componentWillUnmount() {
    this.createNoteListner.unsubscribe();
  }

  getNotes = async () => {
    try {
      const result = await API.graphql(graphqlOperation(listNotes));
      const { data: { listNotes: { items: notes = [] } = {} } = {} } = result;
      this.setState({ notes });
    } catch (e) {
      console.log('Error retrieving notes', e)
    }
  }

  handleChangeNote = ({ target: { value: note = '' } = {} } = {}) => this.setState({ note });

  hasExistingNote = () => {
    const { notes, id } = this.state;
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) >= 0;
      return isNote;
    }
    return false;
  }

  handleAddNote = async event => {
    const { note } = this.state;
    event.preventDefault();
    const input = { note };
    try {
      if (this.hasExistingNote()) {
        this.handleUpdateNote()
      } else {
        await API.graphql(graphqlOperation(createNote, { input }));
        // const { data: { createNote: newNote = '' } = {} } = result;
        // const newNotes = [newNote, ...notes ];
        // this.setState({notes: newNotes, note: ''});
        this.setState({ note: '' });
      }
    } catch (e) {
      console.log('Error saving note', e);
    }
  }

  handleUpdateNote = async (id, note) => {
    try {
      const { id, note, notes } = this.state;
      const input = { id, note };
      const result = await API.graphql(graphqlOperation(updateNote, { input }));
      const { data: { updateNote: updatedNote = {} } = {} } = result
      const index = notes.findIndex(note => note.id === updatedNote.id);
      const updatedNotes = [
        ...notes.slice(0, index),
        updatedNote,
        ...notes.slice(index+1)
      ];
      this.setState({ notes: updatedNotes, note: '', index: '' });
    } catch (e) {
      console.log('Error updating note', e);
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
  
  handleSetNote = async ({ note, id }) => this.setState({ note, id });

  render() {
    const { id, note, notes } = this.state;

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
          <button className="pa2 f4" type="submit">{id ? 'Update Note' : 'Add Note' }</button>
        </form>

        <div>
          {notes.map(note => (
            <div key={note.id} className="flex items-center">
              <li className="list pa1 f3" onClick={() => this.handleSetNote(note)}>
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
