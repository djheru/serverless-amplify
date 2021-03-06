import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions';

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
        this.setState({ notes: [ newNote, ...(this.state.notes.filter(({ id }) => id !== newNote.id)) ]})
    });
    this.updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
      next: ({ value: { data: { onUpdateNote: updatedNote = {} } = {} } = {} }) => 
        this.setState({ notes: this.state.notes.map(note => note.id === updatedNote.id ? updatedNote : note)})
    });
    this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
      next: ({ value: { data: { onDeleteNote: deletedNote = {} } = {} } = {} }) => 
        this.setState({ notes: this.state.notes.filter(({ id }) => id !== deletedNote.id) })
    });
  }

  componentWillUnmount() {
    this.createNoteListner.unsubscribe();
    this.updateNoteListener.unsubscribe();
    this.deleteNoteListener.unsubscribe();
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
        this.setState({ note: '' });
      }
    } catch (e) {
      console.log('Error saving note', e);
    }
  }

  handleUpdateNote = async (id, note) => {
    try {
      const { id, note } = this.state;
      const input = { id, note };
      await API.graphql(graphqlOperation(updateNote, { input }));
    } catch (e) {
      console.log('Error updating note', e);
    }
  }

  handleDeleteNote = async noteId => {
    try {
      const input = { id: noteId };
      await API.graphql(graphqlOperation(deleteNote, { input }));
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
