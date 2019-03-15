import React, { useState, useEffect } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions';

const App = () => {
  const [id, setId ] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    getNotes();
    const createNoteListner = API.graphql(graphqlOperation(onCreateNote)).subscribe({
      next: ({ value: { data: { onCreateNote: newNote = {} } = {} } = {} }) => 
        setNotes(prevNotes => [ newNote, ...(prevNotes.filter(({ id }) => id !== newNote.id)) ])
    });
    const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
      next: ({ value: { data: { onUpdateNote: updatedNote = {} } = {} } = {} }) => 
        (setNotes(prevNotes => prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note)) || setNote('') || setId(''))
    });
    const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
      next: ({ value: { data: { onDeleteNote: deletedNote = {} } = {} } = {} }) => 
        (setNotes(prevNotes => prevNotes.filter(({ id }) => id !== deletedNote.id)) || setNote('') || setId(''))
    });

    // Return a function to handle cleanup
    return () => {
      createNoteListner.unsubscribe();
      updateNoteListener.unsubscribe();
      deleteNoteListener.unsubscribe();
    };
  }, []);

  const getNotes = async () => {
    try {
      const result = await API.graphql(graphqlOperation(listNotes));
      const { data: { listNotes: { items: notes = [] } = {} } = {} } = result;
      setNotes(notes)
    } catch (e) {
      console.log('Error retrieving notes', e)
    }
  }

  const handleChangeNote = ({ target: { value: note = '' } = {} } = {}) => setNote(note);

  const hasExistingNote = () => {
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) >= 0;
      return isNote;
    }
    return false;
  }

  const handleAddNote = async event => {
    event.preventDefault();
    const input = { note };
    try {
      if (hasExistingNote()) {
        handleUpdateNote()
      } else {
        await API.graphql(graphqlOperation(createNote, { input }));
        setNote('');
      }
    } catch (e) {
      console.log('Error saving note', e);
    }
  }

  const handleUpdateNote = async () => {
    try {
      const input = { id, note };
      await API.graphql(graphqlOperation(updateNote, { input }));
    } catch (e) {
      console.log('Error updating note', e);
    }
  }

  const handleDeleteNote = async noteId => {
    try {
      const input = { id: noteId };
      await API.graphql(graphqlOperation(deleteNote, { input }));
    } catch (e) {
      console.log('error deleting note', e);
    }
  }
  
  const handleSetNote = async ({ note, id }) => (setNote(note) || setId(id));

  return (
    <div className="flex flex-column items-center juistify-center pa3 bg-washed-red">
      <h1 className="code f2-l">
        Amplify Notetaker
      </h1>
      <form onSubmit={handleAddNote} className="mb3">
        <input 
          className="pa2 f4" 
          type="text" 
          placeholder="Enter note" 
          value={note}
          onChange={handleChangeNote} />
        <button className="pa2 f4" type="submit">{id ? 'Update Note' : 'Add Note' }</button>
      </form>

      <div>
        {notes.map(note => (
          <div key={note.id} className="flex items-center">
            <li className="list pa1 f3" onClick={() => handleSetNote(note)}>
              { note.note}
            </li>
            <button className="bg-transparent bn f4" onClick={() => handleDeleteNote(note.id)}>
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { 
  includeGreetings: true
});
